---
description: Rebuild the dashboard and push it live to GitHub Pages
argument-hint: [short description of the change]
---
Publish the current changes to the live dashboard. Follow CLAUDE.md. Steps:

1. If `src/` is missing, stop and tell me to run `/setup` first.
2. Rebuild: `SITE_PASSWORD='<password>' node build.mjs`. Ask me for the site password if I haven't given it in this session. If the build says it isn't the current password, ask again. Never use `--new-password` unless I explicitly asked to change the password.
3. Run `git status`. Make sure `src/` is NOT listed; if it is, stop and fix .gitignore. Expected changes are things like assets/secure.js, src.enc, assets/style.css, index.html, README.md.
4. Show me a one-line summary of what changed, then commit with the message: $ARGUMENTS (or a short sensible message if none was given), and run `git push`.
5. If the push fails with an authentication error, explain the options: `gh auth login` as CambridgeAIClub, or a token with Contents read & write on AIClubCommitteeDashboard used as the password.
6. When it works, tell me the site updates within 1–2 minutes at https://cambridgeaiclub.github.io/AIClubCommitteeDashboard/ (hard-refresh with ⌘⇧R).
