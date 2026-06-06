/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === Palet utama dari desain ===
        c: {
          black:   '#080704', // background paling gelap
          dark:    '#347E3A', // hijau tua — sidebar/card
          mid:     '#56B988', // hijau sedang — aksen aktif
          tan:     '#D3BE94', // krem/tan — aksen warm
          light:   '#F3EEE3', // putih krem — teks terang
          white:   '#FFFFFF', // putih murni
        },
        // alias semantik agar komponen mudah dibaca
        bg: {
          dark:    '#080704',
          card:    '#0f1f0f',
          sidebar: '#080704',
        },
        accent: {
          green:   '#56B988',
          dark:    '#347E3A',
          gold:    '#D3BE94',
          tan:     '#D3BE94',
        },
        text: {
          primary:   '#F3EEE3',
          secondary: '#D3BE94',
          muted:     '#56B988',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
