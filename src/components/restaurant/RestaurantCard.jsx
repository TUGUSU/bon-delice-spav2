import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * RestaurantCard – interactive card that navigates to detail on click
 *
 * CS142 pattern: functional component, props-driven with callbacks.
 * useNavigate for programmatic navigation — the entire card surface is
 * clickable via onClick on the <article>, while action buttons use
 * stopPropagation so they don't also trigger card navigation.
 */
function RestaurantCard({ restaurant: r, onToggleFavorite, onReserve }) {
  const navigate = useNavigate();

  function goToDetail() {
    navigate(`/restaurants/${r.id}`);
  }

  function handleReserve(e) {
    e.stopPropagation();
    onReserve(r);
  }

  function handleFav(e) {
    e.stopPropagation();
    onToggleFavorite(r.id);
  }

  const starsFilled = Math.round(r.rating);

  return (
    <article
      className="rcard"
      onClick={goToDetail}
      role="button"
      tabIndex={0}
      aria-label={`${r.name} дэлгэрэнгүй харах`}
      onKeyDown={(e) => e.key === "Enter" && goToDetail()}
    >
      {/* ── Image area ── */}
      <div className="rcard-img-wrap">
        {r.image
          ? <img className="rcard-img" src={r.image} alt={r.imageAlt} />
          : <div className="rcard-img-placeholder">{r.emoji}</div>
        }

        {/* Favourite toggle */}
        <button
          className={`rcard-fav${r.isFavorite ? " on" : ""}`}
          onClick={handleFav}
          aria-label={r.isFavorite ? "Хадгалсанаас хасах" : "Хадгалах"}
        >
          {r.isFavorite ? "❤️" : "🤍"}
        </button>

        {/* Open / closed badge */}
        <span className={`rcard-badge ${r.isOpen ? "badge-open" : "badge-closed"}`}>
          {r.isOpen ? "● Нээлттэй" : "● Хаалттай"}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="rcard-body">
        <p className="rcard-name">{r.name}</p>

        {/* Meta row */}
        <div className="rcard-meta">
          <span className="rcard-rating">
            <span className="star">★</span>
            {r.rating.toFixed(1)}
            <span style={{ fontWeight: 400, color: "var(--text-3)" }}>
              &nbsp;({r.reviewCount})
            </span>
          </span>
          <span>·</span>
          <span>📍 {r.distance} км</span>
          <span>·</span>
          <span>⏱ {r.deliveryTime} мин</span>
          <span>·</span>
          <span>{r.priceRange}</span>
        </div>

        {/* Tags */}
        <div className="rcard-tags">
          {r.tags.map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
        </div>

        {/* Description */}
        <p className="rcard-desc">{r.description}</p>

        {/* Actions — stopPropagation so card click doesn't fire */}
        <div className="rcard-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleReserve}
          >
            🪑 Ширээ захиалах
          </button>
          <button
            className={`btn btn-sm${r.isFavorite ? " btn-fav-on" : " btn-ghost"}`}
            onClick={handleFav}
            aria-label="Хадгалах"
          >
            {r.isFavorite ? "❤️ Хадгалсан" : "🤍 Хадгалах"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
