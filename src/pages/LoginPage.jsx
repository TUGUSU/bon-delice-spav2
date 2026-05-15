import React, { useEffect, useState } from "react";
import { EyeOff, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import DemoAuthBanner from "../components/auth/DemoAuthBanner";
import { DEMO_CREDENTIALS } from "../auth/demoAuth";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, addToast, isDemoAuth } = useApp();
  const [username, setUsername] = useState(
    () => location.state?.prefillUsername || ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const prefillUsername = location.state?.prefillUsername;
  useEffect(() => {
    if (typeof prefillUsername !== "string") return;
    const next = prefillUsername.trim().toLowerCase();
    if (!next) return;
    setUsername(next);
  }, [prefillUsername]);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await loginUser({ username, password });
    if (!result.ok) {
      addToast(result.message, "error");
      return;
    }
    if (rememberMe) {
      addToast("Амжилттай нэвтэрлээ. Таныг саналаа.", "success");
    } else {
      addToast("Амжилттай нэвтэрлээ.", "success");
    }
    navigate("/home");
  }

  async function quickDemoLogin(cred) {
    const result = await loginUser({
      username: cred.username,
      password: cred.password,
    });
    if (!result.ok) {
      addToast(result.message, "error");
      return;
    }
    addToast(`Demo: ${cred.username} нэвтэрлээ.`, "success");
    navigate("/home");
  }

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-logo-wrap">
          <img src="/images/banners/logo.png" alt="Bon Delice" className="login-logo" />
        </div>

        {isDemoAuth ? <DemoAuthBanner /> : null}

        {isDemoAuth ? (
          <div className="demo-auth-quick">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.username}
                type="button"
                className="demo-auth-quick-btn"
                onClick={() => quickDemoLogin(cred)}
              >
                {cred.label}: {cred.username}
              </button>
            ))}
          </div>
        ) : null}

        <div className="login-social">
          <button type="button" className="login-social-btn">
            <span className="login-social-icon">f</span>
            <span>Facebook</span>
          </button>
          <button type="button" className="login-social-btn">
            <span className="login-social-icon login-social-icon-google">G</span>
            <span>Google</span>
          </button>
        </div>

        <p className="login-helper">Хэрэглэгчийн нэрээр нэвтрэх</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field-label">Хэрэглэгчийн нэр</span>
            <div className="login-input-wrap">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Хэрэглэгчийн нэр"
                autoComplete="username"
              />
              <UserRound size={16} />
            </div>
          </label>

          <label className="login-field">
            <span className="login-field-label">Нууц үг</span>
            <div className="login-input-wrap">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Нууц үг"
                autoComplete="current-password"
              />
              <EyeOff size={16} />
            </div>
          </label>

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Намайг сана</span>
            </label>

            <Link className="login-forgot" to="/login">
              Нууц үгээ мартсан уу?
            </Link>
          </div>

          <button type="submit" className="login-submit">
            Нэвтрэх
          </button>
        </form>

        <p className="login-register">
          Шинэ хэрэглэгч? <Link to="/register">Бүртгүүлэх</Link>
        </p>
      </div>

      <nav className="login-bottom-nav" aria-label="Доод цэс">
        <Link to="/login" className="login-bottom-item active">
          Нэвтрэх
        </Link>
        <Link to="/register" className="login-bottom-item">
          Бүртгүүлэх
        </Link>
      </nav>
    </section>
  );
}

export default LoginPage;
