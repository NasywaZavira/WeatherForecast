import { useState, useMemo } from "react";
import Topbar from "../components/Topbar";
import ConditionIcon from "../components/ConditionIcon";
import { currentWeather, hourlyForecast } from "../data/weatherData";

const P = {
  black: "#080704",
  dark: "#347E3A",
  mid: "#56B988",
  tan: "#D3BE94",
  light: "#F3EEE3",
  card: "#0f1f0f",
};

// --- Generate 5-day forecast from today ---
function buildForecast() {
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const icons = ["partly-cloudy", "rainy", "thunderstorm", "sunny", "cloudy"];
  const highs = [30, 28, 25, 32, 29];
  const lows = [26, 24, 22, 27, 25];
  const conditions = [
    "Partly Cloudy",
    "Rainy",
    "Thunderstorm",
    "Sunny",
    "Cloudy",
  ];
  const winds = ["12 km/h", "18 km/h", "22 km/h", "8 km/h", "14 km/h"];
  const rains = ["20%", "75%", "90%", "5%", "30%"];
  const uvs = [
    "5 (Moderate)",
    "3 (Moderate)",
    "2 (Low)",
    "8 (High)",
    "4 (Moderate)",
  ];
  const pressures = ["1008 hPa", "1002 hPa", "998 hPa", "1015 hPa", "1010 hPa"];
  const sunrises = ["06.00 AM", "06.01 AM", "06.01 AM", "06.02 AM", "06.02 AM"];
  const sunsets = ["07.00 PM", "06.58 PM", "06.57 PM", "07.01 PM", "07.00 PM"];

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: i === 0 ? "Today" : dayNames[d.getDay()],
      fullDate: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      icon: icons[i],
      high: highs[i],
      low: lows[i],
      condition: conditions[i],
      wind: winds[i],
      rain: rains[i],
      uvIndex: uvs[i],
      pressure: pressures[i],
      feelsLike: highs[i] + 2,
      visibility: "10 km",
      sunrise: sunrises[i],
      sunset: sunsets[i],
    };
  });
}

