# RajaOrder Setup Guide

Terima kasih telah membeli **RajaOrder** — sistem webapp pemesanan online berbasis WhatsApp dan Firebase.

Panduan ini akan membantu Anda (atau reseller) untuk melakukan setup dengan cepat.

---

## 📦 Struktur Folder 
📁 RajaOrder/ ├── rajaorder-user/     → Tampilan untuk pelanggan (frontend) │    ├── index.html │    ├── script.js │  ├── style.css  ├── config.js      ← konfigurasi Firebase untuk user │ 
└── rajaorder-admin/    → Panel admin untuk kelola menu & pengaturan ├── admin.html ├── admin.js ├── admin.css  |  ├── config.js      ← konfigurasi Firebase untuk admin

---

## ⚙️ 1. Ubah Firebase Config (Jika untuk Toko Lain)

1. Masuk ke [https://console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru untuk toko Anda.
3. Tambahkan aplikasi **Web** (`</>`) dan salin konfigurasi Firebase.
4. Buka kedua file:
   - `rajaorder-user/config.js`
   - `rajaorder-admin/config.js`
5. Ganti nilai di dalam `firebaseConfig` dengan milik toko baru.

---

## 🔐 2. Atur Firestore Rules (sementara / demo)

Untuk testing tanpa login, gunakan rule berikut:
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

⚠️ Catatan:
Saat sudah siap dijual ke publik, ubah rule agar hanya admin yang bisa menulis.


🚀 3. Deploy ke Hosting
Anda bisa menggunakan layanan hosting gratis seperti:
Netlify
Firebase Hosting
Vercel
🔹 Untuk User (Frontend)
Upload folder rajaorder-user
→ hasil deploy bisa misalnya: https://tokorajaorder.netlify.app
🔹 Untuk Admin Panel
Upload folder rajaorder-admin
→ hasil deploy bisa misalnya: https://admin.tokorajaorder.netlify.app

