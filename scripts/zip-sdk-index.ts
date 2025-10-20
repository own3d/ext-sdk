import * as fs from "node:fs";
import * as path from "node:path";
import archiver from "archiver";

const srcDir = "dist/sdk-index";
const zipPath = "dist/sdk-index.zip";

fs.mkdirSync("dist", { recursive: true });
const output = fs.createWriteStream(zipPath);
const archive = archiver("zip", { zlib: { level: 9 } });

await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
});

console.log(`Zipped ${srcDir} → ${zipPath}`);