// Sun arc: position dot based on current time between sunrise & sunset
function SunArc({ sunrise, sunset, isToday }) {
  // Parse time strings like "06.00 AM"
  function parseTime(str) {
    const [hm, period] = str.split(" ");
    let [h, m] = hm.split(".").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const riseMins = parseTime(sunrise);
  const setMins = parseTime(sunset);
  const progress = isToday
    ? Math.max(0, Math.min(1, (nowMins - riseMins) / (setMins - riseMins)))
    : 0.5; // show midday for other days

  // Arc path: M 10,55 Q 100,5 190,55
  const t = progress;
  const cx = 100,
    cy = 5,
    sx = 10,
    ex = 190,
    sy = 55,
    ey = 55;
  const dotX = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex;
  const dotY = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey;

  return (
    <svg viewBox="0 0 200 65" className="w-full">
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={P.mid} stopOpacity="0.3" />
          <stop
            offset={`${progress * 100}%`}
            stopColor={P.mid}
            stopOpacity="0.9"
          />
          <stop
            offset={`${progress * 100}%`}
            stopColor={P.tan}
            stopOpacity="0.4"
          />
          <stop offset="100%" stopColor={P.tan} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M10 55 Q100 5 190 55"
        stroke="url(#arcGrad)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="5 3"
      />
      <circle cx={dotX} cy={dotY} r="6" fill={P.tan} opacity="0.9" />
      <circle cx={dotX} cy={dotY} r="3" fill={P.light} />
    </svg>
  );
}

export default function ForecastPage() {
  const forecast = useMemo(() => buildForecast(), []);
  const [tab, setTab] = useState("5-day");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = forecast[selectedIdx];

  // Hourly data enriched per day
  const hourlyData = useMemo(() => {
    const baseHours = ["06 AM", "09 AM", "12 PM", "03 PM", "06 PM", "09 PM"];
    const icons = [
      ["sunny", "partly-cloudy", "partly-cloudy", "cloudy", "rainy", "cloudy"],
      ["cloudy", "rainy", "rainy", "rainy", "thunderstorm", "cloudy"],
      ["cloudy", "thunderstorm", "thunderstorm", "rainy", "cloudy", "cloudy"],
      ["sunny", "sunny", "sunny", "partly-cloudy", "partly-cloudy", "sunny"],
      ["partly-cloudy", "cloudy", "cloudy", "rainy", "rainy", "cloudy"],
    ];
    const temps = [
      [26, 28, 30, 32, 29, 27],
      [24, 25, 27, 28, 26, 24],
      [22, 23, 25, 24, 23, 22],
      [28, 30, 32, 31, 30, 28],
      [25, 27, 29, 30, 28, 26],
    ];
    return baseHours.map((time, i) => ({
      time,
      temp: temps[selectedIdx][i],
      icon: icons[selectedIdx][i],
    }));
  }, [selectedIdx]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <h2 className="font-body font-bold text-xl" style={{ color: P.light }}>
          Forecast
        </h2>

        {/* ── Tabs ── */}
        <div
          className="flex w-fit rounded-xl overflow-hidden"
          style={{ background: P.card, border: `1px solid ${P.dark}33` }}
        >
          {[
            ["5-day", "5-Day Forecast"],
            ["hourly", "Hourly Forecast"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className="px-8 py-2.5 font-body text-sm font-medium transition-all"
              style={
                tab === val
                  ? { background: "#1a3a1a", color: P.light }
                  : { color: P.tan }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Day selector ── */}
        <div className="flex gap-2">
          {forecast.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className="px-6 py-2 rounded-lg font-body text-sm font-medium transition-all"
              style={
                selectedIdx === i
                  ? {
                      background: "#1a3a1a",
                      color: P.light,
                      border: `1px solid ${P.dark}66`,
                    }
                  : { color: P.tan, border: `1px solid transparent` }
              }
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* ── 5-Day detail card ── */}
        {tab === "5-day" && (
          <div
            className="rounded-2xl p-6"
            style={{ background: P.card, border: `1px solid ${P.dark}33` }}
          >
            {/* Date label */}
            <p className="font-body text-xs mb-4" style={{ color: P.tan }}>
              {selected.fullDate}
            </p>

            <div className="flex gap-8">
              {/* Left: icon + temp */}
              <div className="flex flex-col items-start gap-2 w-48 shrink-0">
                <ConditionIcon type={selected.icon} size={96} />
                <p className="font-display text-5xl" style={{ color: P.light }}>
                  {selected.high}° C
                </p>
                <p
                  className="font-body font-semibold"
                  style={{ color: P.light }}
                >
                  {selected.condition}
                </p>
                <p className="font-body text-sm" style={{ color: P.tan }}>
                  Feels Like {selected.feelsLike}° C
                </p>

                {/* High / Low */}
                <div className="flex gap-3 mt-1">
                  <span
                    className="font-body text-xs px-2 py-0.5 rounded"
                    style={{ background: `${P.dark}30`, color: P.mid }}
                  >
                    ↑ {selected.high}°
                  </span>
                  <span
                    className="font-body text-xs px-2 py-0.5 rounded"
                    style={{ background: `#1a3060`, color: "#7ab4f0" }}
                  >
                    ↓ {selected.low}°
                  </span>
                </div>
              </div>

              {/* Right: stats grid */}
              <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-5 content-start">
                {[
                  { label: "Feels like", value: `${selected.feelsLike}° C` },
                  { label: "Wind status", value: selected.wind },
                  { label: "Rain chance", value: selected.rain },
                  { label: "Visibility", value: selected.visibility },
                  { label: "UV index", value: selected.uvIndex },
                  { label: "Pressure", value: selected.pressure },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-body text-xs" style={{ color: P.tan }}>
                      {label}
                    </p>
                    <p
                      className="font-body font-semibold text-sm"
                      style={{ color: P.light }}
                    >
                      {value}
                    </p>
                  </div>
                ))}

                {/* Sun arc */}
                <div className="col-span-3 mt-2">
                  <div className="flex items-end justify-between px-2">
                    <div className="text-center">
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{
                          background: `${P.mid}22`,
                          border: `1px solid ${P.mid}66`,
                        }}
                      />
                      <p className="font-body text-xs" style={{ color: P.tan }}>
                        Sunrise
                      </p>
                      <p
                        className="font-body font-semibold text-xs"
                        style={{ color: P.light }}
                      >
                        {selected.sunrise}
                      </p>
                    </div>
                    <div className="flex-1 mx-4 mb-4">
                      <SunArc
                        sunrise={selected.sunrise}
                        sunset={selected.sunset}
                        isToday={selectedIdx === 0}
                      />
                    </div>
                    <div className="text-center">
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{
                          background: `${P.tan}22`,
                          border: `1px solid ${P.tan}66`,
                        }}
                      />
                      <p className="font-body text-xs" style={{ color: P.tan }}>
                        Sunset
                      </p>
                      <p
                        className="font-body font-semibold text-xs"
                        style={{ color: P.light }}
                      >
                        {selected.sunset}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-day mini strip */}
            <div
              className="mt-6 pt-5"
              style={{ borderTop: `1px solid ${P.dark}33` }}
            >
              <p className="font-body text-xs mb-3" style={{ color: P.tan }}>
                5-Day Overview
              </p>
              <div className="flex gap-3">
                {forecast.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                    style={
                      selectedIdx === i
                        ? {
                            background: "#1a3a1a",
                            border: `1px solid ${P.dark}55`,
                          }
                        : {
                            background: `${P.dark}11`,
                            border: `1px solid ${P.dark}22`,
                          }
                    }
                  >
                    <p
                      className="font-body text-xs"
                      style={{ color: selectedIdx === i ? P.light : P.tan }}
                    >
                      {day.label}
                    </p>
                    <ConditionIcon type={day.icon} size={28} />
                    <p
                      className="font-body text-xs font-semibold"
                      style={{ color: P.light }}
                    >
                      {day.high}°
                    </p>
                    <p
                      className="font-body text-xs"
                      style={{ color: "#7ab4f0" }}
                    >
                      {day.low}°
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Hourly tab ── */}
        {tab === "hourly" && (
          <div
            className="rounded-2xl p-6"
            style={{ background: P.card, border: `1px solid ${P.dark}33` }}
          >
            <p className="font-body text-xs mb-5" style={{ color: P.tan }}>
              {selected.fullDate} — Hourly breakdown
            </p>
            <div className="grid grid-cols-6 gap-3">
              {hourlyData.map((h) => {
                const now = new Date();
                const [hm, period] = h.time.split(" ");
                let hh = parseInt(hm);
                if (period === "PM" && hh !== 12) hh += 12;
                if (period === "AM" && hh === 12) hh = 0;
                const isCurrent =
                  selectedIdx === 0 && Math.abs(now.getHours() - hh) < 2;
                return (
                  <div
                    key={h.time}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl"
                    style={
                      isCurrent
                        ? {
                            background: "#1a3a1a",
                            border: `1px solid ${P.dark}66`,
                          }
                        : {
                            background: `${P.dark}11`,
                            border: `1px solid ${P.dark}22`,
                          }
                    }
                  >
                    <p
                      className="font-body text-xs"
                      style={{ color: isCurrent ? P.light : P.tan }}
                    >
                      {h.time}
                    </p>
                    <ConditionIcon type={h.icon} size={32} />
                    <p
                      className="font-body text-sm font-semibold"
                      style={{ color: P.light }}
                    >
                      {h.temp}°
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Temperature graph */}
            <div
              className="mt-6 pt-5"
              style={{ borderTop: `1px solid ${P.dark}33` }}
            >
              <p className="font-body text-xs mb-3" style={{ color: P.tan }}>
                Temperature trend
              </p>
              <svg viewBox="0 0 600 80" className="w-full overflow-visible">
                <defs>
                  <linearGradient
                    id="tempGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={P.mid} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={P.mid} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {(() => {
                  const temps = hourlyData.map((h) => h.temp);
                  const minT = Math.min(...temps) - 2;
                  const maxT = Math.max(...temps) + 2;
                  const xs = [50, 150, 250, 350, 450, 550];
                  const ys = temps.map(
                    (t) => 70 - ((t - minT) / (maxT - minT)) * 55,
                  );
                  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
                  const areaPath =
                    `M ${xs[0]},${ys[0]} ` +
                    xs
                      .slice(1)
                      .map((x, i) => `L ${x},${ys[i + 1]}`)
                      .join(" ") +
                    ` L ${xs[5]},76 L ${xs[0]},76 Z`;
                  const linePath =
                    `M ${xs[0]},${ys[0]} ` +
                    xs
                      .slice(1)
                      .map((x, i) => `L ${x},${ys[i + 1]}`)
                      .join(" ");
                  return (
                    <>
                      <path d={areaPath} fill="url(#tempGrad)" />
                      <path
                        d={linePath}
                        stroke={P.mid}
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinejoin="round"
                      />
                      {xs.map((x, i) => (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={ys[i]}
                            r="3.5"
                            fill={P.card}
                            stroke={P.mid}
                            strokeWidth="1.5"
                          />
                          <text
                            x={x}
                            y={ys[i] - 8}
                            textAnchor="middle"
                            style={{
                              fontSize: "9px",
                              fill: P.tan,
                              fontFamily: "sans-serif",
                            }}
                          >
                            {temps[i]}°
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* ── AQI ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: P.card, border: `1px solid ${P.dark}33` }}
        >
          <p
            className="font-body font-semibold mb-4"
            style={{ color: P.light }}
          >
            Air Quality Index
          </p>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
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
                  strokeDasharray={`${(currentWeather.aqi / 150) * 314} 314`}
                  strokeDashoffset="78"
                  strokeLinecap="round"
                  transform="rotate(-220 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display text-xl"
                  style={{ color: P.light }}
                >
                  {currentWeather.aqi}
                </span>
                <span className="font-body text-xs" style={{ color: P.mid }}>
                  {currentWeather.aqiLabel}
                </span>
              </div>
            </div>
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: P.tan }}
            >
              Displays the current air quality level based on pollution data in
              the selected location. The AQI score shown is {currentWeather.aqi}
              , which is categorized as{" "}
              <strong style={{ color: P.mid }}>Good</strong>, meaning the air
              quality is clean, safe, and poses little or no health risk for
              outdoor activities.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
