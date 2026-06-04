# 🌤️ Weather Forecast App

React + Vite + Tailwind CSS — berdasarkan desain UI yang sudah dibuat.

---

## 📁 Struktur Folder

```
weather-forecast/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── WeatherIcon.jsx       ← ikon awan + matahari
    │   ├── ConditionIcon.jsx     ← ikon cuaca per kondisi
    │   ├── Sidebar.jsx           ← navigasi kiri
    │   └── Topbar.jsx            ← header atas
    ├── pages/
    │   ├── LandingPage.jsx       ← halaman awal (WEATHER FORECAST)
    │   ├── LoginPage.jsx         ← halaman login
    │   ├── SignUpPage.jsx        ← halaman daftar
    │   ├── Dashboard.jsx         ← dashboard utama
    │   └── ForecastPage.jsx      ← halaman forecast
    └── data/
        └── weatherData.js        ← data cuaca (mock/dummy)
```

---

## 🚀 Cara Menjalankan

### Langkah 1 — Install Node.js
Pastikan Node.js sudah terpasang (versi 18+).  
Download: https://nodejs.org

### Langkah 2 — Copy semua file
Salin semua file dari folder ini ke komputer kamu.

### Langkah 3 — Install dependensi
Buka terminal, masuk ke folder proyek, lalu jalankan:

```bash
npm install
```

### Langkah 4 — Jalankan dev server
```bash
npm run dev
```

Buka browser di: **http://localhost:5173**

### Langkah 5 — Build untuk produksi (opsional)
```bash
npm run build
```

---

## 🌐 Menambahkan API Cuaca Nyata (Opsional)

Proyek ini menggunakan data dummy. Untuk data cuaca asli:

1. Daftar di https://openweathermap.org/api (gratis)
2. Buat file `.env` di root folder:
   ```
   VITE_WEATHER_API_KEY=api_key_kamu_disini
   ```
3. Edit `src/data/weatherData.js` untuk fetch dari API:
   ```js
   const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
   const res = await fetch(
     `https://api.openweathermap.org/data/2.5/weather?q=Medan&appid=${API_KEY}&units=metric`
   )
   ```

---

## 🎨 Mengubah Warna / Tema

Edit `tailwind.config.js` bagian `colors`:

```js
colors: {
  bg: {
    dark: '#0d1f0e',   // ← background utama
    card: '#1a2e1b',   // ← warna kartu
  },
  accent: {
    green: '#4caf6e',  // ← warna hijau aksen
    gold: '#f0c040',   // ← warna kuning emas
  }
}
```

---

## 📦 Dependensi yang Digunakan

| Package | Fungsi |
|---|---|
| react + react-dom | Framework UI |
| react-router-dom | Navigasi antar halaman |
| lucide-react | Ikon |
| tailwindcss | Utility CSS |
| vite | Build tool |
