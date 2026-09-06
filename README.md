# ShaktiConnect — Full Stack Project

A community platform for women in Andhra Pradesh & Tamil Nadu: forums, business ideas &
government schemes, legal rights & helplines, and a member directory — with real
registration/login, real votes, and real posts saved to a database.

This project has two parts:

```
shakti-platform/
├── client/     ← frontend (HTML, CSS, JavaScript — open in a browser)
└── server/     ← backend (Node.js + Express + MongoDB — the API)
```

Both were built and tested together on this machine (registration, login, posting,
voting, replying, searching members, and browsing business/legal content were all
verified working end-to-end). Everything below is what's needed to run the same setup
on your own computer.

---

## 1. What you need installed

- **Node.js** (v18 or newer) — https://nodejs.org — download the LTS installer, click
  through it. This gives you both `node` and `npm`.
- **VS Code** (recommended, but any editor works) — https://code.visualstudio.com
- **Nothing else.** You do **not** need to install MongoDB. See below.

## 2. About the database — zero setup required

The backend needs MongoDB, but it's configured to start its own local copy of MongoDB
automatically the first time you run it — it downloads and runs a real MongoDB engine
in the background and stores data in `server/data/db` on your machine. There's nothing
to install and nothing to sign up for. Your data (members, posts, votes) persists
between restarts as long as that `server/data/db` folder isn't deleted.

If you'd rather use a real MongoDB installation or a free MongoDB Atlas cloud database
later (for example when you deploy this for real), just set `MONGODB_URI` in
`server/.env` — see `server/.env.example` for the format. Leaving it blank keeps the
automatic local mode.

## 3. Running it locally

Open a terminal in VS Code (`` Terminal → New Terminal ``) and run:

```bash
cd server
cp .env.example .env
npm install
npm run seed      # fills the database with sample members, posts, business ideas, legal Q&A
npm run dev        # starts the API on http://localhost:5000
```

Leave that running, open a **second** terminal, and serve the frontend as static files
(browsers block some features if you just double-click `index.html`):

```bash
cd client
npx serve -l 5500 .
```

Then open **http://localhost:5500** in your browser. That's the whole app, running
entirely on your machine.

> Tip: in VS Code you can instead right-click `client/index.html` and choose
> **"Open with Live Server"** (install the free "Live Server" extension first) — it does
> the same thing as `npx serve` with one click, and auto-refreshes when you edit files.

### Trying it out

The seed data creates 8 sample members you can log in as — any of their emails
(e.g. `padmavathi.s@example.com`) with the password `Demo@123` — or just click
**"Join Free"** and register your own account. From there you can post a discussion,
upvote/reply to posts, search the member directory, and browse the business ideas and
legal FAQ pages (all of that content is served from the database too, not hardcoded in
the page).

### Automated end-to-end testing

The `tests/` folder has a real Playwright suite that drives the app the same way a user
would — in an actual browser, against the real API and the real (in-memory) database —
covering registration/login and session persistence, starting a discussion, live
upvoting/un-voting, threaded replies (as a second logged-in user), member search and
district/skill filtering, and forum category filtering.

```bash
cd tests
npm install
npx playwright install chromium   # first time only, downloads a test browser
npm test
```

Playwright starts the API and a static server for the client itself (no need to have
them running already), so `npm test` from a clean checkout is enough. `npm run report`
opens the last HTML test report.

---

## Frontend structure (`client/`)

| File | What it does |
|---|---|
| `index.html` | All five pages (Home, Forums, Business, Legal, Members) plus the login/register and new-discussion modals. Same visual design as the original prototype. |
| `css/styles.css` | The original styling (colors, layout, cards) — unchanged. |
| `css/extra.css` | New styles added for the account menu, error messages, and expandable legal answers. |
| `js/api.js` | The one place that talks to the backend — every API call and the login-session (token) storage goes through here. |
| `js/auth.js` | Login/register modal logic, session state, nav bar login/logout display. |
| `js/members.js` | Loads and searches the member directory from the API. |
| `js/forum.js` | Categories, discussion list, posting, voting, replying — all live. |
| `js/business.js` | Business ideas and government schemes, loaded from the API. |
| `js/legal.js` | Legal rights categories, questions/answers, and helplines, loaded from the API. |
| `js/main.js` | Page navigation (the tab-switching), language button, and kicks off the initial data loads. |

