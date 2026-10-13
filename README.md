# ♻️ EcoSort — Smart Waste Sorting Game

> **“Sort It Right, Keep Earth Bright!”**

EcoSort adalah game edukasi interaktif untuk belajar memilah sampah: pemain melihat satu sampah,
memilih satu dari empat tempat pemilahan (**Organik**, **Daur Ulang**, **Residu**, **B3 / Khusus**),
lalu langsung mendapat penjelasan singkat agar bisa belajar dari kesalahan.

Proyek ini dibuat sebagai **tugas akhir semester (UAS)** oleh kelompok beranggotakan **3 mahasiswa
Sistem Informasi**. Aplikasi berjalan **100% di browser**: tidak ada backend, tidak ada database,
tidak ada login, dan tidak ada API berbayar.

---

## 1. Fitur Utama

| Fitur | Keterangan |
| --- | --- |
| 🏠 Landing page | Hero asimetris + **mini-game demo** yang benar-benar bisa dimainkan langsung |
| 🎯 Classic Mode | 10 soal per ronde, feedback setelah tiap jawaban, tombol “Lanjut” |
| ⏱️ Time Challenge | 60 detik, 3 nyawa, timer berbasis *timestamp* (akurat walau tab di-background), pause/resume |
| 📖 Learning Mode | Tanpa timer & tanpa nyawa, penjelasan kategori + fakta + cara penanganan |
| 🧾 Halaman hasil | Skor, benar/salah, akurasi, durasi, streak terbaik, XP, naik level, “Pelajari Kesalahan” |
| 📚 Ensiklopedia | 34 item sampah, pencarian nama, filter kategori, pengurutan, detail lengkap, penanda “sudah dipelajari” |
| 🏆 Papan pencapaian | 9 pencapaian + progres menuju tiap syarat, riwayat 12 ronde terakhir |
| ⚙️ Pengaturan | Efek suara, animasi, tema Terang/Redup, reset progres dengan konfirmasi |
| 💾 LocalStorage | `ecosort_settings`, `ecosort_progress`, `ecosort_achievements`, `ecosort_history` |

### Aturan skor (mudah dijelaskan saat presentasi)

- Jawaban benar: **+100 poin**
- Bonus streak: **+25 poin** untuk setiap jawaban benar beruntun **mulai jawaban ke-3**
- Jawaban salah: **0 poin**, streak kembali ke nol (di Time Challenge: **-1 nyawa**)
- Learning Mode: salah **tidak** mengurangi skor maupun nyawa
- Time Challenge: jawaban **benar** langsung lanjut (tempo cepat), jawaban **salah** membekukan
  timer sebentar supaya penjelasan sempat dibaca — waktu beku tidak dihitung sebagai waktu bermain

### XP & level

| Mode | XP |
| --- | --- |
| Classic / Time | `benar × 20` + `streak × 5` (bila streak ≥ 3) + `50` bila ronde sempurna |
| Learning | `benar × 10` |

| Level | Gelar | XP minimal |
| --- | --- | --- |
| 1 | Pemula Hijau | 0 |
| 2 | Eco Explorer | 250 |
| 3 | Eco Ranger | 700 |
| 4 | Eco Hero | 1400 |
| 5 | Eco Legend | 2400 |

Akurasi = `jawaban benar ÷ jumlah soal dijawab × 100` (pembagian dengan nol sudah diamankan).

---

## 2. Teknologi

- **React 19 + TypeScript + Vite 7** untuk menyusun komponen dan logika.
- **Tailwind CSS v4** untuk styling, plus **CSS variable** agar tema Terang/Redup bisa berganti tanpa mengubah komponen.
- **LocalStorage** untuk progres, pengaturan, pencapaian, dan riwayat.
- **Web Audio API** untuk efek suara (tanpa file audio eksternal, tanpa autoplay).
- **SVG inline + emoji** untuk seluruh ilustrasi (tidak ada gambar eksternal yang bisa hilang).

