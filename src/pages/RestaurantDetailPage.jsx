import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ReservationModal from "../components/restaurant/ReservationModal";
import ReviewModal from "../components/restaurant/ReviewModal";

/**
 * RestaurantDetailPage – two-column detail view
 *
 * CS142 pattern: functional component, useParams to extract :id,
 * useState for modal visibility. No tabs — single "Тухай" view.
 *
 * Layout (desktop):
 *   Left  (60%) – hero image + about info block (Тухай)
 *   Right (40%) – sticky panel: identity summary + reservation CTA
 *                 + inline review list with "write review" button
 *
 * On mobile: stacks vertically (right panel moves below hero).
 *
 * Note: ReservationModal and ReviewModal are kept exactly as-is
 * per spec — no changes to booking or review logic.
 */

/** Renders n filled stars and (5-n) empty stars */
function StarRow({ rating, size = 14 }) {
  const full  = Math.round(rating);
  const empty = 5 - full;
  return (
    <span style={{ fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
      <span style={{ color: "var(--yellow)" }}>{"★".repeat(full)}</span>
      <span style={{ color: "var(--border)"  }}>{"★".repeat(empty)}</span>
    </span>
  );
}

function RestaurantDetailPage() {
  const { id }                                   = useParams();
  const { restaurants, reviews, toggleFavorite } = useApp();
  const restaurant = restaurants.find((r) => String(r.id) === id);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [reviewOpen,  setReviewOpen]  = useState(false);

  /* ── Not found guard ── */
  if (!restaurant) {
    return (
      <div className="page-wrap">
        <div className="favorites-empty">
          <span className="empty-emoji">😕</span>
          <p className="empty-title">Ресторан олдсонгүй</p>
          <Link to="/restaurants" className="btn btn-primary btn-sm">← Буцах</Link>
        </div>
      </div>
    );
  }

  const reviewList = reviews[restaurant.id] || [];

  /* Average rating from user reviews (falls back to seed rating) */
  const avgRating = reviewList.length > 0
    ? reviewList.reduce((sum, rv) => sum + rv.rating, 0) / reviewList.length
    : restaurant.rating;

  return (
    <>
      <div className="page-wrap detail-page-wrap">

        {/* ── Back link ── */}
        <Link to="/restaurants" className="detail-back-link">
          ← Буцах
        </Link>

        {/* ══ Two-column grid ══ */}
        <div className="detail-two-col">

          {/* ════ LEFT: hero + about ════ */}
          <div className="detail-left">

            {/* Hero */}
            <div className="detail-hero-wrap">
              {restaurant.image
                ? <img className="detail-hero" src={restaurant.image} alt={restaurant.imageAlt} />
                : <div className="detail-hero-placeholder">{restaurant.emoji}</div>
              }
              {/* Floating favourite */}
              <button
                className={`detail-fav-btn${restaurant.isFavorite ? " on" : ""}`}
                onClick={() => toggleFavorite(restaurant.id)}
                aria-label={restaurant.isFavorite ? "Хадгалсанаас хасах" : "Хадгалах"}
              >
                {restaurant.isFavorite ? "❤️" : "🤍"}
              </button>
            </div>

            {/* ── Тухай card ── */}
            <div className="detail-about-card">
              <h2 className="detail-about-title">Тухай</h2>
              <p className="detail-about-desc">{restaurant.description}</p>

              <div className="detail-about-rows">
                <div className="about-row">
                  <span className="about-label">⏰ Цагийн хуваарь</span>
                  <span className="about-value">{restaurant.hours}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">📍 Хаяг</span>
                  <span className="about-value">{restaurant.address}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">💰 Үнийн түвшин</span>
                  <span className="about-value">{restaurant.priceRange}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">🍴 Хоолны төрөл</span>
                  <span className="about-value">{restaurant.tags.join(", ")}</span>
                </div>
                <div className="about-row" style={{ borderBottom: "none" }}>
                  <span className="about-label">🕐 Ажиллагаа</span>
                  <span
                    className="about-value"
                    style={{
                      color: restaurant.isOpen ? "var(--green)" : "var(--text-3)",
                      fontWeight: 600,
                    }}
                  >
                    {restaurant.isOpen ? "● Нээлттэй" : "● Хаалттай"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT: identity + book + reviews ════ */}
          <div className="detail-right">

            {/* Identity summary */}
            <div className="detail-identity-card">
              <h1 className="detail-name">{restaurant.name}</h1>

              <div className="detail-rating-row">
                <StarRow rating={avgRating} size={16} />
                <span className="detail-rating-num">{avgRating.toFixed(1)}</span>
                <span className="detail-review-count">
                  ({reviewList.length > 0 ? reviewList.length : restaurant.reviewCount} үнэлгээ)
                </span>
              </div>

              <div className="detail-info-row">
                <span className={`detail-info-chip${restaurant.isOpen ? " open" : " closed"}`}>
                  ● {restaurant.isOpen ? "Нээлттэй" : "Хаалттай"}
                </span>
                <span className="detail-info-chip">📍 {restaurant.distance} км</span>
                <span className="detail-info-chip">⏱ {restaurant.deliveryTime} мин</span>
                <span className="detail-info-chip">{restaurant.priceRange}</span>
              </div>

              <p className="detail-address">
                <span>📍</span> {restaurant.address}
              </p>
            </div>

            {/* ── Reservation panel ── */}
            <div className="detail-panel">
              <div className="detail-panel-hdr">
                <span className="detail-panel-icon">🪑</span>
                <div>
                  <h3 className="detail-panel-title">Ширээ захиалах</h3>
                  <p className="detail-panel-sub">Урьдчилан захиалж, хоол хүлээх шаардлагагүй.</p>
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: 14, justifyContent: "center" }}
                onClick={() => setReserveOpen(true)}
              >
                🪑 Ширээ захиалах
              </button>
            </div>

            {/* ── Reviews panel ── */}
            <div className="detail-panel">
              <div className="detail-panel-hdr">
                <span className="detail-panel-icon">💬</span>
                <div style={{ flex: 1 }}>
                  <h3 className="detail-panel-title">
                    Сэтгэгдэл
                    {reviewList.length > 0 && (
                      <span className="review-count-badge">{reviewList.length}</span>
                    )}
                  </h3>
                  <p className="detail-panel-sub">Туршлагаа хуваалцаарай.</p>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setReviewOpen(true)}
                >
                  + Бичих
                </button>
              </div>

              {reviewList.length === 0 ? (
                <div className="review-empty-state">
                  <span style={{ fontSize: 32 }}>💬</span>
                  <p>Одоогоор сэтгэгдэл байхгүй.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setReviewOpen(true)}
                  >
                    Анхны сэтгэгдэл бичих
                  </button>
                </div>
              ) : (
                <div className="review-list">
                  {reviewList.map((rv) => (
                    <div key={rv.id} className="review-card anim-fade-up">
                      <div className="review-top">
                        <span className="review-author">{rv.author}</span>
                        <span className="review-stars">
                          {"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}
                        </span>
                      </div>
                      <p className="review-text">{rv.comment}</p>
                      {rv.date && <p className="review-date">{rv.date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>{/* end right */}
        </div>{/* end two-col */}
      </div>

      {/* ── Modals (unchanged) ── */}
      <ReservationModal
        restaurant={restaurant}
        isOpen={reserveOpen}
        onClose={() => setReserveOpen(false)}
      />
      <ReviewModal
        restaurant={restaurant}
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </>
  );
}

export default RestaurantDetailPage;
