import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const filesToCopy = ['script.js', 'firebase-config.js', '.nojekyll'];
const assetFiles = ['assets/Andrew_Makarevich_Resume.pdf', 'assets/andrew-astronaut-face.jpg'];

const indexPath = path.join(root, 'index.html');
const stylePath = path.join(root, 'style.css');

const indexHtml = await readFile(indexPath, 'utf8');
const styleCss = await readFile(stylePath, 'utf8');

const styleTag = `<style>\n${styleCss}\n</style>`;
const builtHtml = indexHtml.replace('<link rel="stylesheet" href="style.css" />', styleTag);

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
await writeFile(path.join(dist, 'index.html'), builtHtml, 'utf8');

for (const file of filesToCopy) {
  await copyFile(path.join(root, file), path.join(dist, file));
}

for (const file of assetFiles) {
  await copyFile(path.join(root, file), path.join(dist, file));
}
