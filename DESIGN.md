# DESIGN.md: Ilham Oktian Portfolio

Arah visual untuk portfolio developer. Dokumen ini dipakai agen sebagai sumber keputusan, `antislop` sebagai filter.

## Design Read

Portfolio pribadi untuk rekruter dan calon klien. Satu medan gelap yang tenang, disiplin editorial, dengan beberapa jeda sinematik saat scroll. Dial **ENERGY 3 / RHYTHM 4 / MOTION 5**.

- **Energy 3**: tidak ada kartu proyek, tidak ada bayangan di konten, dan tidak ada gradien dekoratif. Kemewahan datang dari skala, jarak, dan garis rambut.
- **Rhythm 4**: judul besar, satu garis pemisah per bagian, lalu ruang kosong yang lega.
- **Motion 5**: hero, pita kapabilitas, dan sepuluh adegan portfolio bergerak sebagai satu komposisi. Gerakan menjelaskan posisi, bukan menghias.

## Identitas yang Dipertahankan

- Latar `#0d1117` dan satu aksen indigo: sudah jadi identitas sejak versi pertama.
- Inter untuk teks, Fira Code untuk label meta dan status.
- Loader lightsaber dan foto profil bulat: tidak diubah.
- Timeline, toggle EN/ID, dan scrollspy: tetap bekerja.
- Sepuluh proyek di satu urutan portfolio, semuanya bisa diklik.
- Pill keahlian tetap berwarna dan tetap berbentuk pil.

## Palet

| Token | Nilai | Guna |
|---|---|---|
| `--bg` | `#0d1117` | Latar seluruh halaman |
| `--bg-deep` | `#090d12` | Bingkai gambar proyek |
| `--wire` | `rgba(255,255,255,0.10)` | Garis pemisah dekoratif |
| `--wire-strong` | `rgba(255,255,255,0.28)` | Garis yang membawa affordance |
| `--field-line` | `rgba(255,255,255,0.38)` | Garis bawah field form |
| `--ink` | `#e8eef6` | Teks utama |
| `--muted` | `#9aa6b4` | Teks sekunder |
| `--accent` | `#818cf8` | Indeks, link aktif, fokus, satu tombol |
| `--ink-on-accent` | `#0b1020` | Teks di atas tombol indigo |

Indigo tidak dipakai untuk dekorasi. Hanya untuk indeks proyek, link yang aktif atau hover, focus ring, progress bar, dan tombol kirim. Semua permukaan lain memakai kertas dan tinta.

Kontras: teks utama 14.5:1, teks sekunder 7.7:1 pada `#0d1117`. Tombol memakai teks `#0b1020` di atas `#818cf8` (6.3:1). Focus ring indigo 2px (6.3:1).

## Tipografi

| Peran | Font | Ukuran | Alasan |
|---|---|---|---|
| Nama hero | Inter 600, letter-spacing -0.045em | clamp 2.125rem sampai 6rem | Satu pernyataan besar, bukan banner |
| Judul bagian | Inter 600, letter-spacing -0.035em | clamp 2rem sampai 3.5rem | Skala yang sama di semua bagian |
| Judul proyek | Inter 600, letter-spacing -0.025em | clamp 1.5rem sampai 2rem | Terbaca dari jarak baca normal |
| Teks | Inter 400 | 0.9375rem sampai 1.0625rem / 1.7 | Netral dan mudah dipindai |
| Label meta | Fira Code 400 atau 500 | 0.6875rem sampai 0.75rem | Menandai data, dipakai hemat |

Tidak ada font display baru. Kemewahan dibentuk oleh ukuran, jarak, dan jumlah kata yang sedikit.

## Spacing dan Bentuk

- Shell maksimal 1320px, padding samping `clamp(20px, 5vw, 64px)`.
- Jarak bagian `clamp(80px, 10vw, 144px)`. Satu garis rambut di atas setiap bagian.
- Radius 0 untuk semua permukaan, tombol, dan field.
- Pengecualian radius: pill keahlian, foto profil bulat, dan dock navigasi.
- Konten tidak memakai shadow atau elevasi. Kedalaman datang dari tumpukan sticky dan kontras latar.
- Satu-satunya bayangan ada di dock navigasi, dipakai untuk memisahkan kaca dari konten di belakangnya.

## Komposisi

- Nav: satu dock kaca mengambang, lebar maksimal 1040px, tinggi 60px, berjarak 12px dari atas. Brand "Ilham Oktian" di kiri, link dan toggle EN/ID di kanan. Dock memakai `backdrop-filter: blur(24px) saturate(180%)`, border tipis, dan garis specular di tepi atas. Tidak ada penanda `[IO]`.
- Hero: nama besar dua baris, peran mono, satu paragraf, satu text link, foto bulat dengan cincin tipis. Stage 200vh dengan hero sticky 100svh.
- About: menutup hero seperti tirai, latar solid, dua kolom teks.
- Experience: rel kiri berisi label kelompok, timeline kanan dengan garis rambut dan titik indigo.
- Toolkit: tiga kolom, label mono, pill berikon.
- Interlude: pita kapabilitas satu baris di antara Toolkit dan Portfolio, bergerak horizontal saat melewati viewport.
- Portfolio: satu stage berisi sepuluh proyek. Di layar lebar, kolom kiri 7fr berisi plate sticky dan kolom kanan 5fr berisi sepuluh adegan teks 55vh. Di layar sempit, stage setinggi `10 * 72svh` dengan sequence sticky 100svh di bawah nav: plate di atas, satu panel teks di bawahnya, dan rel teks bergeser saat scroll. Di ponsel lanskap pendek, plate dan teks berdampingan agar judul tidak tertutup.
- Plate: bingkai browser dengan bar 34px berisi tiga titik dan URL, lalu viewport gambar dengan rasio `1919 / 869`. Screenshot lebar memakai `cover` dari kiri atas, SpendScan memakai `contain`, dan IKN memakai `cover` dengan fokus `center 42%`.
- Contact: pernyataan besar dan email raksasa di kiri, form datar di kanan. Tidak ada kartu form.
- Footer: satu baris mono, back to top berupa text link.

