import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
const tokens = JSON.parse(await readFile('src/control-room-tokens.json', 'utf8'));
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
// Explicit export allowlist. No recursive copying of source trees or host files.
for (const file of ['index.html', 'app.mjs', 'model.mjs', 'favicon.svg']) await copyFile(`src/${file}`, `dist/${file}`);
const colors = ':root{' + Object.entries(tokens.colors).map(([key, value]) => `--${key}:${value}`).join(';') + '}\n';
await writeFile('dist/style.css', colors + await readFile('src/style.css', 'utf8'));
await writeFile('dist/navigation.mjs', `export default ${JSON.stringify(tokens.nav)};\n`);
console.log('Build: 6 allowlisted files; no source maps, no external assets.');
