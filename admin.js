// ===============================
// admin.js — Raja Kudapan 🍜
// Versi lengkap, fix + komentar per bagian
// ===============================

// ===============================
// 1️⃣ IMPORT FIREBASE SDK MODULAR (v10+)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, setDoc, doc, deleteDoc, updateDoc,
  onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ===============================
// 2️⃣ KONFIGURASI FIREBASE (PASTIKAN storageBucket .appspot.com ✅)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyC7VFvAsqRjiYinzfUfwabqHVvMWsvVhFo",
  authDomain: "raja-kudapan.firebaseapp.com",
  projectId: "raja-kudapan",
  storageBucket: "raja-kudapan.appspot.com",
  messagingSenderId: "61175543723",
  appId: "1:61175543723:web:57d4a4f64480cb7f4344ee",
  measurementId: "G-ZGFTZER9RJ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// 3️⃣ HELPER: TOASTIFY UNTUK NOTIFIKASI CEPAT
// ===============================
function toast(msg, bg = "#ff7b00") {
  Toastify({
    text: msg,
    duration: 2200,
    gravity: "top",
    position: "center",
    style: { background: bg, color: "#fff", borderRadius: "8px" }
  }).showToast();
}

// ===============================
// 4️⃣ HELPER: ESCAPE HTML (FIX PENTING 🚨)
// Tanpa fungsi ini, script akan error di onSnapshot()
// ===============================
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ===============================
// 5️⃣ TAB NAVIGASI BAWAH
// ===============================
const navBtns = document.querySelectorAll(".nav-btn");
const tabs = document.querySelectorAll(".tab");
navBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tgt = btn.dataset.target;
    tabs.forEach(t => t.classList.remove("active"));
    document.getElementById(tgt).classList.add("active");
  });
});

// ===============================
// 6️⃣ TAB MENU — CRUD MENU FIRESTORE
// ===============================
const menuTableBody = document.getElementById("menuTableBody");
const fabAddMenu = document.getElementById("fabAddMenu");
const modalWrap = document.getElementById("modalWrap");
const modalTitle = document.getElementById("modalTitle");
const modalSave = document.getElementById("modalSave");
const modalCancel = document.getElementById("modalCancel");
const inputName = document.getElementById("menu_name");
const inputCategory = document.getElementById("menu_category");
const inputPrice = document.getElementById("menu_price");
const inputStock = document.getElementById("menu_stock");
const inputImage = document.getElementById("menu_image");

let editingId = null; // menyimpan ID menu yang sedang di-edit
const menusCol = collection(db, "menus");

// ==== Realtime listener menampilkan daftar menu ====
onSnapshot(menusCol, (snap) => {
  menuTableBody.innerHTML = "";
  snap.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    const imgCell = `<td><img src="${data.image || 'https://via.placeholder.com/80'}" class="thumb"></td>`;
    const nameCell = `<td>${escapeHtml(data.name || "")}</td>`;
    const catCell = `<td>${escapeHtml(data.category || "")}</td>`;
    const priceCell = `<td>Rp ${Number(data.price || 0).toLocaleString()}</td>`;
    const stockCell = `<td>${Number(data.stock || 0)}</td>`;
    const actionsCell = `
      <td>
        <button class="btn-ghost edit" data-id="${docSnap.id}" title="Edit">✏️</button>
        <button class="btn-ghost delete" data-id="${docSnap.id}" title="Hapus">🗑️</button>
      </td>
    `;
    tr.innerHTML = imgCell + nameCell + catCell + priceCell + stockCell + actionsCell;
    menuTableBody.appendChild(tr);
  });
});

// ==== Fungsi buka/tutup modal ====
function openModal() { modalWrap.style.display = "flex"; }
function closeModal() { modalWrap.style.display = "none"; }
function clearModal() {
  inputName.value = "";
  inputCategory.value = "Makanan";
  inputPrice.value = "";
  inputStock.value = "";
  inputImage.value = "";
}

// ==== Tombol tambah menu ====
fabAddMenu.addEventListener("click", () => {
  editingId = null;
  modalTitle.textContent = "Tambah Menu";
  clearModal();
  openModal();
});

