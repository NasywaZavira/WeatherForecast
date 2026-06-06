import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRegister } from "../service/apiService";
import WeatherIcon from "../components/WeatherIcon";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await apiRegister({ username, email, password });
      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestLogin() {
    setUser({ username: "Guest", isGuest: true });
    navigate("/dashboard", { replace: true });
  }

  const inputCls = "rounded-lg px-4 py-2.5 font-body text-sm outline-none";

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
              className="font-body font-bold text-xl"
              style={{ color: "#F3EEE3" }}
            >
              Welcome!
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: "#D3BE94" }}>
              Sign up to get started with
              <br />
              your personalized experience.
            </p>
          </div>
        </div>
        {/* Right */}
        <div className="flex-1 p-10">
          <h1
            className="font-body font-light text-3xl mb-5"
            style={{ color: "#F3EEE3" }}
          >
            Sign Up
          </h1>
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            {[
              {
                label: "Username",
                type: "text",
                val: username,
                set: setUsername,
                ph: "CoolUsername123",
              },
              {
                label: "E-mail",
                type: "email",
                val: email,
                set: setEmail,
                ph: "thisisalegitemail@gmail.com",
              },
              {
                label: "Password",
                type: "password",
                val: password,
                set: setPassword,
                ph: "••••••••",
              },
              {
                label: "Confirm Password",
                type: "password",
                val: confirm,
                set: setConfirm,
                ph: "••••••••",
              },
            ].map(({ label, type, val, set, ph }) => (
              <div key={label} className="flex flex-col gap-1">
                <label
                  className="font-body text-sm"
                  style={{ color: "#D3BE94" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  className={inputCls}
                  style={{ background: "#FFFFFF", color: "#080704" }}
                />
              </div>
            ))}

            {error && (
              <p className="font-body text-xs" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="font-body font-medium py-3 rounded-full mt-1 transition-all"
              style={{ background: "#D3BE94", color: "#080704" }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="font-body font-medium py-3 rounded-full transition-all border"
              style={{
                color: "#D3BE94",
                borderColor: "#D3BE94",
                background: "transparent",
              }}
            >
              Continue as Guest
            </button>
            <p
              className="text-center text-sm font-body"
              style={{ color: "#D3BE94" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "#56B988" }}
                className="hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
