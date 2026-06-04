export default function WeatherIcon({ size = 100 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="82" cy="28" r="22" fill="#f0c040" />
      {/* Cloud */}
      <ellipse cx="52" cy="62" rx="38" ry="26" fill="white" />
      <ellipse cx="38" cy="54" rx="22" ry="20" fill="white" />
      <ellipse cx="68" cy="50" rx="24" ry="22" fill="white" />
    </svg>
  )
}