// ==== Tombol batal modal ====
modalCancel.addEventListener("click", closeModal);

// ==== Tombol simpan menu (Tambah / Update) ====
modalSave.addEventListener("click", async () => {
  const name = inputName.value.trim();
  const category = inputCategory.value;
  const price = parseInt(inputPrice.value);
  const stock = parseInt(inputStock.value);
  const image = inputImage.value.trim();

  if (!name || !category || isNaN(price) || isNaN(stock) || !image) {
    return toast("Lengkapi semua field!", "crimson");
  }

  const payload = { name, category, price, stock, image };

  try {
    if (editingId) {
      await updateDoc(doc(db, "menus", editingId), payload);
      toast("Menu diupdate!");
    } else {
      await addDoc(menusCol, payload);
      toast("Menu ditambahkan!");
    }
    closeModal();
  } catch (err) {
    console.error(err);
    toast("Gagal menyimpan: " + err.message, "crimson");
  }
});

// ==== Aksi Edit / Hapus Menu ====
menuTableBody.addEventListener("click", async (e) => {
  const target = e.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("edit")) {
    // EDIT MENU
    try {
      const snap = await getDoc(doc(db, "menus", id));
      if (!snap.exists()) return toast("Data tidak ditemukan", "crimson");
      const d = snap.data();
      editingId = id;
      modalTitle.textContent = "Edit Menu";
      inputName.value = d.name || "";
      inputCategory.value = d.category || "Makanan";
      inputPrice.value = d.price || "";
      inputStock.value = d.stock || "";
      inputImage.value = d.image || "";
      openModal();
    } catch (err) {
      toast("Gagal ambil data", "crimson");
    }
  } else if (target.classList.contains("delete")) {
    // HAPUS MENU
    if (!confirm("Hapus menu ini?")) return;
    try {
      await deleteDoc(doc(db, "menus", id));
      toast("Menu dihapus");
    } catch (err) {
      toast("Gagal hapus", "crimson");
    }
  }
});

// ===============================
// 7️⃣ TAB MERCHANT — PENGATURAN TOKO
// ===============================
const merchantRef = doc(db, "settings", "merchant");
const elMerchantPhone = document.getElementById("merchantPhone");
const elBankName = document.getElementById("bankName");
const elBankAccount = document.getElementById("bankAccount");
const elBankOwner = document.getElementById("bankOwner");
const elEwalletName = document.getElementById("ewalletName");
const elEwalletNumber = document.getElementById("ewalletNumber");
const elQrisUrl = document.getElementById("qrisUrl");
const elMerchantAddress = document.getElementById("merchantAddress");
const elMerchantLat = document.getElementById("merchantLat");
const elMerchantLng = document.getElementById("merchantLng");
const elMaxDistance = document.getElementById("maxDistance");
const btnSaveMerchant = document.getElementById("saveMerchant");
const btnCopyWa = document.getElementById("copyWa");
const btnGetLocation = document.getElementById("btnGetLocation");

// ==== Realtime listener untuk merchant ====
onSnapshot(merchantRef, (snap) => {
  if (!snap.exists()) return;
  const d = snap.data();
  elMerchantPhone.value = d.noWhatsApp || "";
  elBankName.value = d.bankName || "";
  elBankAccount.value = d.bankAccount || "";
  elBankOwner.value = d.bankOwner || "";
  elEwalletName.value = d.ewalletName || "";
  elEwalletNumber.value = d.ewalletNumber || "";
  elQrisUrl.value = d.qrisUrl || "";
  elMerchantAddress.value = d.alamatToko || "";
  elMerchantLat.value = d.lat || "";
  elMerchantLng.value = d.lng || "";
  elMaxDistance.value = d.maxDistance || 3;
  elMaxDistance.nextElementSibling.textContent = `${elMaxDistance.value} km`;
});

