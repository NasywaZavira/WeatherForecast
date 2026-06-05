import { Link, useLocation } from "react-router-dom";
import { Home, BarChart2, MapPin, Settings, ChevronDown, PanelLeftClose } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Forecast", icon: BarChart2, path: "/forecast" },
  { label: "Location", icon: MapPin, path: "/location" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

// onToggle 
export default function Sidebar({ onToggle }) {
  const location = useLocation();
  const { user } = useAuth();

  const activePath = location.pathname;

  return (
    <aside
      className="w-[240px] h-full flex flex-col py-7 px-5 shrink-0"
      style={{
        background: "#080704",
        borderRight: "1px solid rgba(52,126,58,0.13)",
      }}
    >
      {/* Logo + tombol tutup */}
      <div className="mb-8 flex items-start justify-between">
        <h1 className="font-display text-3xl leading-tight tracking-tight">
          <span className="block" style={{ color: "#D3BE94" }}>WEATHER</span>
          <span className="block" style={{ color: "#56B988" }}>FORECAST</span>
        </h1>

        {/* Tombol slide out */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "#D3BE94" }}
            title="Tutup sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = activePath === path;
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-[24px] font-body font-medium text-sm transition-all ${active ? "shadow-[0_0px_0px_rgba(0,0,0,0)]" : ""}`}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(90deg, rgba(211,190,148,0.25) 0%, rgba(211,190,148,0.12) 100%)",
                      color: "#F3EEE3",
                    }
                  : { color: "#D3BE94" }
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="mt-auto">
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-[28px]"
          style={{
            background: "rgba(52,126,58,0.17)",
            border: "1px solid rgba(86,185,136,0.18)",
          }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#56B988", color: "#080704" }}
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-sm truncate" style={{ color: "#F3EEE3" }}>
              {user?.username || "CoolUsername123"}
            </p>
            <p className="font-body text-xs truncate" style={{ color: "#56B988" }}>
              @{user?.username?.toLowerCase() || "coolusername123"}
            </p>
          </div>
          <ChevronDown size={16} color="#D3BE94" />
        </div>
      </div>
    </aside>
  );
}