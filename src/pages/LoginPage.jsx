import React, { useState } from "react";
import { EyeOff, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, getDemoAuthenticatorCode, addToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");
  const [authStep, setAuthStep] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const result = loginUser({ email, password, authenticatorCode });
    if (!result.ok) {
      if (result.requiresAuthenticator) {
        setAuthStep(true);
        addToast("Authenticator кодоо оруулна уу.", "info");
        const code = getDemoAuthenticatorCode(email);
        if (code) {
          window.alert(`Demo Authenticator код: ${code}`);
        }
        return;
      }
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

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-logo-wrap">
          <img src="/images/banners/logo.png" alt="Bon Delice" className="login-logo" />
        </div>

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

        <p className="login-helper">Цахим хаягаар нэвтрэх үү?</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field-label">И-мэйл</span>
            <div className="login-input-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="И-мэйл"
                autoComplete="email"
                disabled={authStep}
              />
              <Mail size={16} />
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
                disabled={authStep}
              />
              <EyeOff size={16} />
            </div>
          </label>

          {authStep && (
            <label className="login-field">
              <span className="login-field-label">Authenticator код</span>
              <div className="login-input-wrap">
                <input
                  type="text"
                  value={authenticatorCode}
                  onChange={(e) => setAuthenticatorCode(e.target.value)}
                  placeholder="6 оронтой код"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            </label>
          )}

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Намайг сана</span>
            </label>

            {!authStep ? (
              <Link className="login-forgot" to="/login">
                Нууц үгээ мартсан уу?
              </Link>
            ) : (
              <button
                type="button"
                className="login-forgot"
                onClick={() => {
                  const code = getDemoAuthenticatorCode(email);
                  if (!code) {
                    addToast("Энэ и-мэйлээр хэрэглэгч олдсонгүй.", "error");
                    return;
                  }
                  window.alert(`Demo Authenticator код: ${code}`);
                }}
              >
                Demo код харах
              </button>
            )}
          </div>

          <button type="submit" className="login-submit">
            {authStep ? "Кодоор баталгаажуулж нэвтрэх" : "Нэвтрэх"}
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
          Профайл
        </Link>
      </nav>
    </section>
  );
}

export default LoginPage;
