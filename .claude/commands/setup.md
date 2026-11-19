---
description: First-time setup of the AI Club dashboard: unlock src/ and check everything works
---
Set up this project for a new maintainer. Follow CLAUDE.md. Steps:

1. Check that `node --version` is 18 or newer and that `git` works. If something is missing, explain how to install it and stop.
2. If `src/app.js` and `src/data.js` already exist, say so and skip to step 4.
3. Ask me for the **site password** (the one used to unlock the dashboard). Then run
   `SITE_PASSWORD='<password>' node unpack.mjs`.
   If it says the password is wrong, ask me again. Never write the password to a file, commit message or anywhere else.
4. Check that `src/data.js` has `SITE.store.repo` set to "CambridgeAIClub/aiclub-rota-data" and a token, without printing the token. If the token is empty, explain how to create a fine-grained GitHub token (Contents read & write on aiclub-rota-data only), as in the Handover tab.
5. Run `git status` and confirm that `src/` is not listed (it must stay untracked).
6. Offer to start a local preview with `python3 -m http.server 8000` (then open http://localhost:8000). Remind me that sign-ups made in the preview write to the real rota.
7. Finish with a short summary of what's ready and the two commands I'll use most: describe a change in plain words, then `/publish`.
