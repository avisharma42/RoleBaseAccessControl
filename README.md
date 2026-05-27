# RBAC MERN Starter (Admin/Editor/Viewer)

A **fully working** MERN stack project demonstrating **Role‑Based Access Control (RBAC)** with a clean, professional dashboard.

**Roles**
- **Admin**: Manage users & posts (full access)
- **Editor**: CRUD their own posts; read others
- **Viewer**: Read‑only
<img width="1903" height="865" alt="image" src="https://github.com/user-attachments/assets/f6a577a6-0db1-49dd-859e-e8a8b64c4a76" />

<img width="1901" height="854" alt="image" src="https://github.com/user-attachments/assets/cd38a4cf-8dcc-47bd-b1ce-029dba651a59" />
<img width="1905" height="859" alt="image" src="https://github.com/user-attachments/assets/c6a8c93b-a2ce-4ce7-9913-dbe643c29053" />
<img width="1897" height="848" alt="image" src="https://github.com/user-attachments/assets/451f34d0-848c-4c62-a150-ec75766617d2" />
<img width="1892" height="861" alt="image" src="https://github.com/user-attachments/assets/3099c95b-1bff-401e-97b0-bc7a862bf347" />
<img width="1900" height="841" alt="image" src="https://github.com/user-attachments/assets/11393ad8-5bbd-41d2-8a84-0cc13d9f2060" />
<img width="1914" height="858" alt="image" src="https://github.com/user-attachments/assets/74d90587-2f2f-4850-8791-405c682bcbc5" />
<img width="1905" height="868" alt="image" src="https://github.com/user-attachments/assets/8e791831-48d4-4f5b-b247-fef4faf702f1" />
<img width="1901" height="848" alt="image" src="https://github.com/user-attachments/assets/bb86ba0f-8574-4f20-9d55-b49f894d9547" />
<img width="1912" height="859" alt="image" src="https://github.com/user-attachments/assets/92292fe2-686d-49fe-8079-bbb808ad1492" />
<img width="1907" height="851" alt="image" src="https://github.com/user-attachments/assets/4890565e-fd4a-49d7-886e-079e22ce6cd6" />
<img width="1912" height="854" alt="image" src="https://github.com/user-attachments/assets/35f8f6dd-cc93-434c-968d-5886d2a189b4" />

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

- ## Author & License
- Author: Avi Sharma
- License: MIT

