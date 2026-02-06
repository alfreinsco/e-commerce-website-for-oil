# Panduan Aplikasi E-Commerce Minyak Kayu Putih Lamahang

## Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Cara Menggunakan](#cara-menggunakan)
3. [Struktur Aplikasi](#struktur-aplikasi)
4. [Akun Demo](#akun-demo)
5. [Fitur & Halaman](#fitur--halaman)

---

## Fitur Utama

Aplikasi web e-commerce modern untuk penjualan **Minyak Kayu Putih premium dari Desa Lamahang**, Kecamatan Waplau, Kabupaten Buru, Provinsi Maluku, Indonesia.

### Fitur Unggulan:
- ✅ **Sistem Autentikasi** - Login dan Register dengan validasi
- ✅ **Dashboard Personal** - Ringkasan pesanan dan produk favorit
- ✅ **Katalog Produk** - Browse, search, dan filter produk
- ✅ **Wishlist** - Simpan produk favorit
- ✅ **Manajemen Pesanan** - Lihat history pembelian
- ✅ **Profil Pengguna** - Edit data pribadi dan alamat pengiriman
- ✅ **Feedback & Rating** - Berikan review dan saran
- ✅ **Pengaturan Akun** - Notifikasi, keamanan, privasi
- ✅ **Responsive Design** - Mobile-friendly dengan PWA support
- ✅ **Navigasi Dual** - Sidebar untuk desktop, Bottom Navigation untuk mobile

---

## Cara Menggunakan

### 1. **Halaman Pertama (Landing Page)**
   - Menampilkan informasi tentang produk Minyak Kayu Putih Lamahang
   - Fitur: Testimonial pelanggan, Produk unggulan, Statistik
   - Button "Masuk" dan "Daftar" tersedia di navbar

### 2. **Registrasi Akun Baru**
   - Klik "Daftar" di halaman landing
   - Isi form: Nama Lengkap, Email, Password, Konfirmasi Password
   - Password minimal 6 karakter
   - Setelah registrasi berhasil, otomatis login dan ke Dashboard

### 3. **Login ke Akun**
   - Klik "Masuk" di halaman landing
   - Masukkan Email dan Password
   - Akan diarahkan ke Dashboard

### 4. **Navigasi di Aplikasi**

#### **Di Desktop:**
- Gunakan **Sidebar Navigation** di sebelah kiri
- Menu tersedia: Dashboard, Produk, Pesanan, Wishlist, Profil, Feedback, Pengaturan
- Tombol Keluar (Logout) di bawah sidebar

#### **Di Mobile:**
- Gunakan **Bottom Navigation** di bagian bawah layar
- Menu utama: Dashboard, Produk, Pesanan, Profil, Keluar
- Scroll ke atas untuk melihat konten dengan lebih baik

---

## Struktur Aplikasi

```
app/
├── (auth)/                    # Halaman publik (sebelum login)
│   ├── page.tsx              # Landing Page
│   ├── layout.tsx            # Layout auth
│   ├── login/page.tsx        # Halaman Login
│   └── register/page.tsx     # Halaman Register
├── (app)/                     # Halaman private (setelah login)
│   ├── layout.tsx            # App layout dengan sidebar & bottom nav
│   ├── dashboard/page.tsx    # Dashboard
│   ├── products/page.tsx     # Katalog Produk
│   ├── orders/page.tsx       # History Pesanan
│   ├── wishlist/page.tsx     # Wishlist
│   ├── profile/page.tsx      # Profil Pengguna
│   ├── feedback/page.tsx     # Form Feedback
│   └── settings/page.tsx     # Pengaturan Akun
├── context/
│   └── auth-context.tsx      # Context untuk autentikasi
├── page.tsx                   # Root page (redirect)
├── layout.tsx                # Root layout dengan AuthProvider
└── globals.css               # Styling global dengan color scheme
```

---

## Akun Demo

Anda bisa membuat akun baru dengan data apapun. Aplikasi ini menggunakan localStorage untuk simulasi database:

### Contoh Data Login:
- **Email**: demo@example.com
- **Password**: password123

Atau daftar dengan data Anda sendiri!

---

## Fitur & Halaman

### 1. **Landing Page** (/)
**Untuk pengunjung yang belum login**
- Hero section dengan penjelasan produk
- Fitur unggulan (4 poin)
- Statistik (50K+ pelanggan, 4.8★ rating, dll)
- Produk unggulan (preview 3 produk)
- Testimonial pelanggan (3 review)
- Footer dengan links

### 2. **Login** (/login)
- Form input Email dan Password
- Validasi error handling
- Link ke halaman Register
- Branding Lamahang

### 3. **Register** (/register)
- Form input: Nama, Email, Password, Konfirmasi Password
- Validasi: Email belum terdaftar, Password minimal 6 karakter
- Link ke halaman Login
- Auto-login setelah registrasi berhasil

### 4. **Dashboard** (/dashboard)
**Halaman pertama setelah login**
- Ucapan selamat datang personal
- 4 Kartu statistik: Total Pesanan, Produk Favorit, Total Pengeluaran, Member Sejak
- Produk terbaru (3 produk dengan rating & harga)
- Quick actions buttons (Jelajahi Produk, Lihat Pesanan, Kelola Profil)

### 5. **Produk** (/products)
- Katalog lengkap semua produk
- Search bar untuk mencari produk
- Filter kategori: Semua, Original, Premium, Organik, Bundle, Travel
- Grid produk responsive (1 kolom mobile, 2 tablet, 3 desktop)
- Setiap produk menampilkan: Gambar, Nama, Deskripsi, Harga, Rating, Buttons (Beli, Wishlist)
- 8 produk varian dengan harga berbeda

### 6. **Pesanan** (/orders)
- Statistik pesanan: Total, Terkirim, Total Pengeluaran
- Riwayat pesanan dengan status
- Setiap pesanan: ID, Tanggal, Produk, Quantity, Total, Status, Button Lihat Detail
- Status warna-coded: Delivered (hijau), Processing (biru)
- 5 contoh pesanan dengan berbagai status

### 7. **Wishlist** (/wishlist)
- Tampilkan produk favorit yang disimpan
- Summary: Total items & nilai total
- Button "Beli Semua"
- Setiap item: Gambar, Nama, Kategori, Rating, Harga, Buttons (Beli, Hapus)
- Animated heart icon untuk menghapus
- Empty state jika wishlist kosong

### 8. **Profil** (/profile)
- Avatar dengan inisial nama
- Informasi dasar: Nama, Email, Join Date
- Form edit profil (Nama, Email, Nomor Telepon, Alamat)
- Edit mode dengan tombol Simpan & Batal
- Daftar alamat pengiriman
- Address management

### 9. **Feedback** (/feedback)
- Form feedback dengan rating bintang (1-5)
- Input: Subjek dan Pesan
- Success notification setelah submit
- Contoh feedback dari pelanggan lain
- Tip untuk menulis feedback yang baik

### 10. **Pengaturan** (/settings)
- **Notifikasi**:
  - Email Notification toggle
  - SMS Notification toggle
  - Push Notification toggle
  - Tipe notifikasi: Update Pesanan, Promosi, Newsletter
  
- **Keamanan**:
  - 2FA (Two Factor Authentication) toggle
  - Activity Log toggle
  - Button: Lihat Aktivitas Login, Ubah Password
  
- **Privasi**:
  - Unduh Data, Kebijakan Privasi, Syarat & Ketentuan
  
- **Danger Zone**:
  - Hapus Akun (tombol warning)

---

## Desain & Styling

### Color Scheme
- **Primary**: Hijau Alami (Emerald - #10b981) - Mencerminkan minyak kayu putih alami
- **Secondary**: Hijau Muda - Soft background
- **Accent**: Kuning Cerah - Call-to-action & highlights
- **Neutral**: Abu-abu natural untuk text & borders

### Responsive Breakpoints
- **Mobile**: < 768px - Bottom Navigation, Single column
- **Tablet**: 768px - 1024px - Two columns, Optimized nav
- **Desktop**: > 1024px - Sidebar Navigation, Multi-column layout

### Component Library
- Menggunakan **shadcn/ui** components (Button, Card, Input, Label, dll)
- **Tailwind CSS** untuk styling utility
- **Lucide React** untuk icons

---

## Fitur Teknis

### Authentication
- Menggunakan Context API untuk state management
- LocalStorage untuk simulasi database (dalam production gunakan backend real)
- Session-based login dengan user data stored di localStorage
- Redirect otomatis ke login jika tidak authenticated

### Data Management
- Dummy data untuk produk, pesanan, wishlist
- Search & filter functionality di halaman produk
- Responsive form handling dengan validation

### Mobile Optimization
- PWA-ready dengan responsive design
- Mobile-first approach
- Touch-friendly buttons & navigation
- Optimized scrolling & interaction

---

## Tips Penggunaan

1. **Logout**: Gunakan button "Keluar" di sidebar (desktop) atau bottom nav (mobile)
2. **Produk**: Klik produk untuk melihat detail lengkap
3. **Wishlist**: Heart icon di setiap produk untuk menambah/menghapus dari wishlist
4. **Feedback**: Bagikan pengalaman Anda untuk membantu kami improve
5. **Settings**: Customize notifikasi sesuai preferensi Anda

---

## Browser Support
- Chrome/Edge (Desktop & Mobile)
- Safari (iOS & MacOS)
- Firefox
- Opera

---

## Contact & Support

**Dari Desa Lamahang, Kecamatan Waplau, Kabupaten Buru, Provinsi Maluku, Indonesia**

Untuk informasi lebih lanjut tentang produk Minyak Kayu Putih Lamahang, silakan hubungi kami melalui:
- Email: info@lamahang.com
- WhatsApp: +62-xxx-xxxx-xxxx
- Instagram: @lamahang.official

---

**Selamat berbelanja! Terima kasih telah memilih produk alami Lamahang.**
