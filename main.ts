// GTA 6 trophy guide entry (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html opens it,
// app.js runs it, style.css styles it, and data/trophies.json plus
// data/roadmap.json hold the trophy list, the guides and the platinum
// roadmap. Nothing in app/ is built, bundled or fetched from the network.
//
// This program is the handover: it copies app/ and screenshots/ from the
// repository into the output directory and writes dossier.json there with
// the vendored make.fun library, so the scorer and the judge can read the
// entry from one place. Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's copy and stays untouched: the
// scorer rebuilds the dossier with its own copy and compares the bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function countShots() {
  const dir = join(repoRoot, 'screenshots');
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((name) => !name.startsWith('.')).length;
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

const shots = countShots();
if (shots < 3 || shots > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots}`);
}
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots, one over 256 KiB, more than 993 files and directories in
// app/, or 48 MiB of app files in all.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`handed in ${shots} screenshots and app/ to ${outputDir}`);
