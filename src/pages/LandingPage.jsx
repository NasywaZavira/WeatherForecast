import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen stars-bg flex items-center justify-center"
      style={{ background: "#080704" }}
    >
      <div className="text-center">
        <h1 className="font-display text-8xl leading-none mb-2">
          <span style={{ color: "#D3BE94" }}>WEATHER</span>
          <br />
          <span style={{ color: "#56B988" }}>FORECAST</span>
        </h1>
        <div className="flex gap-6 justify-center mt-10">
          <button
            onClick={() => navigate("/login")}
            className="font-body font-bold px-10 py-3 rounded-lg text-sm tracking-widest uppercase transition-all"
            style={{ background: "#347E3A", color: "#F3EEE3" }}
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="font-body font-bold px-10 py-3 rounded-lg text-sm tracking-widest uppercase transition-all"
            style={{ background: "#347E3A", color: "#F3EEE3" }}
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}
