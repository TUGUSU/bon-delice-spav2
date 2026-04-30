import React, { useState } from "react";
import Modal from "../common/Modal";
import { useApp } from "../../context/AppContext";

/**
 * ReviewModal – write a review with star rating
 * CS142: functional component, controlled form state
 */
function ReviewModal({ restaurant, isOpen, onClose }) {
  const { addReview, addToast } = useApp();
  const [author,  setAuthor]  = useState("");
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [hover,   setHover]   = useState(0);

  function reset() { setAuthor(""); setRating(5); setComment(""); setHover(0); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;
    addReview(restaurant.id, {
      author: author.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("mn-MN"),
    });
    addToast("Сэтгэгдэл амжилттай нэмэгдлээ! 💬", "success");
    reset();
    onClose();
  }

  if (!restaurant) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title="Сэтгэгдэл бичих">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">👤 Нэр</label>
          <input
            type="text"
            className="form-input"
            placeholder="Таны нэр"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">⭐ Үнэлгээ</label>
          <div style={{ display: "flex", gap: 6, fontSize: 28 }}>
            {[1,2,3,4,5].map((n) => (
              <span
                key={n}
                style={{
                  cursor: "pointer",
                  color: n <= (hover || rating) ? "var(--yellow)" : "var(--border)",
                  transition: "color .12s",
                }}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
              >★</span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">💬 Сэтгэгдэл</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Таны туршлага, санал..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={!author.trim() || !comment.trim()}
        >
          Хадгалах
        </button>
      </form>
    </Modal>
  );
}

export default ReviewModal;
