import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imgDir = path.join(root, 'public/img');
await mkdir(imgDir, { recursive: true });

const assets = [
  {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=85',
    file: 'auth-bg.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1080&h=1920&fit=crop&q=85',
    file: 'joggers-bg.jpg',
  },
];

for (const { url, file } of assets) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(imgDir, file), buf);
  console.log('OK', file);
}
