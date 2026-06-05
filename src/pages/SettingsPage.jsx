import { useState } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Thermometer,
  Bell,
  Globe,
  Shield,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Monitor,
  Smartphone,
  Sun,
} from "lucide-react";

const P = {
  black: "#080704",
  dark: "#347E3A",
  mid: "#56B988",
  tan: "#D3BE94",
  light: "#F3EEE3",
  card: "#0f1f0f",
};

// ── Reusable UI primitives ───────────────────────────────────

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: P.card, border: `1px solid ${P.dark}33` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${P.dark}22`, border: `1px solid ${P.dark}44` }}
        >
          <Icon size={16} style={{ color: P.mid }} />
        </div>
        <div>
          <p
            className="font-body font-semibold text-sm"
            style={{ color: P.light }}
          >
            {title}
          </p>
          {description && (
            <p className="font-body text-xs" style={{ color: P.tan }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: `1px solid ${P.dark}18` }}
    >
      <div>
        <p className="font-body text-sm" style={{ color: P.light }}>
          {label}
        </p>
        {description && (
          <p className="font-body text-xs mt-0.5" style={{ color: P.tan }}>
            {description}
          </p>
        )}
      </div>
      <div className="ml-6 shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-300"
      style={{
        background: value ? P.dark : "#1a2a1a",
        border: `1px solid ${value ? P.mid : P.dark + "44"}`,
      }}
    >
      <div
        className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full shadow"
        style={{
          left: value ? "22px" : "2px",
          background: value ? P.mid : P.tan + "66",
        }}
      />
    </button>
  );
}

function SelectBox({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none font-body text-sm px-4 py-2 pr-8 rounded-xl outline-none cursor-pointer"
        style={{
          background: `${P.dark}22`,
          border: `1px solid ${P.dark}44`,
          color: P.light,
        }}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: "#1a3a1a" }}
          >
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: P.tan }}
      />
    </div>
  );
}

function SaveButton({ onClick, saved }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-xl font-body text-sm font-semibold transition-all"
      style={{
        background: saved ? `${P.mid}22` : P.dark,
        color: saved ? P.mid : P.light,
        border: `1px solid ${saved ? P.mid + "44" : "transparent"}`,
      }}
    >
      {saved ? (
        <>
          <Check size={14} /> Saved
        </>
      ) : (
        "Save changes"
      )}
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, setUser } = useAuth();

  // Profile
  const [username, setUsername] = useState(user?.username || "CoolUsername123");
  const [email, setEmail] = useState(user?.email || "user@example.com");
  const [profileSaved, setProfileSaved] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  // Weather units
  const [tempUnit, setTempUnit] = useState("celsius");
  const [windUnit, setWindUnit] = useState("kmh");
  const [pressureUnit, setPressureUnit] = useState("hpa");
  const [timeFormat, setTimeFormat] = useState("24h");
  const [unitSaved, setUnitSaved] = useState(false);

  // Notifications
  const [notifRain, setNotifRain] = useState(true);
  const [notifSevere, setNotifSevere] = useState(true);
  const [notifDaily, setNotifDaily] = useState(false);
  const [notifUV, setNotifUV] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Display
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [defaultCity, setDefaultCity] = useState("Medan");
  const [animationsOn, setAnimationsOn] = useState(true);
  const [displaySaved, setDisplaySaved] = useState(false);

  const flashSaved = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSaveProfile = () => {
    setUser((prev) => ({ ...prev, username, email }));
    flashSaved(setProfileSaved);
  };

  const handleSavePassword = () => {
    if (!currentPw) {
      setPwError("Enter your current password.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    flashSaved(setPwSaved);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2
            className="font-body font-bold text-xl"
            style={{ color: P.light }}
          >
            Settings
          </h2>

          {/* ── Profile ── */}
          <SectionCard
            icon={User}
            title="Profile"
            description="Update your display name and email"
          >
            <SettingRow label="Username" description="Shown in the sidebar">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-body text-sm px-4 py-2 rounded-xl outline-none w-48"
                style={{
                  background: `${P.dark}22`,
                  border: `1px solid ${P.dark}44`,
                  color: P.light,
                }}
              />
            </SettingRow>
            <SettingRow label="Email" description="Used for account recovery">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="font-body text-sm px-4 py-2 rounded-xl outline-none w-48"
                style={{
                  background: `${P.dark}22`,
                  border: `1px solid ${P.dark}44`,
                  color: P.light,
                }}
              />
            </SettingRow>
            <div className="flex justify-end pt-1">
              <SaveButton onClick={handleSaveProfile} saved={profileSaved} />
            </div>
          </SectionCard>

          {/* ── Password ── */}
          <SectionCard
            icon={Shield}
            title="Password"
            description="Change your account password"
          >
            {[
              {
                label: "Current password",
                val: currentPw,
                set: setCurrentPw,
              },
              { label: "New password", val: newPw, set: setNewPw },
              {
                label: "Confirm password",
                val: confirmPw,
                set: setConfirmPw,
              },
            ].map(({ label, val, set }) => (
              <SettingRow key={label} label={label}>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder="••••••••"
                    className="font-body text-sm px-4 py-2 pr-10 rounded-xl outline-none w-48"
                    style={{
                      background: `${P.dark}22`,
                      border: `1px solid ${P.dark}44`,
                      color: P.light,
                    }}
                  />
                  <button
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: P.tan }}
                  >
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </SettingRow>
            ))}
            {pwError && (
              <p
                className="font-body text-xs px-1"
                style={{ color: "#f07070" }}
              >
                {pwError}
              </p>
            )}
            <div className="flex justify-end pt-1">
              <SaveButton onClick={handleSavePassword} saved={pwSaved} />
            </div>
          </SectionCard>

          {/* ── Units ── */}
          <SectionCard
            icon={Thermometer}
            title="Units & Format"
            description="Customize how weather data is displayed"
          >
            <SettingRow label="Temperature unit">
              <SelectBox
                value={tempUnit}
                onChange={setTempUnit}
                options={[
                  { value: "celsius", label: "°C — Celsius" },
                  { value: "fahrenheit", label: "°F — Fahrenheit" },
                  { value: "kelvin", label: "K — Kelvin" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Wind speed">
              <SelectBox
                value={windUnit}
                onChange={setWindUnit}
                options={[
                  { value: "kmh", label: "km/h" },
                  { value: "mph", label: "mph" },
                  { value: "ms", label: "m/s" },
                  { value: "knot", label: "knot" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Pressure">
              <SelectBox
                value={pressureUnit}
                onChange={setPressureUnit}
                options={[
                  { value: "hpa", label: "hPa" },
                  { value: "mbar", label: "mbar" },
                  { value: "inhg", label: "inHg" },
                  { value: "mmhg", label: "mmHg" },
                ]}
              />
            </SettingRow>
            <SettingRow label="Time format">
              <SelectBox
                value={timeFormat}
                onChange={setTimeFormat}
                options={[
                  { value: "24h", label: "24-hour (13:00)" },
                  { value: "12h", label: "12-hour (1:00 PM)" },
                ]}
              />
            </SettingRow>
            <div className="flex justify-end pt-1">
              <SaveButton
                onClick={() => flashSaved(setUnitSaved)}
                saved={unitSaved}
              />
            </div>
          </SectionCard>

          {/* ── Notifications ── */}
          <SectionCard
            icon={Bell}
            title="Notifications"
            description="Choose which weather alerts to receive"
          >
            <SettingRow
              label="Rain alert"
              description="Notify when rain is expected"
            >
              <Toggle value={notifRain} onChange={setNotifRain} />
            </SettingRow>
            <SettingRow
              label="Severe weather warning"
              description="Storms, strong winds, extreme temperatures"
            >
              <Toggle value={notifSevere} onChange={setNotifSevere} />
            </SettingRow>
            <SettingRow
              label="Daily summary"
              description="Morning briefing every day at 7:00 AM"
            >
              <Toggle value={notifDaily} onChange={setNotifDaily} />
            </SettingRow>
            <SettingRow
              label="UV index alert"
              description="Notify when UV index exceeds moderate level"
            >
              <Toggle value={notifUV} onChange={setNotifUV} />
            </SettingRow>
            <div className="flex justify-end pt-1">
              <SaveButton
                onClick={() => flashSaved(setNotifSaved)}
                saved={notifSaved}
              />
            </div>
          </SectionCard>

          {/* ── Display ── */}
          <SectionCard
            icon={Monitor}
            title="Display"
            description="Appearance and regional preferences"
          >
            <SettingRow label="Theme">
              <div className="flex gap-2">
                {[
                  { val: "dark", icon: Monitor, label: "Dark" },
                  { val: "light", icon: Sun, label: "Light" },
                  { val: "auto", icon: Smartphone, label: "Auto" },
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs transition-all"
                    style={
                      theme === val
                        ? {
                            background: `${P.dark}44`,
                            color: P.light,
                            border: `1px solid ${P.dark}66`,
                          }
                        : {
                            background: "transparent",
                            color: P.tan,
                            border: `1px solid ${P.dark}22`,
                          }
                    }
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow label="Language">
              <SelectBox
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "en", label: "English" },
                  { value: "id", label: "Bahasa Indonesia" },
                  { value: "ms", label: "Bahasa Melayu" },
                  { value: "zh", label: "Chinese (Simplified)" },
                  { value: "ar", label: "Arabic" },
                ]}
              />
            </SettingRow>
            <SettingRow
              label="Default city"
              description="City shown first on Dashboard"
            >
              <input
                value={defaultCity}
                onChange={(e) => setDefaultCity(e.target.value)}
                className="font-body text-sm px-4 py-2 rounded-xl outline-none w-36"
                style={{
                  background: `${P.dark}22`,
                  border: `1px solid ${P.dark}44`,
                  color: P.light,
                }}
              />
            </SettingRow>
            <SettingRow
              label="UI animations"
              description="Smooth transitions and arc animations"
            >
              <Toggle value={animationsOn} onChange={setAnimationsOn} />
            </SettingRow>
            <div className="flex justify-end pt-1">
              <SaveButton
                onClick={() => flashSaved(setDisplaySaved)}
                saved={displaySaved}
              />
            </div>
          </SectionCard>

          {/* ── About ── */}
          <div
            className="rounded-2xl p-6"
            style={{ background: P.card, border: `1px solid ${P.dark}33` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${P.dark}22`,
                    border: `1px solid ${P.dark}44`,
                  }}
                >
                  <Globe size={16} style={{ color: P.mid }} />
                </div>
                <div>
                  <p
                    className="font-body font-semibold text-sm"
                    style={{ color: P.light }}
                  >
                    About
                  </p>
                  <p className="font-body text-xs" style={{ color: P.tan }}>
                    App info & data source
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {[
                ["App version", "v1.0.0"],
                ["Weather data", "OpenWeatherMap API"],
                ["Map provider", "CartoDB (Leaflet.js)"],
                ["Built with", "React + Vite + Tailwind CSS"],
              ].map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${P.dark}18` }}
                >
                  <span className="font-body text-xs" style={{ color: P.tan }}>
                    {key}
                  </span>
                  <span
                    className="font-body text-xs font-medium"
                    style={{ color: P.light }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
