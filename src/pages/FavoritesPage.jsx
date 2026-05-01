import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import ReservationModal from "../components/restaurant/ReservationModal";

/* FavoritesPage – grid of saved restaurants */
function FavoritesPage() {
  const { restaurants, toggleFavorite } = useApp();
  const [reserveTarget, setReserveTarget] = useState(null);

  /* fav darsan restaurant uud */
  const favorites = restaurants.filter((r) => r.isFavorite);

  return (
    <>
      <div className="page-wrap">
        {/* Page header */}
        <div className="page-section-hdr">
          <div className="page-section-eyebrow">Миний дуртай газрууд</div>
          <h1 className="page-title">Хадгалсан рестораны</h1>
          <p className="page-subtitle">
            {favorites.length > 0
              ? `${favorites.length} ресторан хадгалагдсан байна`
              : "Одоогоор хадгалсан газар байхгүй байна"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <span className="empty-emoji">🤍</span>
            <p className="empty-title">Хадгалсан газар байхгүй</p>
            <p className="empty-sub">
              Ресторан картны <strong>❤️</strong> товч дарж хадгалаарай.
            </p>
            <Link
              to="/restaurants"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Ресторан харах →
            </Link>
          </div>
        ) : (
          <div className="cards-grid">
            {favorites.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <RestaurantCard
                  restaurant={r}
                  onToggleFavorite={toggleFavorite}
                  onReserve={setReserveTarget}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ReservationModal
        restaurant={reserveTarget}
        isOpen={!!reserveTarget}
        onClose={() => setReserveTarget(null)}
      />
    </>
  );
}

export default FavoritesPage;
