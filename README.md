# AI Club Committee Dashboard

**Live site: https://cambridgeaiclub.github.io/AIClubCommitteeDashboard/** (password protected; ask the co-chairs for the password)

> **Maintaining this site?** See the **Handover** tab inside the dashboard for the full handover (what lives where, keys, setup, routine tasks, troubleshooting). If you use Claude Code, `CLAUDE.md` gives it the same rules.

A one-page site for the Cambridge AI Club committee. It has these tabs:

- **Schedule** (the start page): the 2026–27 programme, with themes, speakers and who owns each event's speakers.
- **Speakers**: colour-coded event strips; tap one to open a side panel with speakers, talk titles and deadlines. There's also a table view, and a searchable **Potential speakers** list read live from the tracker's "Potential Speakers" tab. It reads the "Live" tab of the [speaker tracker](https://docs.google.com/spreadsheets/d/1zLyU9ev8pMtukd6CPQNDKEBx6GXzRK3xoRrwoE3wzos/edit?gid=0#gid=0). Each event shows its owner, confirmed speakers, the deadline for speakers (2 months before) and the date to share details with Publicity (6 weeks before).
- **Rota**: colour-coded event strips in the style of VolleySource's sign-up page. Tap one to open a side panel listing every role, then pick a name from the dropdown to sign up, swap or remove. A compact table view is also available. There are clash warnings, everyone's progress towards 4 events, and an "email those under 4" button. The rota is read live from the [AI Club Rota sheet](https://docs.google.com/spreadsheets/d/14Ht5EU3XrkiPg_q1ID0YEyg68SGRmlwdFtWywL6IPWw/edit?gid=449716836#gid=449716836).
- **My view**: your sign-ups, absences, the events you own speakers for, open slots in your usual roles, and your team's action points.
- **Committee**: members and teams.
- **Next Meeting**: the next committee meeting, built from a when2meet snapshot. It shows the best times, who has replied and who hasn't, a heatmap and the live poll.
- **Team actions** and **Guidelines**: each team's responsibilities and current action points, the goals for the year, and how we work.

### How the Google Sheets sync works

People sign up for the rota, change speaker owners and add new events on the website, and can still edit the Google Sheets directly. Both stay in sync.

The **AI Club Rota** Google Sheet is the single source. A small Google Apps Script attached to it (`src/apps-script.gs`, deployed as a web app) does the work:

- `read` returns the rota (the website shows it straight away; Google's public feed is the fallback).
- `add` / `remove` put a name in or take it out of a rota cell.
- `setOwner` changes the "Responsible" column (H) in the speaker tracker.
- `addEvent` adds a new row, in date order, to both the rota sheet and the speaker tracker.

The script checks a secret key, saves one change at a time and lists every change in a **Dashboard log** tab. Its URL and key are in `src/data.js` → `SITE.sheetApi`, inside the encrypted site. Open pages refresh every minute.

Setting it up, or connecting a new sheet (the Handover tab on the site has the same steps with more detail):

1. Make sure you can **edit** both the rota sheet and the speaker tracker.
2. Update `src/apps-script.gs` if anything changed (sheet ID, tab ID, columns, committee names, `TOKEN`). `TOKEN` must match `SITE.sheetApi.token`.
3. In the rota sheet: **Extensions → Apps Script**, replace the code with `src/apps-script.gs` (`pbcopy < src/apps-script.gs` copies it on a Mac) and save.
4. **First time:** Deploy → New deployment → Web app, *Execute as: Me*, *Who has access: Anyone*, and approve the permissions. Put the Web app URL in `SITE.sheetApi.url`, then run `node build.mjs` and push.
   **Update:** Deploy → Manage deployments → Edit → Version: *New version* → Deploy. The URL stays the same, so nothing on the website changes.

The older GitHub storage (`SITE.store`, private repo `aiclub-rota-data`) is only used if `SITE.sheetApi.url` is empty.

## Password protection and the source code

The dashboard is encrypted. `assets/secure.js` contains only AES-256-GCM ciphertext, so committee names, emails and links can't be read without the password, even from this repository. The page decrypts it in the browser when someone enters the password, and it asks every time.

The readable source (`src/`) isn't committed in plain text. An **encrypted copy, `src.enc`**, is committed instead, locked with the same password. So the whole project lives in this one repository.

- **New maintainer:** clone the repo, run `claude` in it and type **`/setup`**. Claude asks for the site password and restores `src/`. To do it by hand instead, run `node unpack.mjs`. To make changes later, describe them to Claude, then type **`/publish`**.
- **After editing `src/`:** run `node build.mjs` (Node 18+, no packages), then commit and push. This updates both `assets/secure.js` and `src.enc`.
- **Password safety:** `node build.mjs` refuses a password that doesn't match the current one, so a typo can't lock everyone out. To change the password on purpose, run `node build.mjs --new-password`, push, and tell the committee.

## Editing

| What changes | Edit, then run `node build.mjs` |
|---|---|
| Committee members, teams, emails | `src/data.js` → `COMMITTEE` |
| Team action points | `src/data.js` → `TEAM_ACTIONS` |
| Committee meeting poll | `src/data.js` → `MEETING` (when2meet snapshot) |
| Google Sheets sync (sign-ups, owners, new events) | `src/data.js` → `SITE.sheetApi`; script in `src/apps-script.gs` (paste into the rota sheet and redeploy) |
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
