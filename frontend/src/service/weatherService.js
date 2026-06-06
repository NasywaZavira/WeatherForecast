const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}

function mapConditionToIcon(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "cloudy"; // snow → cloudy fallback
  if (weatherId >= 700 && weatherId < 800) return "cloudy"; // mist/fog
  if (weatherId === 800) return "sunny";
  if (weatherId === 801 || weatherId === 802) return "partly-cloudy";
  return "cloudy";
}

function formatTime(unixTimestamp, timezoneOffset) {
  // timezoneOffset dari API dalam detik
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const h = date.getUTCHours().toString().padStart(2, "0");
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  const period = date.getUTCHours() < 12 ? "AM" : "PM";
  const h12 = (date.getUTCHours() % 12 || 12).toString().padStart(2, "0");
  return `${h12}.${m} ${period}`;
}

function getDayLabel(unixTimestamp, index) {
  if (index === 0) return "Today";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(unixTimestamp * 1000).getDay()];
}

// ── 1. Current Weather ───────────────────────────────────────

export async function fetchCurrentWeather(city = "Medan,ID") {
  const url = `${BASE_URL}/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  const data = await res.json();

  return {
    temp: kelvinToCelsius(data.main.temp),
    feelsLike: kelvinToCelsius(data.main.feels_like),
    condition: data.weather[0].main, // 'Clear', 'Rain', dll.
    description: data.weather[0].description, // 'light rain', dll.
    location: `${data.name}, ${data.sys.country}`,
    wind: `${Math.round(data.wind.speed * 3.6)} km/h`, // m/s → km/h
    visibility: `${(data.visibility / 1000).toFixed(1)} km`,
    humidity: `${data.main.humidity}%`,
    pressure: `${data.main.pressure} hPa`,
    sunrise: formatTime(data.sys.sunrise, data.timezone),
    sunset: formatTime(data.sys.sunset, data.timezone),
    icon: mapConditionToIcon(data.weather[0].id),
    // rain & uvIndex & moonPhase diambil dari endpoint lain (lihat di bawah)
  };
}


export async function fetchForecast(city = "Medan,ID") {
  const url = `${BASE_URL}/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Forecast API error: ${res.status} ${res.statusText}`);
  const data = await res.json();

  // Hourly: ambil 6 slot pertama (setiap 3 jam)
  const hourlyForecast = data.list.slice(0, 6).map((item) => ({
    time: formatTime(item.dt, data.city.timezone),
    temp: kelvinToCelsius(item.main.temp),
    icon: mapConditionToIcon(item.weather[0].id),
  }));

  // Daily: ambil 1 data per hari (biasanya sekitar jam 12:00)
  const dayMap = new Map();
  for (const item of data.list) {
    const date = new Date(item.dt * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!dayMap.has(key)) {
      dayMap.set(key, item);
    } else {
      // Pilih entri paling dekat jam 12:00 UTC
      const existing = dayMap.get(key);
      if (
        Math.abs(date.getUTCHours() - 12) <
        Math.abs(new Date(existing.dt * 1000).getUTCHours() - 12)
      ) {
        dayMap.set(key, item);
      }
    }
  }

  const forecast5Day = [...dayMap.values()].slice(0, 5).map((item, i) => ({
    day: getDayLabel(item.dt, i),
    icon: mapConditionToIcon(item.weather[0].id),
    high: kelvinToCelsius(item.main.temp_max),
    low: kelvinToCelsius(item.main.temp_min),
  }));

  return { forecast5Day, hourlyForecast };
}

export async function fetchAQI(lat = 3.5952, lon = 98.6722) {
  const url = `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AQI API error: ${res.status}`);
  const data = await res.json();

  const aqiValue = data.list[0].main.aqi; // 1–5 (1=Good, 5=Very Poor)
  const labels = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];

  // Skala UI kamu pakai 0–150+; kita skalakan
  const scaledAqi = [0, 25, 50, 100, 150, 200][aqiValue] ?? 50;

  return {
    aqi: scaledAqi,
    aqiLabel: labels[aqiValue] ?? "Unknown",
  };
}

export async function fetchOneCall(lat = 3.5952, lon = 98.6722) {
  const url = `${BASE_URL}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${API_KEY}&units=metric`;

  const res = await fetch(url);
  if (!res.ok) {
    // Fallback jika tidak ada akses One Call
    return { uvIndex: "N/A", rain: "N/A", moonPhase: "N/A" };
  }
  const data = await res.json();

  const uv = data.current.uvi;
  const uvLabel =
    uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : "Very High";

  const rainPop = data.daily?.[0]?.pop ?? 0; // probability of precipitation (0–1)

  const moonPhaseVal = data.daily?.[0]?.moon_phase ?? 0;
  const moonLabels = [
    [0, "New Moon"],
    [0.25, "First Quarter"],
    [0.5, "Full Moon"],
    [0.75, "Last Quarter"],
    [1, "New Moon"],
  ];
  const moonPhase = moonLabels.reduce((prev, curr) =>
    Math.abs(curr[0] - moonPhaseVal) < Math.abs(prev[0] - moonPhaseVal)
      ? curr
      : prev,
  )[1];

  return {
    uvIndex: `${uv} (${uvLabel})`,
    rain: `${Math.round(rainPop * 100)}%`,
    moonPhase,
  };
}


export async function fetchAllWeatherData(
  city = "Medan,ID",
  lat = 3.5952,
  lon = 98.6722,
) {
  const [current, { forecast5Day, hourlyForecast }, aqi] = await Promise.all([
    fetchCurrentWeather(city),
    fetchForecast(city),
    fetchAQI(lat, lon),
  ]);
  const oneCall = await fetchOneCall(lat, lon).catch(() => ({
    uvIndex: "N/A",
    rain: "N/A",
    moonPhase: "N/A",
  }));

  const currentWeather = {
    ...current,
    ...aqi,
    ...oneCall,
  };

  return { currentWeather, forecast5Day, hourlyForecast };
}