> **Hasil build-nya tetap situs statis murni.** `npm run build` menghasilkan **satu file**
> `dist/index.html` (CSS & JS sudah di-inline oleh `vite-plugin-singlefile`). File itu bisa dibuka
> langsung dengan VS Code Live Server, di-`git push` ke GitHub Pages, atau diunggah ke hosting
> statis apa pun — **tanpa server, tanpa Node.js saat dijalankan pengguna**.

### Struktur folder proyek

```text
ecosort/
├── index.html                    # shell HTML + font + favicon SVG data-URI
├── README.md                     # dokumen ini
├── src/
│   ├── main.tsx                  # titik masuk React
│   ├── App.tsx                   # kerangka aplikasi: navigasi hash, latar, footer, toast
│   ├── index.css                 # design system: token warna, tema, utilitas, animasi
│   ├── store.tsx                 # pusat state: settings, progres, pencapaian, riwayat, toast
│   ├── data/
│   │   └── waste.ts              # 4 kategori + 34 item sampah (data soal)
│   ├── lib/
│   │   ├── game.ts               # mode, skor, streak, XP, level, akurasi, deck soal, pencapaian
│   │   ├── storage.ts            # baca/tulis LocalStorage + validasi + fallback aman
│   │   └── audio.ts              # efek suara Web Audio API
│   ├── components/
│   │   ├── icons.tsx             # seluruh ikon SVG inline
│   │   ├── ui.tsx                # Button, Card, ProgressBar, Chip, Toggle, Modal, Toast, StatTile
│   │   └── sorting.tsx           # CategoryBadge, TrashBin (tutup bisa terbuka), WasteCard
│   ├── pages/
│   │   ├── LandingPage.tsx       # beranda + demo sorter + progres lokal
│   │   ├── ModesPage.tsx         # pilih mode + aturan skor + tabel level
│   │   ├── PlayPage.tsx          # gameplay (HUD, timer, nyawa, feedback, pause/exit)
│   │   ├── ResultPage.tsx        # hasil ronde + modal “Pelajari Kesalahan”
│   │   ├── EncyclopediaPage.tsx  # ensiklopedia + pencarian + filter + detail
│   │   ├── AchievementsPage.tsx  # papan pencapaian + riwayat ronde
│   │   └── SettingsPage.tsx      # pengaturan + data + reset
│   └── utils/cn.ts               # penggabungan className
└── dist/
    └── index.html                # hasil build: SATU file statis siap GitHub Pages
```

### Pemetaan ke struktur vanilla (bila dosen mewajibkan tanpa framework)

| Versi vanilla yang diminta | Padanan di proyek ini |
| --- | --- |
| `index.html` | `index.html` + JSX di `src/App.tsx` dan `src/pages/*` |
| `css/style.css` | `src/index.css` (token warna, tema, animasi) + utility Tailwind |
| `js/data.js` | `src/data/waste.ts` |
| `js/game.js` | `src/lib/game.ts` + `src/pages/PlayPage.tsx` |
| `js/storage.js` | `src/lib/storage.ts` |
| `js/app.js` | `src/App.tsx` + `src/store.tsx` |
| `assets/icons/` | `src/components/icons.tsx` (SVG inline, jadi tidak butuh folder aset) |

Pemisahan tanggung jawabnya identik: **data**, **logika game**, **penyimpanan**, dan **tampilan**
dipisah ke file berbeda sehingga mudah dipindahkan ke versi HTML/CSS/JS murni.

---

## 3. Cara Menjalankan

### A. Mode pengembangan

```bash
npm install
npm run dev      # buka http://localhost:5173
```

### B. Menjalankan hasil build dengan VS Code Live Server

```bash
npm run build    # menghasilkan dist/index.html (satu file, semua aset sudah inline)
```

1. Buka folder `dist/` di VS Code.
2. Klik kanan `index.html` → **Open with Live Server**.
3. Semua fitur (LocalStorage, suara, timer) bekerja normal karena file-nya statis dan mandiri.

> Seluruh referensi aset memakai path relatif, jadi aman untuk **GitHub Pages project site**
> (`https://username.github.io/nama-repo/`).

---

## 4. Cara Menguji Semua Mode

