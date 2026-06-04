export const currentWeather = {
  temp: 30,
  feelsLike: 33,
  condition: 'Partly Cloudy',
  location: 'Medan, Indonesia',
  aqi: 42,
  aqiLabel: 'Good',
  wind: '12 km/h',
  rain: '20%',
  visibility: '10 km',
  uvIndex: '5 (Moderate)',
  pressure: '1008 hPa',
  sunrise: '06.00 AM',
  sunset: '07.00 PM',
  moonPhase: 'Waxing Crescent',
}

export const forecast5Day = [
  { day: 'Today', icon: 'partly-cloudy', high: 30, low: 28 },
  { day: 'Mon',   icon: 'rainy',         high: 28, low: 25 },
  { day: 'Tue',   icon: 'thunderstorm',  high: 25, low: 23 },
  { day: 'Wed',   icon: 'sunny',         high: 39, low: 41 },
  { day: 'Thu',   icon: 'cloudy',        high: 33, low: 32 },
]

export const hourlyForecast = [
  { time: '06 AM', temp: 26, icon: 'sunny' },
  { time: '09 AM', temp: 28, icon: 'partly-cloudy' },
  { time: '12 PM', temp: 30, icon: 'partly-cloudy' },
  { time: '03 PM', temp: 32, icon: 'cloudy' },
  { time: '06 PM', temp: 29, icon: 'rainy' },
  { time: '09 PM', temp: 27, icon: 'cloudy' },
]
