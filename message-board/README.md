# Message Wall

A simple persistent message board. Write a message, see all messages, they survive reloads and restarts.

## Stack
- **Frontend**: Plain HTML/CSS/JS (single file)
- **Backend**: Node.js + Express
- **Database**: SQLite (single file `messages.db`) — messages persist on disk

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000

---

## Free hosting options (ranked easiest → most powerful)

### Option 1: Render.com (recommended — easiest)

Render gives you a free web service with persistent disk storage. Perfect for this app.

1. Push this folder to a **GitHub repo** (free).
2. Go to [render.com](https://render.com) and sign up (free).
3. Click **New → Web Service** → connect your GitHub repo.
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add a **persistent disk** (free tier includes 1GB):
   - Mount path: `/data`
   - Then add an environment variable: `DB_PATH` = `/data/messages.db`
6. Click **Create Web Service**. You get a free URL like `your-app.onrender.com`.

⚠️ Free Render services sleep after 15 min of inactivity (first visit takes ~30s to wake up). Messages are NOT lost — only the server pauses.

### Option 2: Fly.io (always-on, but slightly more setup)

Fly's free tier keeps your app running 24/7 with a small persistent volume.

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. `fly auth signup`
3. In this folder, run `fly launch` (it auto-detects Node.js).
4. Say **yes** when it asks to create a volume; this is where SQLite stores data.
5. Set `DB_PATH=/data/messages.db` in `fly.toml` under `[env]`.
6. `fly deploy`

### Option 3: Railway.app

Similar to Render. Free $5/month credit (enough for a small app).
1. Sign up at [railway.app](https://railway.app).
2. **New Project → Deploy from GitHub repo**.
3. Add a volume mounted at `/data`, set `DB_PATH=/data/messages.db`.
4. Done.

### Option 4: Glitch.com (zero-config, in-browser editor)

If you don't want to use GitHub at all:
1. Go to [glitch.com](https://glitch.com), create a new Node.js project.
2. Paste in the files from this folder.
3. It auto-runs and gives you a public URL.
4. Free tier sleeps after 5 min, but data persists.

---

## Which should you pick?

- **Just want it live in 5 minutes?** → Glitch
- **Want a real deployment with GitHub?** → Render
- **Want it always-on, no sleep?** → Fly.io

## Notes on persistence

This app uses SQLite stored in a file. On free hosts, you MUST use a mounted persistent disk/volume — otherwise the file gets wiped on every redeploy. The `DB_PATH` environment variable controls where the database file lives.
