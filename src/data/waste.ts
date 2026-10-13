/* ==========================================================================
   EcoSort — Data Soal (dikelola oleh Anggota 1: Game Logic)
   --------------------------------------------------------------------------
   File ini HANYA berisi data, tanpa logika tampilan, supaya mudah
   ditambah/diubah oleh anggota kelompok tanpa merusak bagian lain.

   Struktur tiap item sampah:
   - id          : pengenal unik (dipakai untuk mengacak & menyimpan riwayat)
   - name        : nama sampah + konteks agar jawabannya tidak ambigu
   - category    : kategori jawaban yang BENAR (tidak pernah diacak)
   - emoji       : ilustrasi ringan (tidak butuh file gambar eksternal)
   - description : ciri fisik / dari mana sampah ini berasal
   - fact        : fakta edukasi singkat
   - handling    : cara penanganan umum yang aman
   - difficulty  : 1 = mudah, 2 = sedang, 3 = menjebak
   - reason      : alasan jawaban benar (dipakai di feedback)
   - wrongHint   : penjelasan singkat ketika pemain salah memilih
   - tags        : kata kunci tambahan untuk pencarian Ensiklopedia
   ========================================================================== */

export type CategoryId = "organik" | "daurulang" | "residu" | "b3";

export interface Category {
  id: CategoryId;
  name: string;
  binLabel: string;
  icon: "leaf" | "recycle" | "residue" | "hazard";
  tagline: string;
  description: string;
  note: string;
}

export interface WasteItem {
  id: string;
  name: string;
  category: CategoryId;
  emoji: string;
  description: string;
  fact: string;
  handling: string;
  difficulty: 1 | 2 | 3;
  reason: string;
  wrongHint: string;
  tags: string[];
}

/* ---------- 4 KATEGORI UTAMA ----------
   Setiap kategori selalu punya NAMA + IKON + WARNA, jadi pemain yang
   buta warna pun tetap bisa membedakan tempat sampah.                */