1. **Beranda** → klik **Mulai Bermain** (harus membuka halaman pilih mode).
2. **Classic Mode** → jawab 10 soal; pastikan:
   - tiap jawaban memunculkan feedback (ikon ✓/✗ + teks, bukan warna saja),
   - tombol tempat sampah terkunci saat feedback,
   - soal tidak berulang dalam satu ronde,
   - tombol **Lanjut** baru berpindah setelah feedback terbaca.
3. **Time Challenge** → pastikan timer berjalan, tombol pause/resume menghentikan & melanjutkan waktu,
   nyawa berkurang saat salah, dan ronde berakhir saat waktu habis **atau** nyawa 0.
   Uji akurasi timer: mulai ronde → pindah ke tab lain 10 detik → kembali; sisa waktu harus berkurang
   sekitar 10 detik (bukan membeku).
4. **Learning Mode** → jawab salah; skor tidak berkurang, tidak ada nyawa, dan panel penjelasan
   (kategori, fakta, cara penanganan) muncul lengkap.
5. **Halaman hasil** → cek skor, benar/salah, akurasi, durasi, streak terbaik, XP, lalu klik
   **Main Lagi**, **Pelajari Kesalahan**, dan **Kembali ke Beranda**.
6. **Ensiklopedia** → cari “baterai”, “kardus”, “tisu”; filter per kategori; urutkan; buka detail item;
   coba kata kunci acak untuk melihat *empty state*.
7. **Pencapaian** → mainkan sampai syarat terpenuhi dan perhatikan notifikasi pencapaian baru.
8. **Pengaturan** → matikan suara (game tetap berjalan senyap), matikan animasi, ganti tema Redup,
   lalu **Reset progres** (muncul dialog konfirmasi, bisa ditutup dengan Esc).
9. Muat ulang halaman (F5): progres, level, pencapaian, dan pengaturan **harus tetap ada**.

---

## 5. Skenario Pengujian & Hasil yang Diharapkan

| # | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| 1 | Klik “Mulai Bermain” di beranda | Halaman pilih mode terbuka |
| 2 | Mainkan Classic Mode sampai selesai | Tepat 10 soal, lalu halaman hasil muncul |
| 3 | Jawab benar / salah | Feedback ✓ “Tepat sekali!” / ✗ “Belum tepat” + kategori benar + alasan |
| 4 | Jawab benar 3× beruntun | Poin = 100, 100, 125 (bonus streak aktif mulai jawaban ke-3) |
| 5 | Jawab salah setelah streak | Streak kembali 0, skor tidak berkurang (Classic/Learning) |
| 6 | Satu ronde penuh | Tidak ada item yang muncul dua kali |
| 7 | Time Challenge dibiarkan | Berhenti otomatis saat waktu habis, hasil tercatat |
| 8 | Pause → Resume di Time Challenge | Timer berhenti dan lanjut dari sisa waktu yang sama |
| 9 | Salah di Learning Mode | Skor & nyawa tidak berkurang, penjelasan lengkap muncul |
| 10 | Ronde dengan 0 jawaban dijawab | Akurasi 0% (tidak ada error pembagian nol) |
| 11 | Klik “Main Lagi” di hasil | Ronde baru dengan soal teracak dimulai |
| 12 | Pencarian & filter Ensiklopedia | Daftar menyusut sesuai kata kunci/kategori + empty state bila kosong |
| 13 | Selesaikan ronde pertama | Pencapaian **First Sort** terbuka + notifikasi muncul |
| 14 | Muat ulang browser | XP, level, skor terbaik, pencapaian tetap tersimpan |
| 15 | Reset progres | Dialog konfirmasi; setelah dikonfirmasi semua data lokal terhapus |
| 16 | Suara dimatikan | Tidak ada bunyi, permainan tetap berjalan normal |
| 17 | Semua tombol navigasi | Berpindah halaman tanpa reload, tombol kembali berfungsi |
| 18 | Buka di layar 360px | Tidak ada scroll horizontal, tempat sampah jadi grid 2 kolom |
| 19 | Deploy ke GitHub Pages | Situs terbuka di `https://username.github.io/repo/` |
| 20 | Cek Console browser | Tidak ada error JavaScript yang menghalangi permainan |

