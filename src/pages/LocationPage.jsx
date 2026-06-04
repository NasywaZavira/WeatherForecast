import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ConditionIcon from "../components/ConditionIcon";
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  X,
  Plus,
  Star,
} from "lucide-react";

const P = {
  black: "#080704",
  dark: "#347E3A",
  mid: "#56B988",
  tan: "#D3BE94",
  light: "#F3EEE3",
  card: "#0f1f0f",
};

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Saved locations default
const DEFAULT_LOCATIONS = [
  {
    id: 1,
    name: "Medan",
    country: "ID",
    lat: 3.5952,
    lon: 98.6722,
    starred: true,
  },
  {
    id: 2,
    name: "Jakarta",
    country: "ID",
    lat: -6.2088,
    lon: 106.8456,
    starred: false,
  },
  {
    id: 3,
    name: "Bali",
    country: "ID",
    lat: -8.4095,
    lon: 115.1889,
    starred: false,
  },
];

function mapConditionToIcon(id) {
  if (id >= 200 && id < 300) return "thunderstorm";
  if (id >= 300 && id < 600) return "rainy";
  if (id >= 600 && id < 800) return "cloudy";
  if (id === 800) return "sunny";
  if (id <= 802) return "partly-cloudy";
  return "cloudy";
}

// ── Leaflet Map Component ────────────────────────────────────
function LeafletMap({ center, zoom, markers, onMapClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      const Lm = L.default || L;

      // Dark tile layer (CartoDB Dark Matter — no API key needed)
      const map = Lm.map(containerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      Lm.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 },
      ).addTo(map);

      // Custom zoom control bottom-right
      Lm.control.zoom({ position: "bottomright" }).addTo(map);

      // Click handler
      map.on("click", (e) => {
        onMapClick && onMapClick(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = { map, L: Lm };
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line

  // Update center/zoom when changed
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, L } = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach(({ lat, lon, label, temp, isActive }) => {
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            background: ${isActive ? "#56B988" : "#1a3a1a"};
            border: 2px solid ${isActive ? "#D3BE94" : "#347E3A"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 12px rgba(0,0,0,0.5);
          ">
            <span style="
              transform: rotate(45deg);
              color: ${isActive ? "#080704" : "#56B988"};
              font-size: 10px;
              font-weight: 700;
              font-family: sans-serif;
            ">${temp ? temp + "°" : "📍"}</span>
          </div>
          ${
            label
              ? `<div style="
            margin-top:4px; margin-left:-12px;
            background: #0f1f0f; border: 1px solid #347E3A55;
            border-radius: 6px; padding: 2px 6px;
            color: #F3EEE3; font-size: 10px;
            font-family: sans-serif; white-space:nowrap;
            text-align:center;
          ">${label}</div>`
              : ""
          }
        `,
        iconSize: [32, 44],
        iconAnchor: [16, 44],
      });

      const marker = L.marker([lat, lon], { icon }).addTo(map);
      markersRef.current.push(marker);
    });
  }, [markers]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", borderRadius: "12px" }}
    />
  );
}

// ── Weather Card for a location ──────────────────────────────
function LocationWeatherCard({ loc, isActive, onClick, onRemove, onStar }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const fetchW = async () => {
      try {
        if (!API_KEY) {
          // Fallback mock data when no API key
          await new Promise((r) => setTimeout(r, 400));
          if (!alive) return;
          setWeather({
            temp: Math.round(26 + Math.random() * 8),
            condition: ["Partly Cloudy", "Sunny", "Cloudy", "Rainy"][
              Math.floor(Math.random() * 4)
            ],
            icon: ["partly-cloudy", "sunny", "cloudy", "rainy"][
              Math.floor(Math.random() * 4)
            ],
            wind: `${Math.round(8 + Math.random() * 15)} km/h`,
            humidity: `${Math.round(60 + Math.random() * 30)}%`,
          });
          setLoading(false);
          return;
        }
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}`,
        );
        const data = await res.json();
        if (!alive) return;
        setWeather({
          temp: Math.round(data.main.temp - 273.15),
          condition: data.weather[0].main,
          icon: mapConditionToIcon(data.weather[0].id),
          wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
          humidity: `${data.main.humidity}%`,
        });
      } catch {
        if (!alive) return;
        setWeather({
          temp: "--",
          condition: "Unavailable",
          icon: "cloudy",
          wind: "--",
          humidity: "--",
        });
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchW();
    return () => {
      alive = false;
    };
  }, [loc.lat, loc.lon]);

  return (
    <div
      onClick={onClick}
      className="relative rounded-xl p-4 cursor-pointer transition-all"
      style={{
        background: isActive ? "#1a3a1a" : `${P.dark}0d`,
        border: `1px solid ${isActive ? P.dark + "88" : P.dark + "22"}`,
      }}
    >
      {/* Actions */}
      <div
        className="absolute top-3 right-3 flex gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onStar(loc.id)}
          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: loc.starred ? "#f0c040" : P.tan + "66" }}
        >
          <Star size={12} fill={loc.starred ? "#f0c040" : "none"} />
        </button>
        <button
          onClick={() => onRemove(loc.id)}
          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          style={{ color: P.tan + "66" }}
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <MapPin size={12} style={{ color: P.mid }} />
        <span
          className="font-body text-xs font-semibold"
          style={{ color: P.mid }}
        >
          {loc.name}, {loc.country}
        </span>
      </div>

      {loading ? (
        <div className="flex gap-2 items-center">
          <div
            className="w-8 h-8 rounded-lg animate-pulse"
            style={{ background: P.dark + "33" }}
          />
          <div className="space-y-1.5">
            <div
              className="w-16 h-3 rounded animate-pulse"
              style={{ background: P.dark + "33" }}
            />
            <div
              className="w-10 h-3 rounded animate-pulse"
              style={{ background: P.dark + "22" }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <ConditionIcon type={weather.icon} size={36} />
            <div>
              <p className="font-display text-2xl" style={{ color: P.light }}>
                {weather.temp}° C
              </p>
              <p className="font-body text-xs" style={{ color: P.tan }}>
                {weather.condition}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <Wind size={10} style={{ color: P.mid }} />
              <span className="font-body text-xs" style={{ color: P.tan }}>
                {weather.wind}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets size={10} style={{ color: "#4a9eff" }} />
              <span className="font-body text-xs" style={{ color: P.tan }}>
                {weather.humidity}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Search Result Item ───────────────────────────────────────
function SearchResultItem({ result, onAdd }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-opacity-80"
      style={{ background: `${P.dark}15`, border: `1px solid ${P.dark}22` }}
    >
      <div className="flex items-center gap-2">
        <MapPin size={13} style={{ color: P.mid }} />
        <div>
          <p className="font-body text-sm" style={{ color: P.light }}>
            {result.name}
          </p>
          <p className="font-body text-xs" style={{ color: P.tan }}>
            {result.state ? result.state + ", " : ""}
            {result.country}
          </p>
        </div>
      </div>
      <button
        onClick={() => onAdd(result)}
        className="flex items-center gap-1 px-3 py-1 rounded-lg font-body text-xs transition-all"
        style={{
          background: `${P.dark}44`,
          color: P.mid,
          border: `1px solid ${P.dark}55`,
        }}
      >
        <Plus size={11} /> Add
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function LocationPage() {
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [activeId, setActiveId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([3.5952, 98.6722]);
  const [mapZoom, setMapZoom] = useState(10);
  const [clickedCoord, setClickedCoord] = useState(null);
  const [clickWeather, setClickWeather] = useState(null);
  const searchTimer = useRef(null);

  const activeLoc = locations.find((l) => l.id === activeId);

  // Focus map on active location
  useEffect(() => {
    if (!activeLoc) return;
    setMapCenter([activeLoc.lat, activeLoc.lon]);
    setMapZoom(11);
  }, [activeId]);

  // Search cities via OpenWeatherMap geocoding
  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (!API_KEY) {
          // Mock results
          setSearchResults([
            {
              name: q,
              country: "ID",
              state: "North Sumatra",
              lat: 3.5952,
              lon: 98.6722,
            },
          ]);
          return;
        }
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${API_KEY}`,
        );
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  // Add location from search
  const handleAddLocation = (result) => {
    const exists = locations.find(
      (l) =>
        Math.abs(l.lat - result.lat) < 0.01 &&
        Math.abs(l.lon - result.lon) < 0.01,
    );
    if (exists) {
      setActiveId(exists.id);
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const newLoc = {
      id: Date.now(),
      name: result.name,
      country: result.country,
      lat: result.lat,
      lon: result.lon,
      starred: false,
    };
    setLocations((prev) => [...prev, newLoc]);
    setActiveId(newLoc.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Remove location
  const handleRemove = (id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    if (activeId === id)
      setActiveId(locations.find((l) => l.id !== id)?.id || null);
  };

  // Toggle star
  const handleStar = (id) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, starred: !l.starred } : l)),
    );
  };

  // Map click — reverse geocode + fetch weather
  const handleMapClick = useCallback(async (lat, lon) => {
    setClickedCoord({ lat, lon });
    setClickWeather(null);

    try {
      if (!API_KEY) {
        setClickWeather({
          name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          temp: 29,
          condition: "Partly Cloudy",
          icon: "partly-cloudy",
          wind: "10 km/h",
          humidity: "72%",
        });
        return;
      }
      const [geoRes, wRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
        ),
      ]);
      const [geo, w] = await Promise.all([geoRes.json(), wRes.json()]);
      const name = geo?.[0]?.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      setClickWeather({
        name,
        country: geo?.[0]?.country || "",
        temp: Math.round(w.main.temp - 273.15),
        feelsLike: Math.round(w.main.feels_like - 273.15),
        condition: w.weather[0].main,
        icon: mapConditionToIcon(w.weather[0].id),
        wind: `${Math.round(w.wind.speed * 3.6)} km/h`,
        humidity: `${w.main.humidity}%`,
        visibility: `${(w.visibility / 1000).toFixed(1)} km`,
        pressure: `${w.main.pressure} hPa`,
      });
    } catch {
      setClickWeather({
        name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        temp: "--",
        condition: "Unavailable",
        icon: "cloudy",
        wind: "--",
        humidity: "--",
      });
    }
  }, []);

  // Add clicked location
  const addClickedLocation = () => {
    if (!clickedCoord || !clickWeather) return;
    handleAddLocation({
      name: clickWeather.name,
      country: clickWeather.country || "??",
      lat: clickedCoord.lat,
      lon: clickedCoord.lon,
    });
    setClickedCoord(null);
    setClickWeather(null);
  };

  // Build markers
  const markers = [
    ...locations.map((l) => ({
      lat: l.lat,
      lon: l.lon,
      label: l.name,
      isActive: l.id === activeId,
    })),
    ...(clickedCoord
      ? [
          {
            lat: clickedCoord.lat,
            lon: clickedCoord.lon,
            label: clickWeather?.name || "...",
            isActive: false,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen" style={{ background: P.black }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden flex p-6 gap-5">
          {/* ── LEFT PANEL ── */}
          <div className="w-72 flex flex-col gap-4 overflow-y-auto shrink-0">
            <h2
              className="font-body font-bold text-xl"
              style={{ color: P.light }}
            >
              Location
            </h2>

            {/* Search */}
            <div className="relative">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: P.card, border: `1px solid ${P.dark}44` }}
              >
                <Search size={14} style={{ color: P.mid }} />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent font-body text-sm outline-none flex-1"
                  style={{ color: P.light }}
                />
                {searching && (
                  <div
                    className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
                    style={{
                      borderColor: P.mid,
                      borderTopColor: "transparent",
                    }}
                  />
                )}
              </div>

              {/* Dropdown results */}
              {searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 space-y-1 p-2"
                  style={{
                    background: P.card,
                    border: `1px solid ${P.dark}44`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  {searchResults.map((r, i) => (
                    <SearchResultItem
                      key={i}
                      result={r}
                      onAdd={handleAddLocation}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Saved locations */}
            <div>
              <p className="font-body text-xs mb-2" style={{ color: P.tan }}>
                Saved Locations ({locations.length})
              </p>
              <div className="space-y-2">
                {[...locations]
                  .sort((a, b) => b.starred - a.starred)
                  .map((loc) => (
                    <LocationWeatherCard
                      key={loc.id}
                      loc={loc}
                      isActive={loc.id === activeId}
                      onClick={() => setActiveId(loc.id)}
                      onRemove={handleRemove}
                      onStar={handleStar}
                    />
                  ))}
              </div>
            </div>

            {/* Clicked location popup */}
            {clickWeather && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "#1a2a1a",
                  border: `1px solid ${P.dark}55`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="font-body text-xs font-semibold"
                    style={{ color: P.mid }}
                  >
                    📍 Clicked Location
                  </p>
                  <button
                    onClick={() => {
                      setClickedCoord(null);
                      setClickWeather(null);
                    }}
                  >
                    <X size={12} style={{ color: P.tan }} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <ConditionIcon type={clickWeather.icon} size={32} />
                  <div>
                    <p
                      className="font-body text-sm font-semibold"
                      style={{ color: P.light }}
                    >
                      {clickWeather.name}
                      {clickWeather.country ? `, ${clickWeather.country}` : ""}
                    </p>
                    <p
                      className="font-display text-xl"
                      style={{ color: P.light }}
                    >
                      {clickWeather.temp}° C
                    </p>
                  </div>
                </div>
                {clickWeather.wind && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { icon: Wind, val: clickWeather.wind, label: "Wind" },
                      {
                        icon: Droplets,
                        val: clickWeather.humidity,
                        label: "Humidity",
                      },
                    ].map(({ icon: Icon, val, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <Icon size={11} style={{ color: P.mid }} />
                        <span
                          className="font-body text-xs"
                          style={{ color: P.tan }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={addClickedLocation}
                  className="w-full py-2 rounded-lg font-body text-xs font-semibold transition-all"
                  style={{ background: P.dark, color: P.light }}
                >
                  + Add to Saved Locations
                </button>
              </div>
            )}
          </div>

          {/* ── MAP ── */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Map header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={14} style={{ color: P.mid }} />
                <span className="font-body text-sm" style={{ color: P.tan }}>
                  {activeLoc
                    ? `${activeLoc.name}, ${activeLoc.country}`
                    : "Select a location"}
                </span>
              </div>
              <span
                className="font-body text-xs px-3 py-1 rounded-full"
                style={{
                  background: `${P.dark}22`,
                  color: P.tan,
                  border: `1px solid ${P.dark}33`,
                }}
              >
                Click anywhere on map to get weather
              </span>
            </div>

            {/* Map container */}
            <div
              className="flex-1 rounded-2xl overflow-hidden relative min-h-0"
              style={{ border: `1px solid ${P.dark}33` }}
            >
              <LeafletMap
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
                onMapClick={handleMapClick}
              />

              {/* Map legend overlay */}
              <div
                className="absolute bottom-4 left-4 rounded-xl px-4 py-3 z-[1000]"
                style={{
                  background: "rgba(8,7,4,0.85)",
                  border: `1px solid ${P.dark}44`,
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="font-body text-xs mb-2" style={{ color: P.tan }}>
                  Legend
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: P.mid }}
                    />
                    <span
                      className="font-body text-xs"
                      style={{ color: P.tan }}
                    >
                      Active location
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: "#1a3a1a",
                        border: `1px solid ${P.dark}`,
                      }}
                    />
                    <span
                      className="font-body text-xs"
                      style={{ color: P.tan }}
                    >
                      Saved location
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats bar for active location */}
            {activeLoc && (
              <div
                className="rounded-xl p-4 flex items-center gap-6"
                style={{ background: P.card, border: `1px solid ${P.dark}33` }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={13} style={{ color: P.mid }} />
                  <span
                    className="font-body text-sm font-semibold"
                    style={{ color: P.light }}
                  >
                    {activeLoc.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer size={12} style={{ color: P.tan }} />
                  <span className="font-body text-xs" style={{ color: P.tan }}>
                    {activeLoc.lat.toFixed(4)}° N, {activeLoc.lon.toFixed(4)}° E
                  </span>
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => {
                    setMapCenter([activeLoc.lat, activeLoc.lon]);
                    setMapZoom(13);
                  }}
                  className="font-body text-xs px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: `${P.dark}33`,
                    color: P.mid,
                    border: `1px solid ${P.dark}44`,
                  }}
                >
                  Zoom to location
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
