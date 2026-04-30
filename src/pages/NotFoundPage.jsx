import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page-wrap">
      <div className="favorites-empty" style={{ paddingTop: 80 }}>
        <span className="empty-emoji">🍽️</span>
        <p className="empty-title">404 — Хуудас олдсонгүй</p>
        <p className="empty-sub">Та хайж буй хуудас байхгүй байна.</p>
        <Link to="/home" className="btn btn-primary" style={{ marginTop: 8 }}>
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