---

## 6. Penjelasan Logika dengan Bahasa Sederhana

- **`buildDeck(jumlah)`** — mengacak urutan 34 item sampah lalu mengambil sejumlah yang diminta.
  Yang diacak hanya **urutan**; pasangan “sampah → kategori benar” tidak pernah diubah.
- **`createDeckStream()`** — untuk Time Challenge, menghasilkan soal terus-menerus tanpa mengulang
  item yang sama dua kali berturut-turut.
- **`pointsForAnswer(benar, streakSebelum)`** — mengembalikan 100 (+25 bila streak setelah menjawab
  sudah ≥ 3) atau 0 bila salah.
- **`computeAccuracy(benar, dijawab)`** — menghitung persentase dan mengembalikan 0 bila belum ada
  soal dijawab.
- **`xpForRound(...)`** — mengubah hasil ronde menjadi XP; level dihitung dari total XP, jadi level
  **tidak** naik hanya karena pemain berpindah halaman.
- **`levelInfo(xp)`** — menentukan level aktif, sisa XP, dan persentase progres ke level berikutnya.
- **`findNewAchievements(progres, sudahTerbuka)`** — membandingkan data progres dengan syarat tiap
  pencapaian; hanya yang benar-benar memenuhi syarat yang dibuka.
- **Timer Time Challenge** — menyimpan `deadline = Date.now() + sisaWaktu`. Setiap 100 ms aplikasi
  menghitung ulang `deadline - Date.now()`, sehingga walaupun browser menunda interval di tab latar,
  waktu yang ditampilkan tetap benar. Saat pause, sisa waktu disimpan; saat resume, `deadline`
  dihitung ulang dari sisa tersebut.
- **`storage.ts`** — semua baca/tulis LocalStorage dibungkus `try-catch` dan tiap nilai divalidasi
  (angka negatif, tipe salah, atau JSON rusak dikembalikan ke nilai default).

---

## 7. Pembagian Tugas 3 Anggota

| Anggota | Tanggung jawab | File utama |
| --- | --- | --- |
| **1 — Game Logic** | Struktur data soal, validasi jawaban, skor/streak/level, alur ronde & hasil | `src/data/waste.ts`, `src/lib/game.ts`, `src/pages/PlayPage.tsx` |
| **2 — UI/UX** | Struktur halaman, styling, landing page, gameplay, hasil, responsivitas | `src/index.css`, `src/components/*`, `src/pages/LandingPage.tsx`, `ModesPage.tsx`, `ResultPage.tsx` |
| **3 — Edukasi, Data & Testing** | Konten ensiklopedia, LocalStorage, pencapaian, pengujian, dokumentasi | `src/lib/storage.ts`, `src/store.tsx`, `src/pages/EncyclopediaPage.tsx`, `AchievementsPage.tsx`, `SettingsPage.tsx`, `README.md` |

Ketiga anggota **wajib** memahami alur: *soal → validasi → skor/streak → hasil → XP/level →
pencapaian → penyimpanan*, karena bagian presentasi dan sesi tanya jawab dosen bisa ditujukan ke
siapa saja.

### Rencana pengerjaan 5 minggu

| Minggu | Fokus | Luaran |
| --- | --- | --- |
| 1 | Kebutuhan, wireframe, desain, penentuan kategori & data soal | Wireframe + 34 item sampah final |
| 2 | Landing page, navigasi, gameplay dasar, struktur data | Bisa berpindah halaman & menjawab soal |
| 3 | Skor, streak, timer, hasil, validasi, Learning Mode | Ketiga mode bisa dimainkan sampai selesai |
| 4 | Ensiklopedia, pencapaian, penyimpanan, responsivitas | Data tersimpan & halaman edukasi lengkap |
| 5 | Pengujian, perbaikan bug, deploy GitHub Pages, dokumentasi | Situs live + README + slide presentasi |

---

## 8. Deploy ke GitHub Pages

1. Build situs:
   ```bash
   npm run build
   ```
2. Buat repository baru, misalnya `ecosort`, lalu unggah **isi folder `dist/`**:
   ```bash
   cd dist
   git init
   git add index.html
   git commit -m "Rilis EcoSort ke GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/USERNAME/ecosort.git
   git push -u origin main
   ```
