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

        {/* ══ Title ══ */}
        <h1 className="detail-name detail-name-heading">{restaurant.name}</h1>

        {/* ══ Rating Row ══ */}
        <div className="detail-rating-wrap">
          <StarRow rating={avgRating} size={18} />
          <span className="detail-rating-value">{avgRating.toFixed(1)}</span>
          <span className="detail-review-count">
            ({reviewList.length > 0 ? reviewList.length : restaurant.reviewCount} үнэлгээ)
          </span>
          {restaurant.tags && restaurant.tags.map((tag, idx) => (
            <span key={idx}>
              #{tag}
            </span>
          ))}
        </div>

        {/* ══ Hero Image Section ══ */}
        <div className="detail-hero-image">
          {restaurant.image
            ? <img src={restaurant.image} alt={restaurant.imageAlt} />
            : <div className="detail-hero-placeholder">{restaurant.emoji}</div>
          }
        </div>

        {/* ══ Restaurant Card Section ══ */}
        <div className="detail-card">
          {/* LEFT: Profile Picture */}
          <div className="detail-card-profile">
            {restaurant.emoji}
          </div>

          {/* MIDDLE: Name Only */}
          <h2 className="detail-card-name">{restaurant.name}</h2>

          {/* RIGHT: Buttons */}
          <div className="detail-card-buttons">
            <button
              className="btn btn-primary detail-card-btn-reserve"
              onClick={() => setReserveOpen(true)}
            >
              🪑 ШИРЭЭ ЗАХИАЛАХ
            </button>
            <button
              className="btn btn-outline btn-save detail-card-btn-save"
              onClick={() => toggleFavorite(restaurant.id)}
              aria-label={restaurant.isFavorite ? "Хадгалсанаас хасах" : "Хадгалах"}
            >
              {restaurant.isFavorite ? "❤️ ХАДГАЛСАН" : "🤍 ХАДГАЛАХ"}
            </button>
          </div>
        </div>

        {/* ══ Info Grid: Address, Phone, Hours ══ */}
        <div className="detail-info-grid">
          {/* Address */}
          <div className="detail-info-item">
            <h4>📍 Хаяг</h4>
            <p>{restaurant.address}</p>
          </div>

          {/* Phone */}
          <div className="detail-info-item">
            <h4>📞 Утас</h4>
            <p>{restaurant.phone}</p>
          </div>

          {/* Hours */}
          <div className="detail-info-item">
            <h4>🕐 Ажиллах цаг</h4>
            <p>
              {restaurant.isOpen ? (
                <span className="detail-status-open">Нээлттэй</span>
              ) : (
                <span className="detail-status-closed">Хаалттай</span>
              )}
              {" • " + restaurant.hours}
            </p>
          </div>
        </div>

        {/* ══ About Section ══ */}
        <div className="detail-section">
          <h2 className="detail-section-title">Дэлгэрэнгүй</h2>
          <p className="detail-section-text">
            {restaurant.description}
          </p>
        </div>
{/* ══ Location Section with Map ══ */}
        {restaurant.mapEmbed && (
          <div className="detail-location-wrap">
            <h2 className="detail-section-title">Байршил</h2>
            <iframe
              className="detail-map"
              loading="lazy"
              src={restaurant.mapEmbed}
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
        {/* ══ Reviews Section ══ */}
        <div className="detail-reviews-wrap">
          <div className="detail-reviews-header">
            <h2 className="detail-reviews-title">
              Сэтгэгдэл ({reviewList.length > 0 ? reviewList.length : 0})
            </h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setReviewOpen(true)}
            >
              + Сэтгэгдэл бичих
            </button>
          </div>

          {reviewList.length === 0 ? (
            <div className="detail-reviews-empty">
              <span className="detail-reviews-empty-icon">💬</span>
              <p className="detail-reviews-empty-text">Одоогоор сэтгэгдэл байхгүй.</p>
            </div>
          ) : (
            <div className="detail-review-list">
              {reviewList.map((rv) => (
                <div key={rv.id} className="detail-review-card anim-fade-up">
                  <div className="detail-review-top">
                    <span className="detail-review-author">{rv.author}</span>
                    <span className="detail-review-stars">
                      {"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}
                    </span>
                  </div>
                  <p className="detail-review-text">{rv.comment}</p>
                  {rv.date && <p className="detail-review-date">{rv.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        

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
