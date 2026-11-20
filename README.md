# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zakariyasync-hash/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zakariyasync-hash/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden. Every trophy has its official name, description and grade, a guide in our own words that names its sources, and a place in a 3-stage road to the platinum. Progress is a checklist saved in the browser, with export and import, filters by grade and kind, and a spoiler setting that hides story trophies until you earn them. One trophy can be missed — the guide flags it first.

## What it covers

- **All 55 trophies**, verified against the official PS5 list frozen 18 November 2026 (Exophase and PSNProfiles agreeing on every name, description and grade).
- **A guide for each trophy** with named sources (PowerPyx, Insider Gaming, KeenGamer, Push Square, damnmodz and others). Where no guide has confirmed a method, the trophy says so honestly instead of guessing: 2 trophies are still unconfirmed and 2 more are reported from a single source.
- **The one missable trophy**, Positive Mental Attitude — the Chapter 1 meditation at Jason's house — flagged with its reason, plus a page explaining what is not missable.
- **A 3-stage platinum roadmap** (story, 60–80 hours; 100% checklist, about 100 hours; strangers and cleanup, about 10 hours) built from the official descriptions.
- **A tracker**: tick trophies off, saved in localStorage; export progress to JSON and import it back; filter by grade and by kind (story, missable, collectibles, activities, side quests, robbery, money, combat); search by name, mission or keyword; hide earned trophies; hide spoilers.

## Run it

Serve `app/` with any static server — no build step, no network needed:

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. It works with the network off: every file it loads lives under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=bj9tq8zt&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