3. Buka **Settings → Pages**, pilih **Deploy from a branch** → `main` → folder `/ (root)` → Save.
4. Situs tampil di `https://USERNAME.github.io/ecosort/`.

> Karena hasil build berupa **satu file `index.html`** dengan CSS & JS ter-inline dan seluruh aset
> memakai path relatif, tidak perlu mengatur base path khusus dan tidak ada aset yang 404.

---

## 9. Batasan (jujur & penting untuk presentasi)

- GitHub Pages **hanya menyajikan file statis** — tidak ada Python/Node yang berjalan di server.
- LocalStorage **bukan database online**: data hanya ada di browser perangkat itu, tidak
  tersinkronisasi antarperangkat, dan hilang bila data situs dihapus atau memakai mode penyamaran.
- **Tidak ada leaderboard online maupun multiplayer** — angka yang tampil adalah progres lokal pemain.
- Tidak ada statistik komunitas/pengguna lain yang diklaim; semua angka di dashboard berasal dari
  permainan pengguna sendiri.
- Klasifikasi sampah di dalam game adalah **penyederhanaan untuk pembelajaran**. Penerimaan suatu
  barang untuk didaur ulang berbeda menurut fasilitas dan kebijakan daerah setempat.

---

## 10. Bila Dosen Mewajibkan Python

Versi web ini tetap statis di GitHub Pages. Bila Python diwajibkan, logika inti EcoSort dapat
ditulis ulang sebagai program Python (dijalankan di terminal/IDLE) karena seluruh aturannya murni
fungsi, tanpa DOM:

| Bagian | Padanan Python |
| --- | --- |
| Data item & kategori (`src/data/waste.ts`) | `data.py` → list of `dict` atau `dataclass WasteItem` |
| Validasi jawaban (`PlayPage.handleChoose`) | `game.py` → `def cek_jawaban(item, pilihan) -> bool` |
| Skor & streak (`pointsForAnswer`) | `game.py` → `def hitung_poin(benar, streak) -> int` |
| Pengelolaan ronde (`buildDeck`, `createDeckStream`) | `game.py` → `random.sample(ITEMS, 10)` |
| Akurasi (`computeAccuracy`) | `game.py` → `def akurasi(benar, dijawab) -> int` |
| Level & XP (`levelInfo`, `xpForRound`) | `game.py` → `LEVELS = [...]` + `def level_dari_xp(xp)` |
| Pencapaian (`findNewAchievements`) | `achievements.py` → simpan ke `progress.json` |
| Penyimpanan (`storage.ts`) | `storage.py` → modul `json` (baca/tulis) ke `ecosort_progress.json` |

Bila Python **harus menjadi backend website**, GitHub Pages tidak bisa menjalankannya — diperlukan
hosting terpisah yang mendukung Python (misalnya Render/Railway/Fly.io untuk API), sementara GitHub
Pages tetap dipakai untuk frontend statis. **Pastikan dulu persyaratan dosen** sebelum memilih jalur
ini, karena versi statis tanpa backend sudah memenuhi seluruh fitur EcoSort.

---

## 11. Aksesibilitas & Responsivitas

- Tidak ada scroll horizontal pada layar 360px; tempat sampah menjadi grid 2 kolom di mobile.
- Benar/salah selalu disampaikan dengan **ikon + teks + warna**, tidak mengandalkan warna saja.
- Semua elemen interaktif dapat dipakai dengan keyboard; fokus terlihat jelas (`:focus-visible`).
- Pintasan: `1–4` memilih tempat sampah, `Enter`/`Spasi` lanjut, `H` petunjuk, `Esc` jeda/tutup dialog.
- Menghormati `prefers-reduced-motion` dan menyediakan toggle “Animasi & transisi” di Pengaturan.
- Tidak ada autoplay audio; suara hanya berbunyi setelah interaksi pengguna.

---

*Dibuat untuk pembelajaran. Langkah kecil memilah sampah dengan benar berarti besar untuk lingkungan.* 🌱
