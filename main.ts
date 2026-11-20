// Leonida Trophy Guide — the entry program for gta6-trophy-guide-01.
// Runs on Node 22 with the standard library only. It hands the guide in:
// the static app/ folder and the screenshots/ folder are copied to the
// output directory, and dossier.json is written there with the vendored
// make.fun library, which is the summary the judge reads.
//
// The app itself is plain static files (HTML, CSS, ES modules and JSON)
// that run offline from app/index.html. Nothing here fetches the network,
// installs anything, or talks to a server.
//
// vendor/makefun-frontend.ts must stay byte-identical to the kit's copy:
// the scorer rebuilds the dossier with its own copy and compares bytes.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// Outside the grader's container MAKEFUN_OUTPUT_DIR stands in for /output;
// inside it the variable is unset and the grader's /output is used.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps are the competition gate's own (reference/gate.json): the text
// budget shapes the dossier's bytes, and the other three refuse an entry
// the scorer would refuse — more than 4 screenshots, one over 256 KiB, or
// an app/ past 993 files and directories or 48 MiB in all. The two runs of
// this program must write identical bytes, so there is no timestamp, no
// random value and no ordering that depends on the filesystem walk here.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
