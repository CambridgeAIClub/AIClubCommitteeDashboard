# AI Club Committee Dashboard

**Live site: https://cambridgeaiclub.github.io/AIClubCommitteeDashboard/** (password protected; ask the co-chairs for the password)

> **Maintaining this site?** See the **Website guide** tab inside the dashboard for the full handover (what lives where, keys, setup, routine tasks, troubleshooting). If you use Claude Code, `CLAUDE.md` gives it the same rules.

A one-page site for the Cambridge AI Club committee. It has these tabs:

- **Schedule** (the start page): the 2026–27 programme, with themes, speakers and who owns each event's speakers.
- **Speakers**: colour-coded event strips; tap one to open a side panel with speakers, talk titles and deadlines. There's also a table view, and a searchable **Potential speakers** list read live from the tracker's "Potential Speakers" tab. It reads the "Live" tab of the [speaker tracker](https://docs.google.com/spreadsheets/d/1zLyU9ev8pMtukd6CPQNDKEBx6GXzRK3xoRrwoE3wzos/edit?gid=0#gid=0). Each event shows its owner, confirmed speakers, the deadline for speakers (2 months before) and the date to share details with Publicity (6 weeks before).
- **Rota**: colour-coded event strips in the style of VolleySource's sign-up page. Tap one to open a side panel listing every role, then pick a name from the dropdown to sign up, swap or remove. A compact table view is also available. There are clash warnings, everyone's progress towards 4 events, and an "email those under 4" button. The rota is read live from the [AI Club Rota sheet](https://docs.google.com/spreadsheets/d/14Ht5EU3XrkiPg_q1ID0YEyg68SGRmlwdFtWywL6IPWw/edit?gid=449716836#gid=449716836).
- **My view**: your sign-ups, absences, the events you own speakers for, open slots in your usual roles, and your team's action points.
- **Committee**: members and teams.
- **Next Meeting**: the next committee meeting, built from a when2meet snapshot. It shows the best times, who has replied and who hasn't, a heatmap and the live poll.
- **Team actions** and **Guidelines**: each team's responsibilities and current action points, the goals for the year, and how we work.

### How sign-up works (same approach as VolleySource)

The rota lives on the website. People sign up, swap, withdraw and mark "can't make it" in the side panel, and changes save instantly. Nobody opens a spreadsheet.

The data is a single `data.json` file in a **private GitHub repository**. The dashboard reads and writes it with a GitHub key, which is stored inside the encrypted site, so it can't be seen without the password. Every change is a commit with a readable message (e.g. "Daniel signed up: Dec · Lecture Host"), and is also added to a `log` list inside `data.json`. If two people save at the same moment, the dashboard retries automatically. Open pages refresh every minute.

One-time setup:

1. On GitHub, create a **private** repository, e.g. `aiclub-rota-data`.
2. Upload `src/data.json` to it (Add file → Upload files). This holds the current rota.
3. Create a **fine-grained personal access token** (GitHub → Settings → Developer settings → Fine-grained tokens). Set **Repository access** to *Only select repositories*: that repo. Set **Permissions → Contents** to *Read and write*. Choose an expiry date and note it, because the token must be renewed before then.
4. In `src/data.js`, set `store: { repo: "<you>/aiclub-rota-data", path: "data.json", token: "<token>" }`, then run `node build.mjs`.

To change the year's events or the role requirements, edit `data.json` directly on GitHub, keeping the same layout. Until step 4 is done, the dashboard falls back to reading the old Google Sheet.

## Password protection

The dashboard is encrypted. The published files (`assets/secure.js`) contain only AES-256-GCM ciphertext, so committee names, emails and links can't be read without the password, even from the repository itself. When someone enters the password, the page decrypts it in their browser. "Remember on this device" keeps an unlock key in that browser, and **🔒 Lock** clears it.

- Readable sources live in `src/`. That folder is in `.gitignore` and is **not pushed**. Keep your copy, for example in OneDrive.
- After any edit in `src/`, rebuild with Node 18+ (no packages needed):

  ```
  node build.mjs          # prompts for the password
  ```

  Then commit `assets/secure.js`.
- To change the password, rebuild with the new one. Saved logins on everyone's devices stop working automatically, and people are asked for the new password.

## Editing

| What changes | Edit, then run `node build.mjs` |
|---|---|
| Committee members, teams, emails | `src/data.js` → `COMMITTEE` |
| Team action points | `src/data.js` → `TEAM_ACTIONS` |
| Committee meeting poll | `src/data.js` → `MEETING` (when2meet snapshot) |
| One-click sign-up | `src/data.js` → `SITE.signupApi` / `signupToken`; script in `src/apps-script.gs` |
| Guidelines | `src/data.js` → `GUIDELINES` |
| Event themes, speakers, timings | `src/data.js` → `PROGRAMME.events` (keyed by date, e.g. `"2027-03-04"`) |
| New academic year / new rota tab | `src/data.js` → `SITE.rotaGid`, `SITE.academicStartYear` (and ranges if the layout changes) |
| Layout and behaviour | `src/app.js`; styles in `assets/style.css` (public, no rebuild needed) |

The rota parser expects the current sheet layout:

- Row 1 holds the role headers (columns C–H).
- Row 3 holds "One of: …" / "Three of: …" requirements.
- Event rows start at row 4, with column A like `Dec (Dec 3)` and column B "Can't make it this time".
- Column I holds "Number of attendees".

Names are matched by first name. Separate several names in a cell with commas or slashes.

## Hosting on GitHub Pages

1. Push this folder to `CambridgeAIClub/AIClubCommitteeDashboard`.
2. On GitHub, go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then pick `main` / `(root)`.
3. The site appears at `https://cambridgeaiclub.github.io/AIClubCommitteeDashboard/`.

GitHub Pages serves over https, which the in-browser decryption needs.
