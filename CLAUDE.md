# Notes for Claude Code: AI Club Committee Dashboard

A password-protected static site on GitHub Pages for the Cambridge AI Club committee.

## Layout
- `index.html`, `assets/gate.js`, `assets/style.css`, `assets/logo*.png`, `assets/favicon.png`: public shell (password screen, styles).
- `assets/secure.js`: the dashboard, **encrypted** (AES-256-GCM, PBKDF2) from `src/data.js` + `src/app.js` by `build.mjs`. Never edit by hand.
- `src/` (**gitignored, private**): `app.js` (all logic), `data.js` (committee, team actions, guidelines, goals, meeting poll snapshot, settings, rota storage key `SITE.store`). If `src/` is missing, ask the user for it. Don't recreate it from scratch.
- Rota data: `data.json` in the private repo `CambridgeAIClub/aiclub-rota-data`, read and written by the browser through the GitHub contents API using `SITE.store.token` (fine-grained, Contents read & write on that repo only).
- Speaker tracker: Google Sheet read live (gviz CSV). The "Live" tab feeds the Schedule and Speakers tabs; "Potential Speakers" feeds the potential speakers table.
- Next Meeting: `MEETING` snapshot of a when2meet poll in `src/data.js` (when2meet blocks cross-origin reads).

## Workflow
1. Edit `src/data.js` / `src/app.js` (and `assets/style.css` for styling; it's public, so no rebuild is needed for CSS only).
2. Rebuild: `node build.mjs`. It asks for the site password; or use `SITE_PASSWORD='…' node build.mjs` if the user provides it.
3. Preview: `python3 -m http.server 8000`, then open http://localhost:8000. Sign-ups here write to the real rota.
4. The user commits and pushes: `git add . && git commit -m "…" && git push`.

## Rules
- Never commit or print the contents of `src/`, the storage token or the site password. Check `git status` shows no `src/` before committing.
- After any change to `src/`, rebuild so `assets/secure.js` matches.
- Keep the rota layout in data.json: row 0 headers (A month, B "Can't make it", C–H roles), row 1 role notes, row 2 "One of: …" requirements, then one row per event like "Dec (Dec 3)". Names are committee first names, comma-separated.
- The Website guide tab (`MAINT` in `src/data.js`) is the human-facing handover doc. Keep it in sync when the setup changes.
