import 'dotenv/config'
import OpenAI from "openai";
import * as fs from "node:fs";
import * as path from "node:path";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function listMarkdownFiles(dir: string) {
    return fs.readdirSync(dir)
        .filter(f => f.toLowerCase().endsWith(".md"))
        .map(f => path.join(dir, f));
}

function chunk<T>(arr: T[], size: number) {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

const VECTOR_STORE_NAME = process.env.SDK_VECTOR_STORE_NAME ?? "my-sdk-index";
const VECTOR_STORE_ID = process.env.SDK_VECTOR_STORE_ID;

(async () => {
    // 1) Create or reuse store
    const store = VECTOR_STORE_ID
        ? { id: VECTOR_STORE_ID }
        : await client.vectorStores.create({ name: VECTOR_STORE_NAME });

    // --- 👇 Add this block right here 👇 ---
    // Optional wipe: remove existing files before upload
    console.log("Clearing existing files from vector store...");
    const current = await client.vectorStores.files.list(store.id, {
        limit: 100
    });
    for (const file of current.data) {
        console.log(`Deleting ${file.id}...`);
        await client.vectorStores.files.delete(file.id, {
            vector_store_id: store.id
        });
        await client.files.delete(file.id);
    }
    console.log("Vector store cleared.\n");
    // --- 👆 End wipe block 👆 ---

    // 2) Gather and upload markdown files
    const dir = "ai-dist/sdk-index";
    const files = listMarkdownFiles(dir);
    if (files.length === 0) {
        console.error(`No .md files found in ${dir}. Did you run the indexer?`);
        process.exit(1);
    }

    const batches = chunk(files, 200);
    for (const [i, group] of batches.entries()) {
        const streams = group.map(p => fs.createReadStream(p));
        const batch = await client.vectorStores.fileBatches.uploadAndPoll(store.id, { files: streams });
        if (batch.status !== "completed") {
            console.error("Batch failed or incomplete:", batch);
            process.exit(1);
        }
        console.log(`Uploaded batch ${i + 1}/${batches.length}`);
    }

    console.log("SDK_VECTOR_STORE_ID=", store.id);
})();
