# CompliNova AI

MERN-stack AI compliance management platform: JWT auth with roles, AI policy generation (OpenAI optional), template marketplace, TipTap policy editor, gap analyzer, document auditor, acknowledgments, regulation center, chatbot, dashboards, and exports (DOCX/PDF).

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Quick start

1. **MongoDB**: create a database and copy connection string.

2. **Server**

   ```powershell
   cd server
   copy .env.example .env
   # Edit .env: set MONGODB_URI and JWT_SECRET (and optionally OPENAI_API_KEY, SMTP_*, CLOUDINARY_*)
   # Save the file on disk: an unsaved editor buffer will NOT be read by Node.
   npm run doctor
   npm run seed
   npm run dev
   ```

   API defaults to `http://localhost:5000`.

3. **Client**

   ```powershell
   cd client
   npm run dev
   ```

   Open `http://localhost:5173`. Register an organization, then explore the dashboard.

## Environment highlights

| Variable            | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `MONGODB_URI`       | Mongo connection string                      |
| `JWT_SECRET`        | Signing secret for access tokens             |
| `OPENAI_API_KEY`    | Enables full AI generation, chat, auditing |
| `SMTP_*` / `EMAIL_FROM` | Forgot password + verification emails   |
| `CLOUDINARY_*`      | Optional cloud file URLs for uploads         |

## Project layout

- `server/`: Express REST API, Mongoose models, Multer uploads, optional Cloudinary/OpenAI.
- `client/`: Vite + React + Tailwind + Framer Motion + Recharts + TipTap.

## Deploy on Vercel (frontend)

This repo is a **MERN monorepo**. Vercel should host the **React client only**: not the Express `server/` folder (that causes “function crashed” errors).

1. In Vercel → Project Settings → **Root Directory**: leave empty (repo root): `vercel.json` builds `client/`.
   - Or set Root Directory to **`client`** and use the included `client/vercel.json`.
2. **Framework preset:** Vite
3. **Environment variable** (required for login/API):
   - `VITE_API_URL` = `https://YOUR-API-HOST/api` (e.g. Render/Railway URL)
4. Redeploy after setting env vars.

## Deploy API (backend)

Host `server/` on **Render**, **Railway**, or similar (MongoDB Atlas required):

```powershell
cd server
# Set MONGODB_URI, JWT_SECRET, CLIENT_URL=https://your-app.vercel.app
npm start
```

`CLIENT_URL` on the API must include your Vercel URL (comma-separated for multiple).

Optional: use included `render.yaml` with [Render](https://render.com).

## Troubleshooting

- **Vercel “function crashed” / blank page**: Do not deploy `server/` to Vercel. Use Root Directory `client` or repo root with root `vercel.json`. Set `VITE_API_URL` to your hosted API.
- **`MONGODB_URI is required` / API exits**: Run `npm run doctor` inside `server/`. If it reports **0 bytes** for `.env`, your `server/.env` is empty on disk: paste your variables, **Save**, then run `npm run doctor` again.
- **`--localstorage-file` Node warning**: Comes from a broken `NODE_OPTIONS` in your OS/user environment (not this repo). Clear or fix `NODE_OPTIONS` in Windows “Environment Variables” if the warning bothers you.

## Production notes

- Harden secrets, enable HTTPS, rate-limit auth routes, and hash password-reset tokens at rest.
- For true collaborative editing, add a WebSocket layer and CRDT (e.g. Yjs) alongside `Policy` versions.
- Upgrade Multer to 2.x after reviewing breaking changes (npm audit).

## Disclaimer

AI-generated policies and analysis are **not legal advice**. Organizations must involve qualified counsel for regulatory obligations.