## Motion

### Load dan hero

- Loader lightsaber tetap menjadi pembuka. Setelah loader selesai, `body.is-ready` memicu koreografi: dua baris nama naik dari mask, lalu paragraf membuka lewat `clip-path`, dan foto profil membuka sebagai lingkaran.
- `.hero-stage` setinggi 200vh. `.hero` sticky di `top: 0`, tinggi 100svh.
- About setinggi 100vh dengan latar solid, jadi ia menutup hero tepat saat pin selesai.
- Selama 100vh pertama, bintang turun 140px, copy naik 48px, dan foto turun 64px. Nama ikut bergerak bersama copy.
- Tidak ada fade opacity pada teks. Teks sudah terbaca sebelum gerakan dimulai.

### Pita kapabilitas

- Pita berisi dua grup identik. Saat melewati viewport, track bergeser maksimal 50% ke kiri, cukup untuk mulus menyambung grup kedua.
- Di reduced motion, track diam dan pita tetap terbaca sebagai daftar statis.

### Portfolio plate

- Di layar lebar: plate sticky di kolom kiri dengan offset `--nav-h + 20px`. Sepuluh adegan teks masing-masing minimal 55vh. Satu IntersectionObserver dengan band tengah viewport menentukan proyek aktif.
- Di layar sempit: `.work-stage` setinggi `10 * 72svh`. `.work-sequence` sticky di bawah nav dengan tinggi 100svh dikurangi nav. Plate mengisi lebar, rel teks di bawahnya hanya menampilkan satu panel; scroll progress memindahkan rel satu panel per sepersepuluh perjalanan stage.
- Di ponsel lanskap pendek, plate dan rel teks berbagi satu baris: plate 52% di kiri, teks di kanan, supaya judul tidak pernah tertutup gambar.
- Gambar berganti dengan crossfade dan scale halus 620ms. Counter `[01 / 10]` dan URL browser ikut berubah.
- Progress bar tipis di bawah plate mengikuti perjalanan seluruh stage.
- Teks panel tidak di-fade dengan opacity. Panel non-aktif memakai warna `--muted` agar adegan berikutnya terbaca sebagai pratinjau, lalu berubah ke `--ink` saat aktif. Panel aktif juga bergeser 4px dan indeksnya berubah indigo.
- Link hidup di panel teks, bukan di gambar. Di layar sempit, panel yang tidak aktif diberi `inert` dan link-nya `tabindex="-1"`, jadi tidak ada focusable tersembunyi.

### Reveal dan navigasi

- Scroll progress bar 2px di tepi atas halaman mengikuti posisi baca.
- Dock navigasi bersembunyi saat scroll turun lebih dari 6px dan kembali saat scroll naik. Dock juga kembali saat ada fokus keyboard di dalamnya.
- Specular kaca mengikuti pointer di dalam dock. Di perangkat sentuh, lapisan specular tidak muncul agar permukaan tetap bersih.
- Section head, paragraf About, baris Experience, grup Toolkit, intro Portfolio, dan Contact memakai `data-reveal`: `clip-path` membuka dari bawah plus translasi 22px. Tidak ada fade opacity.
- Scrollspy memakai posisi section terhadap garis 25% viewport, bukan animasi reveal.
- Menu ponsel membuka di dalam dock yang sama, bukan sheet terpisah. Saat terbuka, latar dock menguat ke 94% agar kontras teks tetap tinggi.
- Toggle bahasa mengganti seluruh teks tanpa memuat ulang halaman.
- `prefers-reduced-motion: reduce` mematikan loader, parallax, pita bergerak, reveal, dan semua transisi. Teks tetap di tempatnya dan semua konten tetap terbaca.

## Aksesibilitas

- Target sentuh minimal 44px: nav, toggle, link proyek, link kontak, back to top, tombol kirim.
- Focus ring 2px indigo dengan offset 3px.
- Skip link ke `#main`.
- Gambar plate dekoratif memakai `alt=""` dan plate diberi `aria-hidden`. Judul proyek ada di teks.
- Di layar sempit, panel proyek yang tidak aktif memakai `inert` dan link-nya `tabindex="-1"`, jadi tab hanya mencapai proyek yang terlihat.
- Semua gambar punya dimensi atau aspect-ratio untuk mencegah layout shift.
- Teks sekunder tetap AA di atas kaca gelap, termasuk saat menu ponsel terbuka.

## Batasan

- Tidak ada emoji di teks UI.
- Tidak ada em dash di teks.
- Tidak ada angka, testimoni, atau klaim tanpa sumber.
- Tidak ada kartu proyek, filter arsip, atau panel terpisah untuk menu ponsel.
- Glassmorphism hanya di dock navigasi. Konten tetap datar.
- Tidak ada fade opacity sebagai satu-satunya reveal teks.
