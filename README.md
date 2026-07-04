# Chemy LMS

Lightweight LMS (Learning Management System) used for development and demos. This repository contains a `frontend` (Vite + React) and a simple `backend` (Express) with JSON fallback storage.

Getting started

- Install dependencies:

```
cd backend
npm install

cd ../frontend
npm install
```

- Run both servers (from repo root):

```
npm run dev
```

Scripts

- Utility scripts are in `scripts/` (previously at repo root):
  - `scripts/replace_admin.js`
  - `scripts/replace_colors.js`
  - `scripts/replace_vars.js`

Notes

- Frontend dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`).
- Backend stores users in `backend/data/users.json` when no MongoDB connection is configured.
