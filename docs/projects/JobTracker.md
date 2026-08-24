# PRD: Job Tracker (Web App)

**Author:** Ilham Oktian Ramadhan (Tyan)
**Versi:** 2.0 — Production
**Tanggal:** 10 Agustus 2026 (update: 24 Agustus 2026)
**Status:** ✅ Live — https://job-tracker-five-kappa-28.vercel.app

---

## 1. Latar Belakang

Job tracking saat ini populer dilakukan lewat spreadsheet atau Notion, tapi keduanya punya keterbatasan:
- **Spreadsheet**: mudah dibuat, tapi tidak ada visual board, gampang berantakan, tidak ada reminder.
- **Notion**: fleksibel, tapi setup awal ribet dan berat untuk kebutuhan sederhana seperti tracking lamaran kerja.

Sebagai web developer yang sedang aktif melamar kerja, penulis ingin membuat versi web dedicated untuk job tracking — simple, langsung pakai, tanpa perlu setup database manual seperti di Notion. Project ini juga berfungsi ganda: alat bantu tracking lamaran kerja penulis sendiri, sekaligus portfolio project fullstack.

## 2. Tujuan (Goals)

- Menyediakan cara sederhana untuk mencatat dan memantau progres lamaran kerja.
- Tampilan data yang jelas dan cepat dibaca (table view desktop / card view mobile).
- Mudah dipakai tanpa onboarding rumit — buka, tambah data, selesai.
- Jadi portfolio project yang menunjukkan kemampuan fullstack development.

## 3. Non-Goals (Out of Scope)

- Tidak ada integrasi email/parsing otomatis dari Gmail.
- Tidak ada browser extension.
- Tidak ada kolom **Salary** dan **Next Action** (sengaja disederhanakan).
- Tidak ada fitur kolaborasi/multi-user dalam satu board (setiap user punya data sendiri).
- Tidak ada notifikasi push/email reminder di versi awal.

## 4. Target Pengguna

- Job seeker individu (termasuk penulis sendiri) yang melamar ke banyak posisi sekaligus dan butuh cara mencatat progres tanpa ribet setup tools.

## 5. Fitur Utama

### 5.1 Autentikasi
- Register/login (email + password).
- JWT-based session, token disimpan di localStorage.
- Setiap user hanya melihat data miliknya sendiri (filter `user_id` di backend).

### 5.2 CRUD Lamaran Kerja
Setiap entri lamaran punya atribut:

| Field             | Tipe | Keterangan |
|--------           |------|------------|
| Company           | text | Nama perusahaan |
| Position          | text | Posisi yang dilamar |
| Status            | enum (tag/badge) | Applied, Interviewed, Offer, Rejected |
| Application Date  | date | Tanggal apply (bisa diedit) |
| Website           | url | Link website perusahaan/lowongan |

User bisa **Create, Read, Update, Delete** entri lamaran. Edit dilakukan inline (table desktop) atau di card (mobile).

### 5.3 Tampilan Data
- **Desktop**: Table view — baris per lamaran, badge warna per status, kolom Age (elapsed time).
- **Mobile**: Card view — setiap lamaran jadi card vertikal (company + position di atas, status + tanggal + age di bawah, action buttons di kanan atas). Tidak ada scroll horizontal / area putih di kanan.
- Sorting berdasarkan Application Date (terbaru di atas).
- Filter berdasarkan Status (tabs: All / Applied / Interview / Offer / Rejected).
- Search by company / position.

### 5.4 Status Management
- Status ditampilkan sebagai badge berwarna:
  - Applied → biru
  - Interviewed → kuning/gold
  - Offer → ungu
  - Rejected → merah
- Update status lewat dropdown inline (edit mode).

### 5.5 Elapsed Time Tracker
- Kolom "Age" yang menampilkan **berapa lama sejak tanggal apply** sampai saat ini.
- Format otomatis:
  - < 7 hari → hari (mis. "3d")
  - 7–30 hari → minggu (mis. "2w")
  - > 30 hari → bulan (mis. "2mo")
- Warna indikator: Hijau (≤7 hari) / Amber (8–30 hari) / Red (>30 hari).
- Read-only, dihitung otomatis dari `Application Date`.

### 5.6 Design System
- Brand: **CareerTrack** — "Productive Calm".
- Reference: `DESIGN.md` (root) + `design/` folder (HTML mockups + design tokens).
- Font: Inter. Palette: primary blue `#2563EB`, surface `#FAF8FF`.

## 6. Data Model

