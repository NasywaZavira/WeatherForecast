# 🌤️ Sistem Informasi Ramalan Cuaca

A full-stack weather forecast information system that provides real-time weather data for cities across Indonesia. Built with a modern web stack and integrated with the BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) API as the primary data source.

🔗 **Live Demo:** [https://weather-forecast-psi-one.vercel.app/](https://weather-forecast-psi-one.vercel.app/)

---

## 📸 Preview

> Access the live website at the link above to explore the full interface.

---

## ✨ Features

-  **Weather by Location** — Search weather information by city name or use your current location via interactive map (Leaflet.js)
-  **Weather Forecast** — View multi-day weather forecasts including temperature, humidity, wind speed, and weather conditions
-  **Dashboard** — Overview of weather statistics and key metrics at a glance
-  **Settings** — Customize preferences such as temperature units and display options
-  **Authentication** — Secure user registration and login with JWT-based authentication
-  **Admin Panel** — Admin module for managing application data
-  **Caching** — Backend caching layer for optimized BMKG API request performance

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| React + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first CSS styling |
| Leaflet.js | Interactive map for location selection |
| JavaScript (ES6+) | Core language |

### Backend
| Technology | Description |
|------------|-------------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| PostgreSQL | Relational database |
| JWT | Authentication & authorization |
| BMKG API | Indonesian weather data source |

### Deployment
| Service | Usage |
|---------|-------|
| Vercel | Frontend & backend hosting |

---

## 📁 Project Structure

```
WeatherForecast/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components (Dashboard, Forecast, Location, Settings)
│   │   └── ...
│   └── package.json
├── backend/           # Node.js + Express API server
│   ├── src/
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # Auth & caching middleware
│   │   └── ...
│   └── package.json
└── vercel.json        # Vercel deployment configuration
```
---

## 🌐 API Overview

The backend exposes a RESTful API with the following main modules:

| Module | Description |
|--------|-------------|
| `/api/auth` | User registration, login, and JWT token management |
| `/api/weather` | Weather data endpoints, integrated with BMKG API |
| `/api/admin` | Admin management endpoints |

