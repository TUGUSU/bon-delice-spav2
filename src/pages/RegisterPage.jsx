import React, { useCallback, useEffect, useState } from "react";
import { EyeOff, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LOGIN_REDIRECT_MS = 6000;

function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, addToast } = useApp();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerComplete, setRegisterComplete] = useState(false);

  const goLogin = useCallback(() => {
    navigate("/login", {
      replace: true,
      state: { prefillUsername: String(username || "").trim().toLowerCase() },
    });
  }, [navigate, username]);

  useEffect(() => {
    if (!registerComplete) return undefined;
    const id = window.setTimeout(goLogin, LOGIN_REDIRECT_MS);
    return () => window.clearTimeout(id);
  }, [registerComplete, goLogin]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("Овог нэрээ оруулна уу.", "error");
      return;
    }
    if (!username.trim()) {
      addToast("Хэрэглэгчийн нэрээ оруулна уу.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addToast("Нууц үг таарахгүй байна.", "error");
      return;
    }

    const result = await registerUser({ username, fullName, email, password });
    if (!result.ok) {
      addToast(result.message, "error");
      if (result.status === 409) {
        navigate("/login", {
          replace: true,
          state: { prefillUsername: String(username || "").trim().toLowerCase() },
        });
      }
      return;
    }
    setRegisterComplete(true);
  }

  return (
    <section className="login-page">
      <div className="login-shell register-shell">
        <div className="login-logo-wrap">
          <img src="/images/banners/logo.png" alt="Bon Delice" className="login-logo" />
        </div>

        {registerComplete ? (
          <div className="register-success">
            <h1 className="register-success-title">Бүртгэл авсан</h1>
            <p className="register-success-text">
              Таны бүртгэл амжилттай хүлээн авлаа. Нэвтрэх хуудас руу орж нэвтэрнэ үү.
            </p>
            <button type="button" className="login-submit register-success-cta" onClick={goLogin}>
              Нэвтрэх хэсэг рүү орох
            </button>
            <p className="register-success-hint">
              {Math.round(LOGIN_REDIRECT_MS / 1000)} секундын дараа автоматаар нэвтрэх хуудас руу шилжинэ.
            </p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-field-label">Хэрэглэгчийн нэр</span>
              <div className="login-input-wrap">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Жишээ: delice_user"
                  autoComplete="username"
                />
                <UserRound size={16} />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">Овог, Нэр</span>
              <div className="login-input-wrap">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Овог, Нэр"
                  autoComplete="name"
                />
                <UserRound size={16} />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">И-мэйл (сонголттой)</span>
              <div className="login-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="И-мэйл хаяг"
                  autoComplete="email"
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
                  placeholder="8+ тэмдэгт, том/жижиг, тоо, тусгай"
                  autoComplete="new-password"
                />
                <EyeOff size={16} />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">Нууц үг давтах</span>
              <div className="login-input-wrap">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Нууц үг давтах"
                  autoComplete="new-password"
                />
                <EyeOff size={16} />
              </div>
            </label>

            <button type="submit" className="login-submit">
              Бүртгүүлэх
            </button>
          </form>
        )}

        {!registerComplete ? (
          <p className="login-register">
            Бүртгэлтэй хэрэглэгч? <Link to="/login">Нэвтрэх</Link>
          </p>
        ) : null}
      </div>

      <nav className="login-bottom-nav" aria-label="Доод цэс">
        <Link to="/login" className={`login-bottom-item${registerComplete ? " active" : ""}`}>
          Нэвтрэх
        </Link>
        <Link to="/register" className={`login-bottom-item${registerComplete ? "" : " active"}`}>
          Бүртгүүлэх
        </Link>
      </nav>
    </section>
  );
}

export default RegisterPage;
