# Web Portfolio

Website portofolio pribadi: HTML, CSS, dan JavaScript tanpa framework.

## Struktur Workspace

```
├── assets/           # Screenshot asli dan foto profil
│   └── preview/      # Screenshot teroptimasi untuk plate portfolio
├── docs/
│   └── projects/     # PRD dan dokumentasi project
│       └── _template.md
├── index.html        # Halaman utama (semua konten)
├── main.js           # Interaktivitas (loader, nav, stage portfolio, EN/ID)
├── style.css         # Semua styling
├── DESIGN.md         # Arah visual dan spesifikasi motion
└── README.md
```

## Cara Menambah Project Baru

1. Buat file PRD di `docs/projects/` (copy dari `_template.md`).
2. Siapkan screenshot dengan rasio lebar sekitar 2.2:1, simpan versi teroptimasi di `assets/preview/`.
3. Tambah satu `.plate-img` di `.plate-view` dengan `data-work-image` sesuai urutan.
4. Tambah satu `article.work-scene` di `.work-rail` dengan `data-work-scene` dan `data-work-url` yang sama.
5. Perbarui tinggi stage di `style.css`: `calc(10 * 72vh)` dan `calc(10 * 72svh)` pada media query 899px.
6. Tambah teks EN dan ID di objek `i18n` pada `main.js`, lalu perbarui intro bila jumlah proyek berubah.

Counter dan total proyek dihitung otomatis dari jumlah `.work-scene`, jadi tidak perlu mengubah `[01 / 10]` secara manual.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan static server dari folder ini:

```
py -3 -m http.server 8123
```

## Tech Stack

- HTML5
- CSS3 (sticky, grid, custom properties, backdrop-filter)
- JavaScript vanilla (IntersectionObserver, requestAnimationFrame)
- FormSubmit untuk form kontak
