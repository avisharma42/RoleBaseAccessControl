# RBAC MERN Starter (Admin/Editor/Viewer)

A **fully working** MERN stack project demonstrating **Role‑Based Access Control (RBAC)** with a clean, professional dashboard.

**Roles**
- **Admin**: Manage users & posts (full access)
- **Editor**: CRUD their own posts; read others
- **Viewer**: Read‑only

**Tech**
- **API**: Node + Express + MongoDB (Mongoose), JWT (httpOnly cookies), CORS, rate‑limit hints
- **Web**: React (Vite) + React Router, Tailwind CSS, Protected Routes, Role gates

---

## Quick Start

### 1) Environment
- Node 18+
- MongoDB 6+ (local or Atlas)

### 2) API
```bash
cd api
cp .env.example .env   # edit values as needed
npm i
npm run dev            # starts on http://localhost:4000
# (optional) seed users and demo posts
npm run seed
```
Default seeded users (password for all = **pass123**):
- admin@demo.com (Admin)
- editor@demo.com (Editor)
- viewer@demo.com (Viewer)

### 3) Web
```bash
cd web
npm i
npm run dev            # starts on http://localhost:5173
```

Log in and explore:
- **Dashboard** with stats, role badge, and sample chart
- **Posts**: create/read/update/delete (Editor: own only; Admin: all; Viewer: read only)
- **Users** (Admin only): change roles, deactivate users

---

## Folder Structure
```
api/        # Express server
web/        # React app (Vite + Tailwind)
```

## Notes
- JWT is stored in **httpOnly** cookie `token` (secure in production).
- CORS is configured to allow the Vite dev origin by default.
- Update `WEB_ORIGIN` in `.env` if the frontend runs from a different URL.
