# Notes for Claude Code: AI Club Committee Dashboard

A password-protected static site on GitHub Pages for the Cambridge AI Club committee.

## Layout
- `index.html`, `assets/gate.js`, `assets/style.css`, `assets/logo*.png`, `assets/favicon.png`: public shell (password screen, styles).
- `assets/secure.js`: the dashboard, **encrypted** (AES-256-GCM, PBKDF2) from `src/data.js` + `src/app.js` by `build.mjs`. Never edit by hand.
- `src/` (**gitignored**): `app.js` (all logic), `data.js` (committee, team actions, guidelines, goals, meeting poll snapshot, settings, rota storage key `SITE.store`). It's stored encrypted in the repo as `src.enc`. If `src/` is missing, ask the user to run `node unpack.mjs` (it needs the site password). Don't recreate it from scratch.
- Rota data: `data.json` in the private repo `CambridgeAIClub/aiclub-rota-data`, read and written by the browser through the GitHub contents API using `SITE.store.token` (fine-grained, Contents read & write on that repo only).
- Speaker tracker: Google Sheet read live (gviz CSV). The "Live" tab feeds the Schedule and Speakers tabs; "Potential Speakers" feeds the potential speakers table.
- Next Meeting: `MEETING` snapshot of a when2meet poll in `src/data.js` (when2meet blocks cross-origin reads).

## Project commands
- `/setup`: first-time setup (asks for the site password, runs `node unpack.mjs`, checks the storage key and git status).
- `/publish`: rebuild with the site password, check `src/` isn't staged, commit and push.

When you need the site password, ask the user and pass it as `SITE_PASSWORD='…'` on the command. Never save it to a file.

## Workflow
1. Edit `src/data.js` / `src/app.js` (and `assets/style.css` for styling; it's public, so no rebuild is needed for CSS only).
2. Rebuild: `node build.mjs`. It asks for the site password, or use `SITE_PASSWORD='…' node build.mjs` if the user provides it. It writes `assets/secure.js` and `src.enc`, and refuses a password that doesn't match the current one. Changing the password needs `--new-password`.
3. Preview: `python3 -m http.server 8000`, then open http://localhost:8000. Sign-ups here write to the real rota.
4. The user commits and pushes: `git add . && git commit -m "…" && git push`.

## Rules
- Never commit or print the contents of `src/`, the storage token or the site password. Check `git status` shows no `src/` before committing.
- After any change to `src/`, rebuild so `assets/secure.js` matches.
- Keep the rota layout in data.json: row 0 headers (A month, B "Can't make it", C–H roles), row 1 role notes, row 2 "One of: …" requirements, then one row per event like "Dec (Dec 3)". Names are committee first names, comma-separated.
- Team actions & guidelines: put year-long duties in `responsibilities`. Put action points for a single event or month in `items` as `{ text: "…", until: "YYYY-MM-DD" }` (usually the event date) so they disappear by themselves. Guideline cards about one event get `until` too. When the user adds action points, ask whether they are one-off if it isn't clear.
- The Handover tab (`MAINT` in `src/data.js`) is the human-facing handover doc. Keep it in sync when the setup changes.