```sql
User
- id            SERIAL PRIMARY KEY
- name          VARCHAR(100)
- email         VARCHAR(255) UNIQUE
- password_hash VARCHAR(255)
- created_at    TIMESTAMP

JobApplication
- id                SERIAL PRIMARY KEY
- user_id           INTEGER (FK -> User, ON DELETE CASCADE)
- company           VARCHAR(255)
- position          VARCHAR(255)
- status            VARCHAR(20) CHECK (status IN ('applied','interviewed','offer','rejected'))
- application_date  DATE
- website           TEXT
- created_at        TIMESTAMP
- updated_at        TIMESTAMP
```

Schema lengkap: `server/schema.sql` (jalankan di Supabase SQL Editor).

### 6.1 Struktur Project

```
job-tracker/
├── src/                      ← Frontend (React + Vite)
│   ├── App.jsx               ← Dashboard, table/card view, CRUD UI
│   ├── main.jsx              ← Entry + AuthProvider
│   ├── api.js                ← Axios instance + JWT interceptor
│   ├── index.css             ← Tailwind + Inter + gradient
│   ├── context/
│   │   └── AuthContext.jsx   ← Auth state (login/register/logout)
│   └── pages/
│       ├── LoginPage.jsx
│       └── RegisterPage.jsx
├── server/                   ← Backend (Express)
│   ├── index.js              ← Express app (export for Vercel)
│   ├── db.js                 ← PostgreSQL pool (Supabase pooler)
│   ├── schema.sql            ← DB schema
│   ├── middleware/auth.js    ← JWT middleware
│   ├── routes/
│   │   ├── auth.js           ← register / login
│   │   └── jobs.js           ← CRUD lamaran
│   └── package.json
├── api/
│   └── index.js              ← Vercel serverless function wrapper
├── design/                   ← HTML mockups + design tokens
├── DESIGN.md                 ← CareerTrack design system (formalized)
├── vercel.json               ← Vercel routing config
├── tailwind.config.js        ← Design tokens
└── package.json              ← Root (Vite + server deps merged)
```

### 6.2 API Endpoints

| Method | Endpoint | Deskripsi | Auth? |
|--------|----------|-----------|-------|
| POST | /api/auth/register | Daftar akun baru | ❌ |
| POST | /api/auth/login | Login, dapat JWT token | ❌ |
| GET | /api/jobs | Ambil semua lamaran user | ✅ |
| POST | /api/jobs | Tambah lamaran baru | ✅ |
| PUT | /api/jobs/:id | Update lamaran | ✅ |
| DELETE | /api/jobs/:id | Hapus lamaran | ✅ |

## 7. User Flow

1. User register/login.
2. User mendarat di dashboard (kosong jika belum ada data).
3. Klik "New" → isi form (Company, Position, Status, Date, Website) → Save.
4. Entri muncul di tabel (desktop) / card (mobile).
5. Edit inline: klik icon edit → ubah field termasuk tanggal → Save.
6. Hapus: klik icon delete → confirm.
7. Filter via tabs, search via search box.

## 8. Non-Functional Requirements

- ✅ Responsive — desktop (table) & mobile (card), no horizontal scroll / white gap.
- ✅ Load cepat — Vite build + Vercel CDN.
- ✅ Data aman per user (RLS off di Supabase, filter `user_id` di backend).

## 9. Tech Stack

**Frontend:**
- React 19 + Vite 8
- Tailwind CSS v3
- Axios (API calls + JWT interceptor)
- Inter font (Google Fonts)

**Backend:**
- Node.js + Express 4
- JWT (jsonwebtoken) — autentikasi
- bcryptjs — password hashing
- PostgreSQL via Supabase (pooler connection `:6543`)

**Deploy:**
- Frontend + Backend → Vercel (static + serverless function)
- Database → Supabase (free Postgres)
- `vercel.json` handles SPA rewrite + `/api/*` routing

## 10. Deployment

**URL Produksi:** https://job-tracker-five-kappa-28.vercel.app

**Langkah:**
1. Push ke GitHub (`main`)
2. Vercel auto-deploy dari GitHub
3. Set env vars di Vercel dashboard:
   - `DATABASE_URL` = Supabase pooler URL (`:6543`, format `postgresql://postgres.xxx:pass@aws-0-xxx.pooler.supabase.com:6543/postgres`)
   - `JWT_SECRET` = random string
4. Redeploy

**Local dev:**
```bash
# Terminal 1 — Backend
cd server && npm run dev        # port 5000

# Terminal 2 — Frontend
npm run dev                      # port 5173
```

## 11. Roadmap

1. ✅ Mobile card layout
2. ✅ Editable application date
3. ✅ Always-visible action buttons
4. Kanban board view (drag & drop)
5. Dashboard statistik & response rate
6. Reminder follow-up otomatis
7. Export data ke CSV

---

**Demo:** https://job-tracker-five-kappa-28.vercel.app