export const CATEGORIES: Category[] = [
  {
    id: "organik",
    name: "Organik",
    binLabel: "Organik",
    icon: "leaf",
    tagline: "Bisa terurai & dikompos",
    description:
      "Sisa bahan hayati (tumbuhan atau hewan) yang dapat terurai secara biologis. Dalam kondisi yang sesuai, sampah ini bisa diolah menjadi kompos, eco-enzyme, atau pakan ternak.",
    note: "Pisahkan dari plastik dan tiriskan airnya agar tidak berbau dan tidak mengundang lalat.",
  },
  {
    id: "daurulang",
    name: "Daur Ulang",
    binLabel: "Daur Ulang",
    icon: "recycle",
    tagline: "Bisa diolah jadi barang baru",
    description:
      "Bahan yang berpotensi diproses ulang oleh fasilitas yang sesuai, misalnya plastik PET, logam, kaca, kertas, dan kardus bersih.",
    note: "Tidak semua plastik atau kertas otomatis bisa didaur ulang: barang harus bersih, kering, dan diterima oleh fasilitas setempat (bank sampah / pengepul).",
  },
  {
    id: "residu",
    name: "Residu",
    binLabel: "Residu",
    icon: "residue",
    tagline: "Tidak masuk jalur daur ulang",
    description:
      "Sampah yang tidak dapat dimasukkan ke proses daur ulang maupun pengolahan organik yang tersedia dalam konteks permainan ini, biasanya karena kotor, tercampur, atau berlapis banyak bahan.",
    note: "Residu tetap harus dibuang pada tempatnya dan diusahakan berkurang sejak awal (misalnya membawa wadah sendiri).",
  },
  {
    id: "b3",
    name: "B3 / Khusus",
    binLabel: "B3 / Khusus",
    icon: "hazard",
    tagline: "Butuh jalur pengumpulan khusus",
    description:
      "Bahan Berbahaya dan Beracun serta sampah khusus (elektronik, baterai, lampu, kimia rumah tangga) yang memerlukan penanganan dan jalur pengumpulan tersendiri.",
    note: "Jangan mencampur baterai, lampu, atau limbah elektronik dengan sampah biasa, dan jangan membuangnya ke saluran air.",
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<CategoryId, Category>
);

/* Warna kategori (dipakai lewat CSS variable agar konsisten di tema terang/dim) */
export const CATEGORY_STYLE: Record<
  CategoryId,
  { text: string; soft: string; solid: string; ring: string }
> = {
  organik: { text: "text-org", soft: "bg-org-soft", solid: "bg-org", ring: "ring-org" },
  daurulang: { text: "text-rec", soft: "bg-rec-soft", solid: "bg-rec", ring: "ring-rec" },
  residu: { text: "text-res", soft: "bg-res-soft", solid: "bg-res", ring: "ring-res" },
  b3: { text: "text-haz", soft: "bg-haz-soft", solid: "bg-haz", ring: "ring-haz" },
};

/* ---------- 34 ITEM SAMPAH ---------- */
export const WASTE_ITEMS: WasteItem[] = [
  /* ---------------- ORGANIK ---------------- */
  {
    id: "org-sisa-sayur",
    name: "Sisa Potongan Sayur",
    category: "organik",
    emoji: "🥬",
    description: "Ujung batang, daun luar, dan kulit sayur sisa memasak di dapur.",
    fact: "Sisa sayur segar dapat terurai menjadi kompos dalam 4–8 minggu jika kelembapan dan udaranya cukup.",
    handling: "Tiriskan airnya, buang plastik/karetnya, lalu masukkan ke wadah kompos atau lubang biopori.",
    difficulty: 1,
    reason: "Sisa sayur adalah bahan hayati yang bisa terurai oleh mikroorganisme menjadi kompos.",
    wrongHint:
      "Sayuran bukan bahan yang bisa diolah ulang di fasilitas daur ulang. Jika masuk kantong plastik daur ulang, sisa sayur justru mengotori bahan lain.",
    tags: ["dapur", "kompos", "sayuran", "basah"],
  },
  {
    id: "org-kulit-pisang",
    name: "Kulit Pisang",
    category: "organik",
    emoji: "🍌",
    description: "Kulit buah pisang setelah buahnya dimakan.",
    fact: "Kulit pisang kaya kalium sehingga sering dipakai sebagai bahan kompos atau eco-enzyme.",
    handling: "Kumpulkan di wadah tertutup, lalu komposkan atau serahkan ke pengelola kompos.",
    difficulty: 1,
    reason: "Kulit buah termasuk sampah organik yang mudah terurai secara biologis.",
    wrongHint:
      "Kulit pisang akan membusuk dalam hitungan hari. Membuangnya ke jalur daur ulang atau residu membuat potensi komposnya hilang.",
    tags: ["buah", "kompos", "kulit", "basah"],
  },
  {
    id: "org-sisa-nasi",
    name: "Sisa Nasi & Lauk",
    category: "organik",
    emoji: "🍚",
    description: "Nasi, lauk, atau makanan matang yang tersisa di piring.",
    fact: "Sisa makanan adalah salah satu penyumbang terbesar sampah rumah tangga; mengurangi porsi ambil adalah cara paling hemat.",
    handling:
      "Pisahkan dari tulang besar dan kemasan, tiriskan, lalu masukkan wadah kompos tertutup agar tidak mengundang lalat.",
    difficulty: 1,
    reason: "Sisa makanan dapat terurai dan diolah menjadi kompos atau pakan ternak pada kondisi yang sesuai.",
    wrongHint:
      "Makanan basah akan merusak kertas dan plastik di jalur daur ulang. Tempat yang tepat adalah wadah organik.",
    tags: ["makanan", "kompos", "dapur", "basah"],
  },
  {
    id: "org-daun-kering",
    name: "Daun & Ranting Kering",
    category: "organik",
    emoji: "🍂",
    description: "Daun gugur, rumput potongan, dan ranting kecil dari halaman.",
    fact: "Daun kering adalah sumber karbon yang bagus untuk menyeimbangkan kompos dari sisa dapur yang kaya nitrogen.",
    handling: "Kumpulkan, cacah bila perlu, lalu campur ke tumpukan kompos atau jadikan pupuk daun.",
    difficulty: 1,
    reason: "Daun dan ranting adalah material tumbuhan yang terurai alami di tanah.",
    wrongHint:
      "Sampah halaman tidak bisa didaur ulang jadi produk baru. Membakarnya juga bukan solusi karena menghasilkan asap.",
    tags: ["kebun", "halaman", "kompos", "kering"],
  },
  {
    id: "org-ampas-kopi",
    name: "Ampas Kopi (tanpa sachet)",
    category: "organik",
    emoji: "☕",
    description: "Endapan bubuk kopi setelah diseduh, tanpa kemasan plastiknya.",
    fact: "Ampas kopi dapat membantu menggemburkan tanah dan mengurangi bau pada wadah kompos.",
    handling: "Tiriskan, keringkan sebentar, lalu campurkan ke kompos atau media tanam.",
    difficulty: 2,
    reason: "Bubuk kopi adalah bahan hayati yang terurai dan cocok untuk kompos.",
    wrongHint:
      "Ampas kopi bukan bahan daur ulang. Yang perlu diwaspadai adalah sachet kopinya: kemasan berlapis itu masuk residu.",
    tags: ["kopi", "kompos", "ampas", "dapur"],
  },
  {
    id: "org-cangkang-telur",
    name: "Cangkang Telur",
    category: "organik",
    emoji: "🥚",
    description: "Pecahan kulit telur sisa memasak.",
    fact: "Cangkang telur mengandung kalsium karbonat yang membantu memperbaiki tanah kebun.",
    handling: "Bilas dan keringkan, remukkan, lalu campur ke kompos atau taburkan di media tanam.",
    difficulty: 2,
    reason: "Cangkang telur berasal dari makhluk hidup dan terurai secara biologis, meski lebih lambat dari sisa sayur.",
    wrongHint:
      "Cangkang telur tidak bisa dilelehkan atau dipulpa seperti kemasan. Jalur yang tepat adalah kompos.",
    tags: ["telur", "kompos", "dapur", "kalsium"],
  },
  {
    id: "org-kulit-jeruk",
    name: "Kulit Jeruk & Buah",
    category: "organik",
    emoji: "🍊",
    description: "Kulit jeruk, apel, mangga, dan buah lain yang dikupas.",
    fact: "Kulit jeruk bisa difermentasi menjadi eco-enzyme atau pengharum alami, selain dikomposkan.",
    handling: "Kumpulkan terpisah, keringkan bila ingin dijadikan eco-enzyme, atau langsung komposkan.",
    difficulty: 1,
    reason: "Kulit buah adalah sampah organik yang mudah terurai dan bermanfaat untuk kompos.",
    wrongHint:
      "Kulit buah akan membusuk, bukan diolah ulang menjadi barang. Jadi tempatnya di wadah organik.",
    tags: ["buah", "jeruk", "kompos", "eco-enzyme"],
  },
  {
    id: "org-tulang-kecil",
    name: "Tulang Ayam & Duri Ikan",
    category: "organik",
    emoji: "🍗",
    description: "Sisa tulang kecil dan duri dari makanan.",
    fact: "Tulang terurai jauh lebih lama daripada sisa sayur, sehingga di fasilitas kompos kota sering diminta dihancurkan terlebih dulu.",
    handling:
      "Untuk skala rumah, kumpulkan terpisah dan kubur di lubang biopori; di lingkungan kampus, ikuti arahan pengelola sampah organik setempat.",
    difficulty: 3,
    reason:
      "Tulang dan duri berasal dari makhluk hidup sehingga termasuk organik, meski penguraiannya lambat.",
    wrongHint:
      "Tulang bukan kemasan sehingga tidak bisa didaur ulang. Di game ini tulang kecil masuk kategori organik.",
    tags: ["tulang", "ikan", "ayam", "kompos"],
  },

  /* ---------------- DAUR ULANG ---------------- */
  {
    id: "rec-botol-pet",
    name: "Botol Plastik PET (kosong & bersih)",
    category: "daurulang",
    emoji: "🧴",
    description: "Botol air mineral bening berkode PET/1 yang sudah dikosongkan dan dibilas.",
    fact: "PET adalah jenis plastik yang paling banyak diterima bank sampah; botol bekasnya bisa diolah jadi serat pakaian atau botol baru.",
    handling:
      "Kosongkan, bilas, lepaskan label bila diminta pengepul, lalu pipihkan dan kumpulkan terpisah dari sampah basah.",
    difficulty: 1,
    reason: "Botol PET yang bersih dan kering termasuk bahan yang paling umum diterima fasilitas daur ulang.",
    wrongHint:
      "Botol plastik bersih masih punya nilai jual. Membuangnya ke residu berarti membuang bahan yang bisa diproses ulang.",
    tags: ["plastik", "botol", "pet", "bank sampah"],
  },
  {
    id: "rec-kaleng-minuman",
    name: "Kaleng Minuman Aluminium",
    category: "daurulang",
    emoji: "🥫",
    description: "Kaleng soda atau minuman ringan berbahan aluminium, sudah kosong.",
    fact: "Aluminium dapat didaur ulang berulang kali; mendaur ulang satu kaleng menghemat energi jauh lebih besar dibanding membuatnya dari bijih baru.",
    handling: "Kosongkan, bilas, pipihkan bila memungkinkan, dan kumpulkan terpisah dari sampah basah.",
    difficulty: 1,
    reason: "Logam seperti aluminium punya nilai daur ulang tinggi dan diterima hampir semua pengepul.",
    wrongHint: "Kaleng aluminium bukan residu. Jika dibuang tercampur, logam yang mudah didaur ulang ini ikut terkubur.",
    tags: ["logam", "aluminium", "kaleng", "minuman"],
  },
  {
    id: "rec-botol-kaca",
    name: "Botol Kaca (bekas sirup/saus)",
    category: "daurulang",
    emoji: "🍾",
    description: "Botol atau toples kaca yang masih utuh, sudah dicuci.",
    fact: "Kaca dapat dilelehkan dan dibentuk ulang tanpa kehilangan kualitas, dan di banyak tempat botol utuh bisa dipakai kembali.",
    handling: "Cuci, keringkan, simpan terpisah agar tidak pecah, lalu serahkan ke bank sampah atau pengepul kaca.",
    difficulty: 2,
    reason: "Kaca bersih termasuk bahan yang bisa dilelehkan dan dibentuk ulang oleh fasilitas daur ulang.",
    wrongHint:
      "Kaca tidak terurai di alam sehingga bukan organik, dan nilainya terlalu tinggi untuk dibuang sebagai residu.",
    tags: ["kaca", "botol", "beling", "sirup"],
  },
  {
    id: "rec-kardus-bersih",
    name: "Kardus Bersih & Kering",
    category: "daurulang",
    emoji: "📦",
    description: "Kotak paket atau kardus yang tidak terkena minyak maupun cairan.",
    fact: "Serat kertas kardus bisa dipulpa dan dijadikan kertas baru; kardus adalah salah satu material yang paling banyak didaur ulang di dunia.",
    handling: "Lepaskan selotip dan bubble wrap, lipat agar ringkas, simpan di tempat kering.",
    difficulty: 1,
    reason: "Kardus bersih dan kering mudah dipulpa sehingga diterima di hampir semua jalur daur ulang kertas.",
    wrongHint:
      "Kardus yang masih bersih jangan dibuang ke residu. Justru nilai jualnya cukup tinggi di bank sampah.",
    tags: ["kardus", "kertas", "karton", "paket"],
  },
  {
    id: "rec-kertas-hvs",
    name: "Kertas HVS & Buku Tulis",
    category: "daurulang",
    emoji: "📄",
    description: "Kertas cetak, dokumen lama, dan buku tulis tanpa sampul plastik.",
    fact: "Satu ton kertas bekas yang didaur ulang menyelamatkan banyak pohon dan memakai air lebih sedikit dibanding membuat kertas baru.",
    handling: "Lepaskan sampul plastik, klip, dan spiral; tumpuk rapi dan jaga agar tidak basah.",
    difficulty: 1,
    reason: "Kertas bersih tanpa lapisan plastik dapat dipulpa kembali menjadi kertas baru.",
    wrongHint:
      "Kertas kering dan tidak berminyak masih sangat layak didaur ulang, jadi jangan masuk residu.",
    tags: ["kertas", "hvs", "buku", "kampus"],
  },
  {
    id: "rec-koran",
    name: "Koran & Majalah Lama",
    category: "daurulang",
    emoji: "📰",
    description: "Tumpukan koran, majalah, atau brosur yang sudah tidak dibaca.",
    fact: "Koran termasuk kertas berkualitas baik untuk didaur ulang, dan sering dipakai sebagai lapisan alas wadah kompos.",
    handling: "Ikat per tumpuk, jaga tetap kering, lalu serahkan ke bank sampah atau pengepul kertas.",
    difficulty: 1,
    reason: "Koran adalah kertas bersih yang mudah dipulpa ulang.",
    wrongHint: "Koran kering tidak boleh dibuang ke residu; ikat dan jual/serahkan agar jadi kertas baru.",
    tags: ["koran", "majalah", "kertas", "baca"],
  },
  {
    id: "rec-botol-hdpe",
    name: "Botol Sabun/Sampo HDPE (bersih)",
    category: "daurulang",
    emoji: "🧼",
    description: "Botol plastik tebal berkode HDPE/2 bekas sabun atau sampo, sudah dibilas.",
    fact: "HDPE banyak diterima pengepul dan dapat diolah menjadi ember, palet, atau botol non-makanan.",
    handling: "Habiskan isinya, bilas, keringkan, lalu kumpulkan bersama plastik lain yang bersih.",
    difficulty: 2,
    reason: "Botol HDPE yang sudah dibilas termasuk plastik bernilai yang diterima fasilitas daur ulang.",
    wrongHint:
      "Selama botolnya bersih, ia masih layak didaur ulang. Residu hanya untuk kemasan yang kotor atau berlapis banyak bahan.",
    tags: ["plastik", "hdpe", "sabun", "sampo"],
  },
  {
    id: "rec-kaleng-biskuit",
    name: "Kaleng Biskuit / Kemasan Logam",
    category: "daurulang",
    emoji: "🍪",
    description: "Kaleng biskuit, kaleng susu, atau wadah logam yang sudah kosong dan tidak berkarat parah.",
    fact: "Logam baja dan aluminium bisa didaur ulang berkali-kali; kaleng biskuit juga sering dipakai ulang sebagai wadah oleh keluarga di Indonesia.",
    handling: "Kosongkan, bersihkan sisa remah, tutup rapat bila ingin dipakai ulang, atau serahkan ke pengepul logam.",
    difficulty: 2,
    reason: "Wadah logam termasuk material daur ulang yang bernilai dan mudah dilebur ulang.",
    wrongHint: "Kaleng logam bukan residu. Bersihkan dulu, lalu masukkan ke jalur daur ulang logam.",
    tags: ["logam", "kaleng", "biskuit", "susu"],
  },

  /* ---------------- RESIDU ---------------- */
  {
    id: "res-tisu-bekas",
    name: "Tisu Bekas (kotor/lembap)",
    category: "residu",
    emoji: "🧻",
    description: "Tisu yang sudah dipakai mengelap mulut, tangan, atau tumpahan.",
    fact: "Serat tisu sangat pendek dan sudah terkontaminasi, sehingga tidak laku di jalur daur ulang kertas.",
    handling: "Buang ke tempat sampah residu; bila dipakai untuk cairan kimia, serahkan lewat jalur sampah khusus.",
    difficulty: 1,
    reason: "Tisu kotor dan basah tidak bisa dipulpa ulang dan tidak layak dikomposkan di jalur kota.",
    wrongHint:
      "Kertas yang sudah kotor tidak sama dengan kertas daur ulang. Tisu bekas masuk residu, bukan jalur kertas.",
    tags: ["tisu", "kertas", "kotor", "kamar mandi"],
  },
  {
    id: "res-popok",
    name: "Popok Sekali Pakai",
    category: "residu",
    emoji: "🧷",
    description: "Popok bekas yang berisi campuran gel penyerap dan kotoran.",
    fact: "Popok sekali pakai terdiri dari banyak lapisan bahan (plastik, gel, pulp) yang praktis tidak bisa dipisahkan di fasilitas biasa.",
    handling: "Buang isinya ke toilet bila memungkinkan, gulung dan bungkus rapat, lalu masukkan ke tempat sampah residu.",
    difficulty: 1,
    reason: "Popok tercampur kotoran dan berlapis banyak bahan sehingga masuk residu.",
    wrongHint:
      "Popok bukan organik meski mengandung sisa biologis, dan jelas tidak bisa didaur ulang bersama plastik bersih.",
    tags: ["popok", "bayi", "residu", "campuran"],
  },
  {
    id: "res-sachet",
    name: "Bungkus Sachet Multilayer (kopi/snack)",
    category: "residu",
    emoji: "🍬",
    description: "Kemasan tipis berlapis aluminium-plastik bekas kopi sachet, mi instan, atau snack.",
    fact: "Kemasan multilayer menyatukan beberapa bahan sekaligus sehingga pemisahannya mahal; banyak fasilitas lokal belum menerimanya.",
    handling:
      "Kumpulkan dalam satu wadah (beberapa komunitas membuat ecobrick), lalu buang ke residu bila tidak ada jalur khusus.",
    difficulty: 3,
    reason:
      "Kemasan berlapis yang tidak diterima fasilitas daur ulang setempat termasuk residu dalam konteks permainan ini.",
    wrongHint:
      "Meskipun berbahan plastik, sachet berlapis sulit dipisahkan sehingga tidak otomatis masuk jalur daur ulang.",
    tags: ["sachet", "plastik", "multilayer", "snack", "kopi"],
  },
  {
    id: "res-styrofoam",
    name: "Kotak Styrofoam Bekas Makanan",
    category: "residu",
    emoji: "🍱",
    description: "Wadah makan styrofoam yang masih berminyak dan beremah.",
    fact: "Styrofoam (EPS) sebagian besar isinya udara; hanya sedikit fasilitas yang menerimanya, dan yang kotor hampir pasti ditolak.",
    handling: "Buang sisa makanan, lalu masukkan ke residu. Pilih wadah pakai ulang saat membeli makanan berikutnya.",
    difficulty: 2,
    reason: "Styrofoam bekas makanan sudah terkontaminasi minyak sehingga masuk residu.",
    wrongHint:
      "Styrofoam berminyak tidak diterima pengepul plastik. Yang bisa didaur ulang biasanya EPS bersih dan dalam jumlah besar.",
    tags: ["styrofoam", "makanan", "minyak", "residu"],
  },
  {
    id: "res-kardus-pizza",
    name: "Kardus Pizza Berminyak",
    category: "residu",
    emoji: "🍕",
    description: "Bagian kardus yang basah dan berminyak oleh keju atau saus.",
    fact: "Minyak mengganggu proses pulpa kertas: satu kardus berminyak bisa membuat satu batch kertas daur ulang ditolak.",
    handling:
      "Sobek bagian yang masih bersih dan kering untuk didaur ulang, lalu buang bagian berminyaknya ke residu (atau kompos bila fasilitas menerima).",
    difficulty: 3,
    reason:
      "Kardus yang sudah berminyak tidak memenuhi syarat 'bersih dan kering' untuk jalur daur ulang kertas.",
    wrongHint:
      "Kardus memang bahan daur ulang, tetapi hanya jika bersih. Bagian berminyak harus dipisah ke residu.",
    tags: ["kardus", "pizza", "minyak", "kertas"],
  },
  {
    id: "res-puntung",
    name: "Puntung Rokok",
    category: "residu",
    emoji: "🚬",
    description: "Sisa puntung rokok dengan filter dan abu.",
    fact: "Filter rokok terbuat dari serat plastik (selulosa asetat) yang tidak terurai cepat dan sering ditemukan dalam audit sampah pantai.",
    handling: "Matikan sampai benar-benar dingin, lalu buang ke tempat residu; jangan dibuang ke selokan atau tanah.",
    difficulty: 2,
    reason: "Puntung rokok tercampur abu dan bahan kimia, tidak bisa dikomposkan maupun didaur ulang.",
    wrongHint: "Filter rokok bukan kertas organik dan tidak punya nilai daur ulang. Masuk residu.",
    tags: ["rokok", "puntung", "filter", "residu"],
  },
  {
    id: "res-sedotan",
    name: "Sedotan Plastik Sekali Pakai",
    category: "residu",
    emoji: "🥤",
    description: "Sedotan tipis bekas minuman, biasanya dalam kondisi basah.",
    fact: "Sedotan terlalu kecil dan ringan untuk disortir mesin daur ulang sehingga hampir selalu lolos menjadi residu.",
    handling: "Buang ke residu, atau tolak sedotan saat membeli minuman dan pakai sedotan pakai ulang.",
    difficulty: 2,
    reason: "Sedotan plastik tipis dan kotor tidak diterima mesin sortir fasilitas daur ulang.",
    wrongHint:
      "Walaupun plastik, ukurannya yang kecil dan kondisinya yang basah membuat sedotan tidak laku didaur ulang.",
    tags: ["sedotan", "plastik", "minuman", "residu"],
  },
  {
    id: "res-karton-susu",
    name: "Kotak Minuman Berlapis (susu/jus)",
    category: "residu",
    emoji: "🥛",
    description: "Karton minuman berlapis plastik dan aluminium foil.",
    fact: "Sebagian kota punya jalur khusus untuk karton minuman, tetapi banyak fasilitas pemilahan lokal belum menerimanya.",
    handling:
      "Bilas dan pipihkan bila ada bank sampah yang menerima; jika tidak ada, buang ke residu.",
    difficulty: 3,
    reason:
      "Karena menggabungkan kertas, plastik, dan foil, karton minuman masuk residu pada konteks game ini kecuali ada jalur khusus setempat.",
    wrongHint:
      "Kotak ini bukan 'kertas' biasa. Lapisan foil dan plastiknya membuat pemisahan sulit dilakukan fasilitas lokal.",
    tags: ["karton", "susu", "jus", "multilayer", "residu"],
  },
  {
    id: "res-masker",
    name: "Masker Medis Bekas",
    category: "residu",
    emoji: "😷",
    description: "Masker sekali pakai yang sudah digunakan seharian.",
    fact: "Masker bekas berpotensi membawa kuman sehingga tidak boleh dicampur dengan bahan daur ulang yang disentuh banyak orang.",
    handling:
      "Robek atau gunting talinya, bungkus rapat, lalu buang ke tempat residu dan cuci tangan setelahnya.",
    difficulty: 2,
    reason: "Masker bekas termasuk sampah terkontaminasi yang aman dibuang ke jalur residu.",
    wrongHint:
      "Masker berbahan plastik, tetapi karena sudah terkontaminasi, ia tidak boleh masuk jalur daur ulang.",
    tags: ["masker", "medis", "kesehatan", "residu"],
  },

  /* ---------------- B3 / KHUSUS ---------------- */
  {
    id: "b3-baterai",
    name: "Baterai Bekas",
    category: "b3",
    emoji: "🔋",
    description: "Baterai AA/AAA atau baterai kancing dari jam, remot, dan mainan.",
    fact: "Baterai mengandung logam berat yang dapat mencemari tanah dan air bila bocor di tempat pembuangan umum.",
    handling:
      "Simpan di wadah kering tertutup (isolasi kutubnya), lalu serahkan ke titik drop-off baterai; jangan dibakar atau dicampur sampah biasa.",
    difficulty: 1,
    reason: "Baterai termasuk limbah B3 yang wajib dikumpulkan lewat jalur khusus, bukan sampah harian.",
    wrongHint:
      "Jangan masukkan baterai ke residu atau daur ulang biasa: logam beratnya bisa mencemari lingkungan dan membahayakan petugas.",
    tags: ["baterai", "b3", "logam berat", "elektronik"],
  },
  {
    id: "b3-bohlam",
    name: "Bohlam / Lampu Bekas",
    category: "b3",
    emoji: "💡",
    description: "Lampu pijar, neon (TL), atau LED yang sudah mati.",
    fact: "Lampu tabung neon mengandung uap merkuri dalam jumlah kecil sehingga perlu penanganan khusus agar tidak pecah.",
    handling:
      "Simpan dalam wadah keras agar tidak pecah, lalu bawa ke titik pengumpulan lampu/limbah B3. Jangan dibuang ke saluran air.",
    difficulty: 2,
    reason: "Lampu termasuk limbah khusus yang tidak boleh pecah bersama sampah rumah tangga biasa.",
    wrongHint:
      "Kaca lampu bukan kaca daur ulang (komposisinya berbeda) dan beberapa jenis mengandung merkuri. Jalur khusus lebih aman.",
    tags: ["lampu", "bohlam", "merkuri", "b3"],
  },
  {
    id: "b3-earphone",
    name: "Earphone / Headset Rusak",
    category: "b3",
    emoji: "🎧",
    description: "Earphone kabel atau TWS yang sudah tidak berfungsi.",
    fact: "Sampah elektronik mengandung logam berharga sekaligus bahan berbahaya, jadi lebih baik dipulihkan daripada dikubur.",
    handling: "Serahkan ke titik pengumpulan e-waste kampus atau layanan servis; jangan dibongkar sendiri.",
    difficulty: 2,
    reason: "Perangkat elektronik kecil masuk kategori limbah elektronik yang punya jalur pengumpulan khusus.",
    wrongHint:
      "Barang elektronik bukan plastik daur ulang biasa. Di dalamnya ada baterai kecil dan papan sirkuit yang perlu ditangani khusus.",
    tags: ["earphone", "elektronik", "ewaste", "gadget"],
  },
  {
    id: "b3-charger",
    name: "Charger & Kabel Bekas",
    category: "b3",
    emoji: "🔌",
    description: "Adaptor charger, kabel data, dan powerbank yang rusak.",
    fact: "Powerbank dan adaptor berisi komponen litium; bila tertindih di truk sampah dapat memicu panas bahkan kebakaran.",
    handling: "Kumpulkan terpisah dan serahkan ke pengumpul e-waste; powerbank menggembung jangan ditusuk.",
    difficulty: 2,
    reason: "Kabel dan adaptor adalah limbah elektronik dengan jalur pengumpulan khusus.",
    wrongHint:
      "Kabel mengandung tembaga yang berharga, tetapi cara mengambilnya bukan lewat tempat sampah biasa melainkan jalur e-waste.",
    tags: ["charger", "kabel", "elektronik", "powerbank"],
  },
  {
    id: "b3-hp-rusak",
    name: "Ponsel / Laptop Rusak",
    category: "b3",
    emoji: "📱",
    description: "Gawai lama yang sudah tidak dipakai atau mati total.",
    fact: "Satu ton ponsel bekas mengandung emas dan logam mulia lebih banyak daripada satu ton bijih tambang.",
    handling:
      "Hapus data pribadi, lalu serahkan ke program tukar-tambah atau pengumpul e-waste resmi. Jangan dibongkar sendiri.",
    difficulty: 1,
    reason: "Gawai adalah limbah elektronik yang wajib masuk jalur khusus karena baterai dan logam beratnya.",
    wrongHint:
      "Ponsel bekas bukan sampah residu maupun daur ulang biasa; masih ada data pribadi dan baterai litium di dalamnya.",
    tags: ["hp", "laptop", "elektronik", "ewaste", "gadget"],
  },
  {
    id: "b3-pembersih",
    name: "Botol Pembersih / Pemutih",
    category: "b3",
    emoji: "🧪",
    description: "Wadah bekas cairan pembersih lantai, pemutih, atau pembasmi serangga.",
    fact: "Sisa bahan kimia dapat bereaksi dengan sampah lain dan membahayakan petugas pemilahan.",
    handling:
      "Habiskan sesuai petunjuk kemasan, jangan campur dengan bahan lain, lalu serahkan wadahnya ke titik pengumpulan limbah B3 rumah tangga.",
    difficulty: 3,
    reason: "Wadah bahan kimia rumah tangga termasuk B3 dan perlu jalur pengumpulan khusus.",
    wrongHint:
      "Meski botolnya plastik, sisa bahan kimia di dalamnya membuat wadah ini tidak aman masuk jalur daur ulang biasa.",
    tags: ["kimia", "pembersih", "pemutih", "b3"],
  },
  {
    id: "b3-aerosol",
    name: "Kaleng Aerosol (hairspray/pewangi)",
    category: "b3",
    emoji: "💨",
    description: "Kaleng bertekanan bekas semprotan hairspray, pewangi, atau cat semprot.",
    fact: "Kaleng aerosol masih menyimpan tekanan dan gas pendorong; bila tertusuk atau panas, ia bisa meledak di truk sampah.",
    handling:
      "Pastikan benar-benar kosong, jangan ditusuk atau dibakar, lalu serahkan ke titik pengumpulan B3/aerosol.",
    difficulty: 3,
    reason: "Kaleng bertekanan adalah limbah khusus yang berbeda dari kaleng minuman biasa.",
    wrongHint:
      "Kaleng minuman bisa didaur ulang, tetapi kaleng aerosol masih bertekanan dan berisi gas sehingga perlu jalur B3.",
    tags: ["aerosol", "semprot", "kaleng", "b3"],
  },
  {
    id: "b3-jelantah",
    name: "Minyak Jelantah",
    category: "b3",
    emoji: "🫗",
    description: "Minyak goreng bekas pakai yang sudah menghitam.",
    fact: "Satu liter minyak yang dibuang ke saluran air dapat mencemari air dalam jumlah besar; jelantah justru bisa diolah jadi biodiesel.",
    handling:
      "Dinginkan, tuang ke botol bertutup rapat, lalu serahkan ke bank sampah/pengepul jelantah. Jangan dituang ke wastafel atau selokan.",
    difficulty: 3,
    reason: "Minyak bekas termasuk limbah khusus yang butuh pengumpulan tersendiri, bukan sampah dapur biasa.",
    wrongHint:
      "Jelantah bukan sampah organik yang bisa dikomposkan langsung, dan bukan pula bahan daur ulang kering. Simpan di botol dan serahkan ke jalur khusus.",
    tags: ["minyak", "jelantah", "goreng", "b3", "dapur"],
  },
  {
    id: "b3-termometer",
    name: "Termometer Raksa Rusak",
    category: "b3",
    emoji: "🌡️",
    description: "Termometer kaca lama yang berisi raksa dan sudah pecah/tidak akurat.",
    fact: "Raksa bersifat toksik dan menguap pada suhu ruang, sehingga penanganannya tidak boleh sembarangan.",
    handling:
      "Jangan disentuh langsung; kumpulkan dengan kertas, masukkan wadah tertutup bertanda, lalu serahkan ke fasilitas limbah B3.",
    difficulty: 3,
    reason: "Raksa adalah bahan berbahaya yang memerlukan penanganan dan jalur pengumpulan khusus.",
    wrongHint:
      "Termometer raksa bukan kaca daur ulang dan bukan residu biasa: uap raksanya berisiko bagi kesehatan.",
    tags: ["termometer", "raksa", "kesehatan", "b3"],
  },
  {
    id: "b3-cat",
    name: "Kaleng Cat / Tiner Sisa",
    category: "b3",
    emoji: "🎨",
    description: "Sisa cat, tiner, atau lem kuat dari proyek kecil di rumah.",
    fact: "Pelarut cat mudah terbakar dan uapnya berbahaya bila terakumulasi di ruang tertutup.",
    handling:
      "Tutup rapat wadah, jauhkan dari panas, dan serahkan ke pengumpul limbah B3. Jangan dituang ke tanah atau selokan.",
    difficulty: 3,
    reason: "Sisa cat dan pelarut adalah bahan berbahaya dan beracun yang tidak boleh masuk sampah harian.",
    wrongHint:
      "Kaleng cat yang masih berisi sisa bahan kimia tidak bisa dianggap seperti kaleng minuman atau residu biasa.",
    tags: ["cat", "tiner", "pelarut", "b3"],
  },
];

/* Daftar ringkas untuk Ensiklopedia & pencarian */
export const ITEM_COUNT = WASTE_ITEMS.length;

/* Jumlah item per kategori — dipakai untuk statistik lokal (bukan angka palsu) */
export const COUNT_BY_CATEGORY: Record<CategoryId, number> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = WASTE_ITEMS.filter((item) => item.category === cat.id).length;
    return acc;
  },
  {} as Record<CategoryId, number>
);

export function getItemById(id: string): WasteItem | undefined {
  return WASTE_ITEMS.find((item) => item.id === id);
}
