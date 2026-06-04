export default function ConditionIcon({ type = 'partly-cloudy', size = 48 }) {
  const icons = {
    'partly-cloudy': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="30" cy="16" r="10" fill="#f0c040" />
        <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" opacity="0.95" />
        <ellipse cx="14" cy="26" rx="9" ry="8" fill="white" opacity="0.95" />
        <ellipse cx="28" cy="24" rx="10" ry="9" fill="white" opacity="0.95" />
      </svg>
    ),
    'sunny': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" fill="#f0c040" />
        {[0,45,90,135,180,225,270,315].map(deg => (
          <line key={deg}
            x1={24 + 14 * Math.cos(deg * Math.PI / 180)}
            y1={24 + 14 * Math.sin(deg * Math.PI / 180)}
            x2={24 + 18 * Math.cos(deg * Math.PI / 180)}
            y2={24 + 18 * Math.sin(deg * Math.PI / 180)}
            stroke="#f0c040" strokeWidth="2.5" strokeLinecap="round"
          />
        ))}
      </svg>
    ),
    'cloudy': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="28" rx="18" ry="12" fill="white" opacity="0.9" />
        <ellipse cx="16" cy="22" rx="10" ry="9" fill="white" opacity="0.9" />
        <ellipse cx="30" cy="20" rx="11" ry="10" fill="white" opacity="0.9" />
      </svg>
    ),
    'rainy': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="22" rx="16" ry="10" fill="#8faa8f" />
        <ellipse cx="16" cy="18" rx="9" ry="8" fill="#8faa8f" />
        <ellipse cx="30" cy="16" rx="10" ry="9" fill="#8faa8f" />
        {[14,20,26,32].map((x, i) => (
          <line key={i} x1={x} y1="34" x2={x - 2} y2="42" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
    'thunderstorm': (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="20" rx="16" ry="10" fill="#6a7a6a" />
        <ellipse cx="16" cy="16" rx="9" ry="8" fill="#6a7a6a" />
        <ellipse cx="30" cy="14" rx="10" ry="9" fill="#6a7a6a" />
        {[14,24,30].map((x, i) => (
          <line key={i} x1={x} y1="32" x2={x - 2} y2="40" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        <polyline points="26,28 22,36 25,36 21,44" stroke="#f0c040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  }

  return icons[type] || icons['partly-cloudy']
}
