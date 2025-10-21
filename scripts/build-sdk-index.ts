// scripts/build-sdk-index.ts
import { Project, JSDocTag, InterfaceDeclaration, Node } from "ts-morph";
import * as fs from "node:fs";
import * as path from "node:path";

type MemberDoc = { name: string; type: string; jsDoc: string };
type Item = {
    symbol: string;
    kind: "function" | "class" | "interface" | "type" | "enum" | "namespace";
    file: string;
    signature?: string;
    returns?: string;
    params?: Array<{ name: string; type: string; optional: boolean }>;
    jsDoc?: string;
    examples?: string[];
    since?: string;
    deprecated?: boolean;
    version?: string;
    members?: MemberDoc[];
    values?: string[]; // added: for union type literal values (e.g. NotifySubType)
};

function readPkgVersion() {
    try {
        return JSON.parse(fs.readFileSync("package.json", "utf8")).version as string | undefined;
    } catch {
        return undefined;
    }
}

const version = readPkgVersion();
const outDir = "ai-dist/sdk-index";
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
// safety net for monorepos/unusual includes
project.addSourceFilesAtPaths(["src/**/*.ts", "src/**/*.tsx"]);

const items: Item[] = [];
const seenSymbols = new Set<string>();

// --- helpers ---------------------------------------------------------------

/** Safely coerce any value (including arrays/objects) to a readable string. */
function asString(v: unknown): string {
    if (typeof v === "string") return v;
    if (v == null) return "";
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return String(v);
    }
}

/** Extract clean doc text, tags, and fenced examples from a node's JSDoc. */
function getDoc(node: any) {
    const docs = node.getJsDocs?.() ?? [];
    // Use getCommentText() to avoid WriterFunctions / AST objects leaking in.
    const parts: string[] = [];
    for (const d of docs) {
        const txt = d.getCommentText?.();
        if (typeof txt === "string" && txt.trim().length) parts.push(txt.trim());
    }
    const text = parts.join("\n").trim();

    const tags: Record<string, string> = Object.fromEntries(
        docs
            .flatMap((d: any) => d.getTags())
            .map((t: JSDocTag) => [t.getTagName(), (t.getCommentText?.() ?? "").toString()])
    );

    const examples: string[] = [];
    for (const d of docs) {
        const inner = d.getInnerText?.() ?? "";
        // pull out fenced code blocks
        const re = /```(?:ts|tsx|js)?\n([\s\S]*?)```/g;
        for (const m of inner.matchAll(re)) {
            examples.push((m[1] ?? "").toString().trim());
        }
    }

    return { text, tags, examples };
}

function makeSignature(fnLike: any) {
    const params = fnLike.getParameters().map((p: any) => {
        const opt = p.hasQuestionToken?.() ? "?" : "";
        return `${p.getName()}${opt}: ${p.getType().getText(fnLike)}`;
    });
    const ret = fnLike.getReturnType().getText(fnLike);
    return `(${params.join(", ")}) => ${ret}`;
}

function collectInterfaceMembers(intf: InterfaceDeclaration): MemberDoc[] {
    return intf.getMembers().map((m: any) => {
        const md = getDoc(m);
        const name = m.getName?.() ?? "";
        let typeText;
        try {
            typeText = m.getType?.().getText(m) ?? "";
        } catch {
            try {
                typeText = (m as Node).getText?.() ?? "";
            } catch {
                typeText = "";
            }
        }
        return { name, type: typeText, jsDoc: md.text || "" };
    });
}

function pushItem(item: Item) {
    if (seenSymbols.has(item.symbol)) return;
    seenSymbols.add(item.symbol);
    items.push(item);
}

// --- indexing --------------------------------------------------------------

