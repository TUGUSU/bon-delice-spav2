import React, { useEffect, useState } from "react";
import { Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, addToast } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("Овог, нэрээ оруулна уу.", "error");
      return;
    }
    const result = await updateProfile({ fullName, email });
    if (!result.ok) {
      addToast(result.message, "error");
      return;
    }
    addToast("Профайл амжилттай хадгалагдлаа.", "success");
  }

  return (
    <div className="page-wrap profile-page">
      <button className="profile-back-btn" onClick={() => navigate(-1)} aria-label="Буцах">
        ←
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>IMG</span>
          </div>
          <div className="profile-header-text">
            <div className="profile-name">{currentUser.fullName || "Хэрэглэгч"}</div>
            <div className="profile-email">
              @{currentUser.username}
              {currentUser.email ? ` · ${currentUser.email}` : ""}
            </div>
          </div>
          <button className="profile-settings-btn" aria-label="Тохиргоо">
            ⚙
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field-label">Овог, нэр</span>
            <div className="login-input-wrap">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Овог, нэр"
              />
              <UserRound size={16} />
            </div>
          </label>

          <label className="login-field">
            <span className="login-field-label">И-мэйл</span>
            <div className="login-input-wrap">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="И-мэйл"
              />
              <Mail size={16} />
            </div>
          </label>

          <button type="submit" className="login-submit profile-save-btn">
            Хадгалах
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
