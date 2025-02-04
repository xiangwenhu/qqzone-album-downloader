import path from "path";
import fs from "fs";
const SRC_ROOT = path.join(__dirname, "../src");
const DIST_ROOT = path.join(__dirname, "../dist");

function copyConfig() {
    const srcConfigRoot = path.join(SRC_ROOT, "config");
    const distConfigRoot = path.join(DIST_ROOT, "config");
    const files = fs.readdirSync(srcConfigRoot);

    if (!fs.existsSync(distConfigRoot)) {
        fs.mkdirSync(distConfigRoot);
    }

    for (let i = 0; i < files.length; i++) {
        const fileName: string = files[i];
        if (fileName.endsWith(".ts")) {
            continue;
        }
        const filePath = path.join(srcConfigRoot, fileName);
        const distPath = path.join(distConfigRoot, fileName);
        const writeStream = fs.createWriteStream(distPath);
        fs.createReadStream(filePath).pipe(writeStream);
    }
}

copyConfig();
