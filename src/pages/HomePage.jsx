import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import ReservationModal from "../components/restaurant/ReservationModal";

const BANNERS = [
  { title: "Шилдэг рестораны\nтаны хажууд", sub: "Улаанбаатарын шилдэг 200+ газар", bg: "linear-gradient(135deg,#1c1917,#292524)" },
  { title: "Ширээ захиалаарай\nхялбархан", sub: "2 минутад захиалга хийнэ", bg: "linear-gradient(135deg,#1e1b4b,#312e81)" },
  { title: "Шинэ газрууд\nнэмэгдлээ", sub: "Долоо хоног бүр шинэ сонголт", bg: "linear-gradient(135deg,#14532d,#166534)" },
];

const CATS = [
  { label: "Ресторан", emoji: "🍽️", path: "/restaurants" },
  { label: "Паб & Лоунж", emoji: "🍺", path: "/restaurants?type=pub" },
  { label: "Karaoke", emoji: "🎤", path: "/restaurants?type=karaoke" },
];

function HomePage() {
  const { restaurants, toggleFavorite } = useApp();
  const [slide, setSlide] = useState(0);
  const [reserveTarget, setReserveTarget] = useState(null);

  const popular = useMemo(() => restaurants.filter((r) => r.section === "popular"), [restaurants]);
  const newest = useMemo(() => restaurants.filter((r) => r.section === "new"), [restaurants]);

  return (
    <>
      <div className="page-wrap">
        {/* Hero banner */}
        <div className="home-hero" style={{ background: BANNERS[slide].bg }}>
          <div className="home-hero-content anim-fade-up">
            <h1>{BANNERS[slide].title.split("\\n").map((l, i) => <span key={i} style={{ display: "block" }}>{l}</span>)}</h1>
            <Link to="/restaurants" className="btn btn-primary btn-lg">
              Ресторан хайх →
            </Link>
          </div>
          <div className="hero-dots">
            {BANNERS.map((_, i) => (
              <button key={i} className={`hero-dot${i === slide ? " active" : ""}`} onClick={() => setSlide(i)} />
            ))}
          </div>
        </div>

        {/* Category grid */}
        <div className="cat-grid" style={{ marginBottom: 28 }}>
          <Link to={CATS[0].path} className="cat-card tall">
            <div className="cat-card-emoji" style={{ background: "linear-gradient(135deg,#4a2c0a,#7c3500)" }}>{CATS[0].emoji}</div>
            <div className="cat-card-overlay" />
            <span className="cat-card-label">{CATS[0].label}</span>
          </Link>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CATS.slice(1).map((c) => (
              <Link key={c.label} to={c.path} className="cat-card" style={{ flex: 1 }}>
                <div className="cat-card-emoji" style={{ background: c.emoji === "🍺" ? "linear-gradient(135deg,#1a0a3d,#4a0080)" : "linear-gradient(135deg,#0a1a0a,#1a3a1a)" }}>{c.emoji}</div>
                <div className="cat-card-overlay" />
                <span className="cat-card-label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ marginBottom: 32 }}>
          <div className="stat-box"><span className="stat-num">{restaurants.length}</span><p className="stat-label">Нийт газар</p></div>
          <div className="stat-box"><span className="stat-num">{restaurants.filter((r) => r.isOpen).length}</span><p className="stat-label">Нээлттэй</p></div>
          <div className="stat-box"><span className="stat-num">{restaurants.filter((r) => r.isFavorite).length}</span><p className="stat-label">Хадгалсан</p></div>
          <div className="stat-box"><span className="stat-num">{newest.length}</span><p className="stat-label">Шинэ газар</p></div>
        </div>

        {/* Popular */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Түгээмэл ресторанууд</h2>
            <Link to="/restaurants" className="btn btn-ghost btn-sm">Бүгдийг харах →</Link>
          </div>
          <div className="cards-grid">
            {popular.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <RestaurantCard restaurant={r} onToggleFavorite={toggleFavorite} onReserve={setReserveTarget} />
              </div>
            ))}
          </div>
        </div>

        {/* New */}
        {newest.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 className="section-title" style={{ margin: 0 }}>Сүүлд нэмэгдсэн</h2>
              <Link to="/restaurants" className="btn btn-ghost btn-sm">Бүгдийг харах →</Link>
            </div>
            <div className="cards-grid">
              {newest.map((r, i) => (
                <div key={r.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <RestaurantCard restaurant={r} onToggleFavorite={toggleFavorite} onReserve={setReserveTarget} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ReservationModal restaurant={reserveTarget} isOpen={!!reserveTarget} onClose={() => setReserveTarget(null)} />
    </>
  );
}

export default HomePage;