To point the frontend at a different backend later (e.g. after deployment), set
`window.SHAKTI_API_BASE` before the other scripts load, or edit `API_BASE` at the top
of `js/api.js`.

## Backend structure (`server/`)

| File/folder | What it does |
|---|---|
| `server.js` | Entry point — sets up Express, connects the database, mounts all routes. |
| `config/db.js` | Connects to MongoDB — either the auto-started local one, or a real `MONGODB_URI` if you set one. |
| `models/` | The shape of each thing stored in the database: `User`, `Post` (with embedded replies/votes), `BusinessIdea`, `Scheme`, `LegalCategory`, `Helpline`, `Mentor`. |
| `middleware/auth.js` | Checks the login token (JWT) on requests that require you to be logged in. |
| `controllers/` | The actual logic behind each API endpoint. |
| `routes/` | Maps URLs (e.g. `POST /api/forum/posts`) to the controller functions above. |
| `seed/seed.js` | Fills an empty database with realistic starter content (run once with `npm run seed`). |
| `.env.example` | Template for your local config — copy to `.env` and adjust if needed. |

### API endpoints

```
POST   /api/auth/register          create an account
POST   /api/auth/login             log in, returns a token
GET    /api/auth/me                current logged-in user   (requires login)

GET    /api/members                list/search members  (?search=&district=&skill=)
GET    /api/members/:id            one member's profile
PUT    /api/members/me             update your own profile   (requires login)

GET    /api/forum/categories       discussion categories
GET    /api/forum/mentors          sidebar mentors
GET    /api/forum/posts            list discussions  (?category=&district=)
POST   /api/forum/posts            start a discussion   (requires login)
GET    /api/forum/posts/:id        one discussion
POST   /api/forum/posts/:id/replies  add a reply   (requires login)
POST   /api/forum/posts/:id/vote   toggle your upvote   (requires login)

GET    /api/business/ideas         business idea cards
GET    /api/business/schemes       government scheme badges

GET    /api/legal/categories       legal rights categories + Q&A
GET    /api/legal/helplines        emergency/legal helpline numbers
```

---

## 4. When you're ready to hand this off / deploy it

This whole `shakti-platform` folder is everything needed — there's no missing piece and
no account tied to anyone specific. Whoever picks it up next can run it locally exactly
as above, or deploy it:

- **Frontend** (`client/`): any static host works for free — Cloudflare Pages, Netlify,
  or Vercel. It's plain HTML/CSS/JS, no build step.
- **Backend** (`server/`): needs somewhere that runs Node.js continuously, e.g. Render's
  free web service tier. Set the `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN`
  environment variables there instead of relying on the automatic local database.
- **Database**: for real deployment, switch from the automatic local MongoDB to a free
  MongoDB Atlas cluster (or a real MongoDB install on the server) by setting
  `MONGODB_URI` — the code already supports this, nothing to change.

## Notes / things intentionally left for later

- **Multilingual content** (Telugu/Tamil): the language switcher in the nav is currently
  just a visual toggle (as it was in the original prototype). Full translation would mean
  adding a strings file per language and swapping text on switch — a well-defined next
  step if you want it.
- **Profile/business photos**: not included in this version (members show a colored
  initial avatar, matching the original design). Adding image uploads later is a small
  addition (a single `multer` middleware + one new field).
- **Admin tools** for editing business ideas/legal content without touching the seed
  script directly would be a reasonable next feature once the core app is validated.
