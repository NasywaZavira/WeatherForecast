import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WeatherIcon from "../components/WeatherIcon";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setUser({ username });
    navigate("/dashboard", { replace: true });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#080704" }}
    >
      <div
        className="rounded-2xl overflow-hidden flex w-full max-w-2xl shadow-2xl"
        style={{ background: "#0f1f0f", border: "1px solid #347E3A22" }}
      >
        {/* Left */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
          <WeatherIcon />
          <div className="text-center mt-2">
            <h2
              className="font-body font-bold text-lg"
              style={{ color: "#F3EEE3" }}
            >
              Welcome Back!
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: "#D3BE94" }}>
              Log in to continue to
              <br />
              your weather dashboard.
            </p>
          </div>
        </div>
        {/* Right */}
        <div className="flex-1 p-10">
          <h1
            className="font-body font-light text-3xl mb-6"
            style={{ color: "#F3EEE3" }}
          >
            Log In
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm" style={{ color: "#D3BE94" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CoolUsername123"
                className="rounded-lg px-4 py-3 font-body text-sm outline-none"
                style={{ background: "#FFFFFF", color: "#080704" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-body text-sm" style={{ color: "#D3BE94" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-lg px-4 py-3 font-body text-sm outline-none"
                style={{ background: "#FFFFFF", color: "#080704" }}
              />
            </div>
            {error && (
              <p className="font-body text-xs" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="font-body font-medium py-3 rounded-full mt-2 transition-all"
              style={{ background: "#D3BE94", color: "#080704" }}
            >
              Log In
            </button>
            <p
              className="text-center text-sm font-body"
              style={{ color: "#D3BE94" }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ color: "#56B988" }}
                className="hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
