# AdBlock Island tests

Fast Playwright smoke tests for the single-file game and the online room service. They run against a local server that serves `index.html` and executes `api/signaling.js` with an in-memory Redis imitation — no Upstash account, no Vercel deploy.

## Run

```bash
cd tests
npm install       # once, installs @playwright/test
npx playwright install chromium
bash run.sh
```

`run.sh` starts the test server on `http://127.0.0.1:8123`, waits, then runs:

| Script | What it proves |
| --- | --- |
| `smoke.mjs` | v0.8.0 boots, the online button shares the wash-ashore style, retired Mania/Halloween UI is gone, solo starts, and the offline build makes **zero** API calls |
| `co-op.mjs` | create/join a room, host start, guest receives the island, guest movement reaches the host, server-side chat filtering turns links into `[link]` and masks blocked words |
| `handover.mjs` | three browsers: the host leaves, the successor adopts the island, and the third guest stays connected under the promoted host |

Each script fails with a non-zero exit code and a clear message on the first broken invariant.

## Notes

- The fake Redis supports only the commands the room service uses; it is not a general Redis.
- Set `PORT` / `FAKE_REDIS_PORT` if 8123 or 8199 are taken, and `BASE` to point the scripts at another origin.
- Tests are deliberately outside the deploy path: the repository root has no `package.json`, so Vercel still serves it as a static site plus one function.
