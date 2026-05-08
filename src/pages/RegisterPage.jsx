import React, { useState } from "react";
import { EyeOff, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, addToast } = useApp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("Овог нэрээ оруулна уу.", "error");
      return;
    }
    if (password !== confirmPassword) {
      addToast("Нууц үг таарахгүй байна.", "error");
      return;
    }
    if (password.length < 6) {
      addToast("Нууц үг хамгийн багадаа 6 тэмдэгт байна.", "error");
      return;
    }

    const result = registerUser({ fullName, email, password });
    if (!result.ok) {
      addToast(result.message, "error");
      return;
    }
    addToast("Бүртгэл амжилттай үүслээ.", "success");
    navigate("/home");
  }

  return (
    <section className="login-page">
      <div className="login-shell register-shell">
        <div className="login-logo-wrap">
          <img src="/images/banners/logo.png" alt="Bon Delice" className="login-logo" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
            <span className="login-field-label">И-мэйл хаяг</span>
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
                placeholder="Нууц үг"
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

        <p className="login-register">
          Бүртгэлтэй хэрэглэгч? <Link to="/login">Нэвтрэх</Link>
        </p>
      </div>

      <nav className="login-bottom-nav" aria-label="Доод цэс">
        <Link to="/login" className="login-bottom-item">
          Нэвтрэх
        </Link>
        <Link to="/register" className="login-bottom-item active">
          Профайл
        </Link>
      </nav>
    </section>
  );
}

export default RegisterPage;
