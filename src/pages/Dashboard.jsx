import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ConditionIcon from "../components/ConditionIcon";
import { fetchAllWeatherData } from "../service/weatherService";

// ── Palette ──────────────────────────────────────
const P = {
  black: "#080704",
  dark: "#347E3A",
  mid: "#56B988",
  tan: "#D3BE94",
  light: "#F3EEE3",
  white: "#FFFFFF",
  card: "#0f1f0f",
  card2: "#111f11",
};

export default function Dashboard() {
  // ── State ──────────────────────────────────────
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast5Day, setForecast5Day] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kota bisa dari URL param / settings / geolocation — sekarang hardcode dulu
  const CITY = "Medan,ID";
  const LAT = 3.5952;
  const LON = 98.6722;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllWeatherData(CITY, LAT, LON);
        if (!cancelled) {
          setCurrentWeather(data.currentWeather);
          setForecast5Day(data.forecast5Day);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Render: Loading ────────────────────────────
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: P.black }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{
              borderColor: `${P.dark} transparent ${P.dark} transparent`,
            }}
          />
          <p className="font-body text-sm" style={{ color: P.tan }}>
            Loading weather data…
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Error ──────────────────────────────
  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: P.black }}
      >
        <div
          className="rounded-2xl p-8 max-w-sm text-center"
          style={{ background: P.card, border: `1px solid ${P.dark}33` }}
        >
          <p
            className="font-body font-bold text-lg mb-2"
            style={{ color: P.light }}
          >
            Gagal mengambil data cuaca
          </p>
          <p className="font-body text-sm" style={{ color: P.tan }}>
            {error}
          </p>
          <p className="font-body text-xs mt-3" style={{ color: P.tan }}>
            Pastikan VITE_OPENWEATHER_API_KEY sudah diset di file .env
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl font-body text-sm"
            style={{ background: P.dark, color: P.white }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Dashboard ──────────────────────────
  return (
    <div className="flex min-h-screen" style={{ background: P.black }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Current Weather | AQI | Map */}
          <div className="grid grid-cols-[1fr_220px_280px] gap-4">
            {/* Current Weather */}
            <div
              className="rounded-2xl p-6 flex flex-col justify-between min-h-[200px]"
              style={{ background: P.card, border: `1px solid ${P.dark}33` }}
            >
              <p className="font-body text-sm" style={{ color: P.tan }}>
                Current Weather · {currentWeather.location}
              </p>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p
                    className="font-display text-6xl leading-none"
                    style={{ color: P.light }}
                  >
                    {currentWeather.temp}° C
                  </p>
                  <p
                    className="font-body font-semibold text-lg mt-3"
                    style={{ color: P.light }}
                  >
                    {currentWeather.condition}
                  </p>
                  <p
                    className="font-body text-sm mt-0.5"
                    style={{ color: P.tan }}
                  >
                    Feels Like {currentWeather.feelsLike}° C
                  </p>
                </div>
                <div className="mb-2">
                  <ConditionIcon
                    type={currentWeather.icon ?? "partly-cloudy"}
                    size={110}
                  />
                </div>
              </div>
            </div>

            {/* AQI */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: P.card, border: `1px solid ${P.dark}33` }}
            >
              <p className="font-body text-sm" style={{ color: P.tan }}>
                Air Quality Index
              </p>
              <div className="flex-1 flex items-center justify-center mt-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#347E3A33"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={P.mid}
                      strokeWidth="10"
                      strokeDasharray={`${((currentWeather.aqi ?? 0) / 150) * 314} 314`}
                      strokeDashoffset="78"
                      strokeLinecap="round"
                      transform="rotate(-220 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="font-display text-3xl leading-none"
                      style={{ color: P.light }}
                    >
                      {currentWeather.aqi ?? "—"}
                    </span>
                    <span
                      className="font-body text-sm font-medium mt-0.5"
                      style={{ color: P.mid }}
                    >
                      {currentWeather.aqiLabel ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div
              className="rounded-2xl p-4 flex flex-col"
              style={{ background: P.card, border: `1px solid ${P.dark}33` }}
            >
              <p className="font-body text-sm mb-2" style={{ color: P.tan }}>
                Map
              </p>
              <div
                className="flex-1 rounded-xl relative overflow-hidden min-h-[140px]"
                style={{ background: "#0a1a0a" }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg,${P.dark} 0,${P.dark} 1px,transparent 1px,transparent 24px),repeating-linear-gradient(90deg,${P.dark} 0,${P.dark} 1px,transparent 1px,transparent 24px)`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: `${P.mid}33`,
                      border: `2px solid ${P.mid}`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: P.mid }}
                    />
                  </div>
                  <span
                    className="font-body text-xs mt-1"
                    style={{ color: P.light }}
                  >
                    {currentWeather.location}
                  </span>
                </div>
              </div>
              <Link
                to="/location"
                className="font-body text-xs mt-2 text-right block transition-colors hover:underline"
                style={{ color: P.tan }}
              >
                View full map →
              </Link>
            </div>
          </div>

          {/* Row 2: 5-Day Forecast */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-body font-semibold"
                style={{ color: P.light }}
              >
                5-Day Forecast
              </h3>
              <Link
                to="/forecast"
                className="font-body text-sm hover:underline"
                style={{ color: P.tan }}
              >
                View All ›
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {forecast5Day.map((day, i) => (
                <div
                  key={day.day}
                  className="rounded-2xl p-5 flex flex-col items-center gap-3"
                  style={{
                    background: i === 0 ? "#1a3a1a" : P.card,
                    border: `1px solid ${i === 0 ? P.dark + "66" : P.dark + "22"}`,
                  }}
                >
                  <p
                    className="font-body font-bold text-sm"
                    style={{ color: P.light }}
                  >
                    {day.day}
                  </p>
                  <ConditionIcon type={day.icon} size={44} />
                  <div className="text-center">
                    <p
                      className="font-body font-bold text-base"
                      style={{ color: P.light }}
                    >
                      {day.high}° C
                    </p>
                    <p
                      className="font-body text-xs mt-0.5"
                      style={{ color: P.tan }}
                    >
                      {day.low}° C
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Highlights | Sun & Moon */}
          <div className="grid grid-cols-[1fr_340px] gap-4">
            {/* Today's Highlights */}
            <div
              className="rounded-2xl p-6"
              style={{ background: P.card, border: `1px solid ${P.dark}33` }}
            >
              <p
                className="font-body font-semibold mb-5"
                style={{ color: P.light }}
              >
                Today's Highlights
              </p>
              <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                {[
                  {
                    icon: <ThermIcon c={P.tan} />,
                    label: "Feels like",
                    value: `${currentWeather.feelsLike}° C`,
                  },
                  {
                    icon: <WindIcon c={P.tan} />,
                    label: "Wind status",
                    value: currentWeather.wind,
                  },
                  {
                    icon: <RainIcon c={P.tan} />,
                    label: "Rain chance",
                    value: currentWeather.rain ?? "—",
                  },
                  {
                    icon: <EyeIcon c={P.tan} />,
                    label: "Visibility",
                    value: currentWeather.visibility,
                  },
                  {
                    icon: <UVIcon c={P.tan} />,
                    label: "UV index",
                    value: currentWeather.uvIndex ?? "—",
                  },
                  {
                    icon: <PresIcon c={P.tan} />,
                    label: "Pressure",
                    value: currentWeather.pressure,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center opacity-80">
                      {icon}
                    </div>
                    <div>
                      <p className="font-body text-xs" style={{ color: P.tan }}>
                        {label}
                      </p>
                      <p
                        className="font-body font-bold text-base"
                        style={{ color: P.light }}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sun & Moon */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: P.card, border: `1px solid ${P.dark}33` }}
            >
              <p
                className="font-body font-semibold mb-4"
                style={{ color: P.light }}
              >
                Sun & Moon
              </p>
              <div className="relative flex-1 flex items-end justify-between px-2 min-h-[120px]">
                <svg
                  viewBox="0 0 280 120"
                  className="absolute inset-0 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M20 110 Q140 10 260 110"
                    stroke={P.tan}
                    strokeWidth="1.5"
                    fill="none"
                    strokeDasharray="5 3"
                    opacity="0.5"
                  />
                  <circle cx="140" cy="30" r="5" fill={P.tan} opacity="0.8" />
                </svg>
                <div className="text-center z-10 relative">
                  <SunriseIcon c={P.mid} />
                  <p
                    className="font-body text-xs mt-1"
                    style={{ color: P.tan }}
                  >
                    Sunrise
                  </p>
                  <p
                    className="font-body font-semibold text-xs"
                    style={{ color: P.light }}
                  >
                    {currentWeather.sunrise}
                  </p>
                </div>
                <div className="text-center z-10 relative">
                  <SunsetIcon c={P.tan} />
                  <p
                    className="font-body text-xs mt-1"
                    style={{ color: P.tan }}
                  >
                    Sunset
                  </p>
                  <p
                    className="font-body font-semibold text-xs"
                    style={{ color: P.light }}
                  >
                    {currentWeather.sunset}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Icon helpers (tidak berubah) ──────────────────────────────
function ThermIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}
function WindIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}
function RainIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <line x1="8" y1="19" x2="8" y2="21" />
      <line x1="8" y1="13" x2="8" y2="15" />
      <line x1="16" y1="19" x2="16" y2="21" />
      <line x1="16" y1="13" x2="16" y2="15" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="12" y1="15" x2="12" y2="17" />
    </svg>
  );
}
function EyeIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function UVIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function PresIcon({ c }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function SunriseIcon({ c }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="8 6 12 2 16 6" />
    </svg>
  );
}
function SunsetIcon({ c }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M17 18a5 5 0 0 0-10 0" />
      <line x1="12" y1="9" x2="12" y2="2" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
      <line x1="1" y1="18" x2="3" y2="18" />
      <line x1="21" y1="18" x2="23" y2="18" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" />
      <line x1="23" y1="22" x2="1" y2="22" />
      <polyline points="16 5 12 9 8 5" />
    </svg>
  );
}
