# Toelip Interior — Portfolio Document

> Studio desain interior dan furnitur kustom di Semarang. Dua bagian dalam satu deployment: situs publik statis dan meja kerja admin untuk pemilik.

---

## 1. Ringkasan

Sebelumnya situs hanya lima halaman HTML statis. Menambah karya berarti mengedit HTML, mengunggah foto manual, lalu deploy ulang. Pemilik tidak punya tempat untuk melihat, menambah, atau menyembunyikan karya.

Yang dibangun:

1. **Situs publik tetap statis dan cepat.** Lima halaman lama dipertahankan tampilannya.
2. **Meja kerja admin di `/admin`.** Login, daftar karya, editor, unggah foto, status terbit, analitik.
3. **Database Supabase.** Karya disimpan sekali, dipakai admin dan halaman portofolio publik.
4. **Satu deployment Vercel.** Situs dan endpoint API di alamat yang sama.

| Item | Nilai |
|---|---|
| Produksi | https://toelip-interior.vercel.app |
| Admin | https://toelip-interior.vercel.app/admin |
| Repo | https://github.com/Naitkomahli/Toelip-Interior |
| Data aktif | 12 karya terbit, 13 foto |

---

## 2. Masalah & Solusi

| Masalah | Solusi |
|---|---|
| Menambah karya harus edit HTML lalu deploy ulang | CRUD karya di `/admin`, data dari Supabase |
| Foto kamera ponsel 5 MB lebih, unggahan lambat | Kompresi di browser sebelum unggah |
| Draf dan arsip tidak boleh terlihat pengunjung | RLS: publik hanya baca `status = 'published'` |
| Halaman publik tidak boleh jadi aplikasi React | Astro statis + satu endpoint `/api/projects` |
| Kuota email Supabase kecil, magic link rapuh | Login kata sandi, sesi diperbarui otomatis |
| Karya baru tidak muncul di situs | Halaman portofolio membaca database lewat endpoint |

---

## 3. Arsitektur

```
Pengunjung
   |
   v
HTML statis (public/)  --- fetch --->  /api/projects  --->  Supabase Postgres
   |                                     (serverless)         (RLS: published saja)
   v
CSS + main.js (filter, lightbox)

Pemilik
   |
   v
/admin (React island)  --->  Supabase Auth (kata sandi)
   |                   --->  CRUD projects (authenticated)
   |                   --->  Storage bucket portfolio
```

Tiga lapisan yang harus dibedakan saat mendiagnosis: dashboard admin, database Supabase, dan halaman publik. Masalah "karya tidak masuk" bisa berasal dari salah satu dari ketiganya.

---

## 4. Tech Stack

| Teknologi | Fungsi |
|---|---|
| **Astro 7** (`output: 'static'`) | Halaman statis + route dinamis |
| **@astrojs/vercel** | Route `prerender = false` jadi fungsi serverless |
| **React 19** | Hanya untuk pulau admin |
| **TypeScript** (strict) | Tipe data karya dan repository |
| **Supabase** (Postgres, Auth, Storage) | Database, login, foto, RLS |
| **Vercel** | Satu deployment untuk situs dan API |

---

## 5. Fitur

### Situs publik

- Lima halaman: beranda, tentang, layanan, portofolio, kontak.
- Filter kategori, lightbox dengan panah dan swipe, animasi reveal.
- Form brief WhatsApp, marquee layanan, tautan anchor.
- `/api/projects` hanya mengirim kolom publik dan karya `published`, cache 30 detik di edge dengan stale-while-revalidate 120 detik.
- HTML awal tetap berisi karya statis sebagai cadangan untuk mesin pencari dan pengunjung tanpa JavaScript.
- Lightbox menampilkan seluruh foto satu karya: sampul dulu, lalu galeri, lanjut ke karya berikutnya.

### Meja kerja admin

| Rute | Isi |
|---|---|
| `/admin` | Ringkasan: jumlah karya, terbit, draf, foto |
| `/admin/portfolio` | Daftar karya, filter status, urutan, aksi |
| `/admin/portfolio?edit=id` | Editor karya dan galeri |
| `/admin/analitik` | Statistik Umami |
| `/admin/koneksi` | Status Supabase, SQL setup, ekspor demo |
| `/admin/akun` | Ganti kata sandi tanpa email |

- Mode otomatis: Supabase kalau env tersedia, IndexedDB demo kalau tidak.
- Unggah foto: JPG/PNG/WebP, maksimal 15 MB, diperkecil sampai sisi terpanjang 1400px, dikodekan ulang ke WebP kualitas 0.82.
- Rasio potong dipilih yang terdekat dengan bentuk asli foto (3:4, 4:5, 1:1, 4:3).
- Status terbit memakai kata, bukan hanya warna. Target sentuh minimal 44px, fokus keyboard terlihat.

---

## 6. Keamanan

- RLS di level database, bukan aplikasi.
- Kebijakan: publik hanya baca `published`; pengguna login bebas baca, tambah, ubah, hapus.
- Empat kebijakan Storage untuk bucket `portfolio` (baca publik, tulis hanya login).
- Hanya publishable key di browser. Secret key tidak pernah masuk bundle.
- Header dari `vercel.json`: `nosniff`, `strict-origin-when-cross-origin`, `SAMEORIGIN`, Permissions-Policy mematikan kamera/mikrofon/lokasi, `noindex` untuk seluruh `/admin`.

---

## 7. Pelajaran dari Proyek

| Gejala | Sebab | Perbaikan |
|---|---|---|
| Endpoint Supabase 404 | URL diberi akhiran `/rest/v1/` | Pakai URL domain saja |
| Key ditolak | Memakai secret key | Ganti publishable key |
| Build admin jatuh ke mode demo | Env Vercel bertipe Secret | Ubah ke Config, redeploy |
| Karya baru tidak terlihat | Halaman publik belum baca database | Tambah `/api/projects` |
| 12 karya lama hilang | Data demo hanya di IndexedDB | Seed ke Supabase |
| Perubahan belum terlihat | Cache edge | Uji dengan cache buster |
| Nomor urut seed berbaur | Hardcode 1 sampai 12 | Hitung dari `max(sort_order)` |
| Galeri tidak muncul | Kolom ada, tampilan belum | Sambungkan lightbox |

Prinsip yang dipegang: bukti mengalahkan dugaan. Satu query database menghemat berjam-jam debugging UI.

---

## 8. Skill yang Terdemonstrasi

- Astro static output + serverless route dalam satu proyek.
- Supabase: Postgres, Auth kata sandi, Storage, RLS.
- TypeScript dan antarmuka `Repository` dengan dua implementasi.
- Pengolahan gambar di browser (Canvas, WebP, batas ukuran).
- Aksesibilitas: kontras, fokus, target sentuh, label pembaca layar.
- Deployment Vercel dengan env publik saat build.
- Diagnosis tiga lapis: dashboard, database, halaman publik.

---

## 9. Yang Belum Selesai

1. Umami belum diisi; endpoint siap, kunci API dan website ID belum ada.
2. Domain kustom `toelipinterior.com` belum didaftarkan.
3. Beranda masih memakai 6 kartu statis; halaman portofolio sudah dinamis.
4. Backup manual berkala belum dijadwalkan.
5. Vercel Hobby tidak untuk penggunaan komersial.

---

> Sumber: catatan proyek di vault Momogi, 21 November 2026.