// ==== Tombol Simpan Merchant ====
btnSaveMerchant.addEventListener("click", async () => {
  const payload = {
    noWhatsApp: elMerchantPhone.value.trim(),
    bankName: elBankName.value.trim(),
    bankAccount: elBankAccount.value.trim(),
    bankOwner: elBankOwner.value.trim(),
    ewalletName: elEwalletName.value.trim(),
    ewalletNumber: elEwalletNumber.value.trim(),
    qrisUrl: elQrisUrl.value.trim(),
    alamatToko: elMerchantAddress.value.trim(),
    lat: parseFloat(elMerchantLat.value) || null,
    lng: parseFloat(elMerchantLng.value) || null,
    maxDistance: parseFloat(elMaxDistance.value),
  };

  try {
    await setDoc(merchantRef, payload, { merge: true });
    toast("Data merchant disimpan!");
  } catch (err) {
    console.error(err);
    toast("Gagal menyimpan merchant", "crimson");
  }
});

// ==== Tombol salin nomor WA ====
btnCopyWa.addEventListener("click", () => {
  if (!elMerchantPhone.value) return toast("Nomor WA kosong!", "crimson");
  navigator.clipboard
    .writeText(elMerchantPhone.value)
    .then(() => toast("Nomor WA disalin!", "#4caf50"))
    .catch(() => toast("Gagal menyalin", "crimson"));
});

// ==== Tombol ambil lokasi toko ====
btnGetLocation.addEventListener("click", () => {
  if (!navigator.geolocation)
    return toast("Browser tidak mendukung geolokasi", "crimson");

  btnGetLocation.textContent = "⏳ Mendapatkan lokasi...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      elMerchantLat.value = latitude.toFixed(6);
      elMerchantLng.value = longitude.toFixed(6);
      toast("Lokasi toko berhasil diambil!", "#4caf50");
      btnGetLocation.textContent = "📍 Ambil Lokasi Saya";
    },
    (err) => {
      toast("Gagal mendapatkan lokasi!", "crimson");
      console.error(err);
      btnGetLocation.textContent = "📍 Ambil Lokasi Saya";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// ===============================
// 8️⃣ TAB DEKORASI TOKO
// ===============================
const dekorasiRef = doc(db, "settings", "dekorasi");
const elDecorName = document.getElementById("decorName");
const elDecorAccent = document.getElementById("decorAccent");
const elDecorBg = document.getElementById("decorBg");
const elDecorFont = document.getElementById("decorFont");
const btnSaveDecor = document.getElementById("saveDecor");

const previewStoreName = document.getElementById("previewStoreName");
const previewHeader = document.getElementById("previewHeader");
const previewBox = document.getElementById("previewBox");

// ==== Realtime listener dekorasi ====
onSnapshot(dekorasiRef, (snap) => {
  if (!snap.exists()) return;
  const d = snap.data();
  elDecorName.value = d.namaToko || "";
  elDecorAccent.value = d.warnaUtama || "#ff7b00";
  elDecorBg.value = d.warnaBackground || "#fff8f0";
  elDecorFont.value = d.font || "Poppins";
  applyPreview();
});

// ==== Tombol Simpan Dekorasi ====
btnSaveDecor.addEventListener("click", async () => {
  const payload = {
    namaToko: elDecorName.value.trim() || "Raja Kudapan 🍜",
    warnaUtama: elDecorAccent.value || "#ff7b00",
    warnaBackground: elDecorBg.value || "#fff8f0",
    font: elDecorFont.value || "Poppins"
  };

  try {
    await setDoc(dekorasiRef, payload, { merge: true });
    toast("Dekorasi disimpan!");
    applyPreview();
  } catch (err) {
    console.error(err);
    toast("Gagal menyimpan dekorasi", "crimson");
  }
});

// ==== Preview langsung saat mengubah input ====
[elDecorName, elDecorAccent, elDecorBg, elDecorFont].forEach(el => {
  el.addEventListener("input", applyPreview);
});

// ==== Fungsi Apply Preview ====
function applyPreview() {
  const accent = elDecorAccent.value || "#ff7b00";
  const bg = elDecorBg.value || "#fff8f0";
  const font = elDecorFont.value || "Poppins";
  previewStoreName.textContent = elDecorName.value || "Nama Toko";
  previewHeader.style.background = accent;
  previewBox.style.background = bg;
  document.body.style.fontFamily = `${font}, Poppins, system-ui`;
}