for (const sf of project.getSourceFiles()) {
    const file = path.relative(process.cwd(), sf.getFilePath());
    const exps = sf.getExportedDeclarations();

    // Track type strings referenced by exported APIs in this file
    const referencedTypeStrings = new Set<string>();

    exps.forEach((decls, exportName) => {
        for (const decl of decls) {
            const kind = decl.getKindName?.() ?? "";

            // Function
            if (kind === "FunctionDeclaration") {
                const d = getDoc(decl);
                const signature = makeSignature(decl);
                const returns = (decl as any).getReturnType().getText(decl);

                pushItem({
                    kind: "function",
                    symbol: exportName,
                    file,
                    signature,
                    returns,
                    jsDoc: d.text,
                    examples: d.examples,
                    since: d.tags?.since,
                    deprecated: "deprecated" in (d.tags ?? {}),
                    version,
                });

                referencedTypeStrings.add(signature);
                referencedTypeStrings.add(returns);
                (decl as any).getParameters().forEach((p: any) => {
                    try {
                        referencedTypeStrings.add(p.getType().getText(decl));
                    } catch {}
                });
                continue;
            }

            // Class (+ ctor + methods)
            if (kind === "ClassDeclaration") {
                const dc = getDoc(decl);
                pushItem({
                    kind: "class",
                    symbol: exportName,
                    file,
                    jsDoc: dc.text,
                    examples: dc.examples,
                    since: dc.tags?.since,
                    deprecated: "deprecated" in (dc.tags ?? {}),
                    version,
                });

                const ctor = (decl as any).getConstructors()[0];
                if (ctor) {
                    const dd = getDoc(ctor);
                    const sig = makeSignature(ctor);
                    pushItem({
                        kind: "function",
                        symbol: `${exportName}.constructor`,
                        file,
                        signature: sig,
                        returns: "instance",
                        jsDoc: dd.text,
                        examples: dd.examples,
                        since: dc.tags?.since,
                        deprecated: "deprecated" in (dc.tags ?? {}),
                        version,
                    });
                    referencedTypeStrings.add(sig);
                    (ctor as any).getParameters().forEach((p: any) => {
                        try {
                            referencedTypeStrings.add(p.getType().getText(ctor));
                        } catch {}
                    });
                }

                for (const m of (decl as any).getMethods()) {
                    const dm = getDoc(m);
                    const sig = makeSignature(m);
                    const ret = (m as any).getReturnType().getText(m);
                    pushItem({
                        kind: "function",
                        symbol: `${exportName}.${m.getName()}`,
                        file,
                        signature: sig,
                        returns: ret,
                        jsDoc: dm.text,
                        examples: dm.examples,
                        since: dc.tags?.since,
                        deprecated: "deprecated" in (dc.tags ?? {}),
                        version,
                    });
                    referencedTypeStrings.add(sig);
                    referencedTypeStrings.add(ret);
                    (m as any).getParameters().forEach((p: any) => {
                        try {
                            referencedTypeStrings.add(p.getType().getText(m));
                        } catch {}
                    });
                }
                continue;
            }

            // Interface / Type / Enum / Namespace
            const table: Record<string, Item["kind"]> = {
                InterfaceDeclaration: "interface",
                TypeAliasDeclaration: "type",
                EnumDeclaration: "enum",
                ModuleDeclaration: "namespace",
            };
            const mapped = table[kind as keyof typeof table];
            if (mapped) {
                const d = getDoc(decl);
                if (mapped === "interface") {
                    const members = collectInterfaceMembers(decl as InterfaceDeclaration);
                    pushItem({
                        kind: mapped,
                        symbol: exportName,
                        file,
                        jsDoc: d.text,
                        examples: d.examples,
                        since: d.tags?.since,
                        deprecated: "deprecated" in (d.tags ?? {}),
                        version,
                        members,
                    });
                } else if (mapped === "type") {
                    // Attempt to extract string-literal union members for better docs
                    let values: string[] | undefined = undefined;
                    try {
                        // Prefer the type node text which preserves literal unions reliably
                        const typeNodeText = (decl as any).getTypeNode?.()?.getText?.() ?? null;
                        const typeTextFallback = (decl as any).getType?.()?.getText?.(decl) ?? null;
                        const rawText = typeNodeText ?? typeTextFallback ?? (decl as any).getText?.() ?? "";
                        const matches = Array.from(rawText.matchAll(/['"]([^'"\\]+(?:\\.[^'"\\]*)*)['"]/g)).map((m) => m[1]);
                        if (matches.length) values = matches;
                    } catch {
                        // fallback: nothing
                    }

                    pushItem({
                        kind: mapped,
                        symbol: exportName,
                        file,
                        jsDoc: d.text,
                        examples: d.examples,
                        since: d.tags?.since,
                        deprecated: "deprecated" in (d.tags ?? {}),
                        version,
                        values,
                    });
                } else {
                    pushItem({
                        kind: mapped,
                        symbol: exportName,
                        file,
                        jsDoc: d.text,
                        examples: d.examples,
                        since: d.tags?.since,
                        deprecated: "deprecated" in (d.tags ?? {}),
                        version,
                    });
                }
            }
        }
    });

    // Include non-exported interfaces referenced by exported APIs
    const interfaces = sf.getInterfaces();
    for (const intf of interfaces) {
        if (intf.isExported()) continue; // already covered
        const name = intf.getName();
        const isReferenced = Array.from(referencedTypeStrings).some((t) => t.includes(name));
        if (!isReferenced) continue;

        const d = getDoc(intf);
        const members = collectInterfaceMembers(intf);
        pushItem({
            kind: "interface",
            symbol: name,
            file,
            jsDoc: d.text,
            examples: d.examples,
            since: d.tags?.since,
            deprecated: "deprecated" in (d.tags ?? {}),
            version,
            members,
        });
    }
}

// --- emit markdown ---------------------------------------------------------

function safeName(symbol: string) {
    return symbol.replace(/[^\w.-]+/g, "_").slice(0, 200);
}

for (const it of items) {
    // header is unused; we previously printed it but currently we don't need it

    let body = `
# [SDK] ${it.symbol} ${it.version ? `(v${it.version})` : ""}

**Kind:** ${it.kind}  
**File:** ${it.file.replace(/\\/g, "/")}  
**Since:** ${it.since ?? "-"}  
**Deprecated:** ${it.deprecated ? "yes" : "no"}

---

## Signature
${it.signature ? "`" + it.signature + "`" : "_n/a_"}

## Returns
${it.returns ?? "_n/a_"}

## Description
${(asString(it.jsDoc).trim() || "_No JSDoc available._")}
`.trim();

    if (it.kind === "interface" && Array.isArray(it.members) && it.members.length) {
        body += `

## Members
${it.members
            .map((m) => `### ${m.name}
\`${m.type}\`
${(asString(m.jsDoc).trim() || "")}`)
            .join("\n\n")}
`;
    }

    // Emit literal values for union types (e.g. NotifySubType)
    if (it.kind === "type" && Array.isArray(it.values) && it.values.length) {
        body += `

## Values
${it.values.map((v) => `- \`${v}\``).join("\n")}
`;
    }

    if ((it.examples?.length ?? 0) > 0) {
        body += `

## Examples
${it.examples!.map((e) => "```ts\n" + e + "\n```").join("\n\n")}
`;
    }

    fs.writeFileSync(path.join(outDir, `${safeName(it.symbol)}.md`), body.trim() + "\n", "utf8");
}

console.log(`Wrote ${items.length} symbol files → ${outDir}`);
