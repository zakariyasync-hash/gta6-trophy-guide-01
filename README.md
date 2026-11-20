# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zakariyasync-hash/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zakariyasync-hash/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 GTA VI PS5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), with a written guide and named sources per trophy, a three-stage platinum roadmap, a missable flag, filters, spoiler settings, search, a checklist, and export/import. Five trophy methods are marked unconfirmed in the guide itself, where no source confirms them.

Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/output node main.ts
```

## How it works

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` via `vendor/makefun-app.ts`, so the grader receives exactly the guide the repository holds. Running it twice produces byte-identical output, as the rules require. The guide runs fully offline: static files, no network requests, no Rockstar logos or artwork.

## License

MIT

---

<sub>Entered on [make.fun](https://make.fun/?ref=bj9tq8zt&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
