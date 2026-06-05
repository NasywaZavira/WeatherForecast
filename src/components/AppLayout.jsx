import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080704" }}>

      <div
        className="h-screen shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: open ? "240px" : "0px" }}
      >
        <div style={{ width: "240px" }} className="h-full">
          <Sidebar onToggle={() => setOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="absolute top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{
              background: "rgba(52,126,58,0.25)",
              border: "1px solid rgba(86,185,136,0.3)",
              color: "#D3BE94",
            }}
            title="Buka sidebar"
          >
            {/* Hamburger icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect y="3"  width="18" height="2" rx="1" fill="currentColor" />
              <rect y="8"  width="18" height="2" rx="1" fill="currentColor" />
              <rect y="13" width="18" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}