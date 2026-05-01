import React, { useState } from "react";
import Modal from "../common/Modal";
import { useApp } from "../../context/AppContext";

/** ReservationModal – 3-step reservation flow*/

const TIMES = [
  "11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

const STEPS = ["Огноо & Цаг", "Зочин", "Баталгаажуулах"];

function ReservationModal({ restaurant, isOpen, onClose }) {
  const { createOrder, addToast } = useApp();

  /* Form state */
  const [step,   setStep]   = useState(0);
  const [date,   setDate]   = useState("");
  const [time,   setTime]   = useState("");
  const [people, setPeople] = useState(2);
  const [note,   setNote]   = useState("");
  const [done,   setDone]   = useState(false);

  function reset() {
    setStep(0); setDate(""); setTime("");
    setPeople(2); setNote(""); setDone(false);
  }

  function handleClose() { reset(); onClose(); }

  function handleNext() { if (step < 2) setStep((s) => s + 1); }
  function handleBack() { if (step > 0) setStep((s) => s - 1); }

  function handleConfirm() {
    createOrder({
      venueId:   restaurant.id,
      venueName: restaurant.name,
      venueImg:  restaurant.emoji,
      date, time, people, note,
    });
    addToast(`${restaurant.name} ширээ амжилттай захиалагдлаа! 🎉`, "success");
    setDone(true);
  }

  /* Today's date as min */
  const today = new Date().toISOString().split("T")[0];

  /* Can proceed? */
  const canNext0 = date && time;
  const canNext1 = people >= 1;

  if (!restaurant) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ширээ захиалах">
      {done ? (
        /* Confirmed state */
        <div className="res-confirmed anim-scale-in">
          <div className="check-icon">🎉</div>
          <h3>Баталгаажсан!</h3>
          <p>{restaurant.name}-д ширээ амжилттай захиалагдлаа.</p>

          <div className="res-info-card">
            <div className="res-info-row">
              <span className="res-info-label">Газар</span>
              <span className="res-info-val">{restaurant.name}</span>
            </div>
            <div className="res-info-row">
              <span className="res-info-label">Огноо</span>
              <span className="res-info-val">{date}</span>
            </div>
            <div className="res-info-row">
              <span className="res-info-label">Цаг</span>
              <span className="res-info-val">{time}</span>
            </div>
            <div className="res-info-row">
              <span className="res-info-label">Зочин</span>
              <span className="res-info-val">{people} хүн</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleClose}>
              Хаах
            </button>
            <a href="#/orders" className="btn btn-primary" style={{ flex: 1 }} onClick={handleClose}>
              Захиалга харах
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Step progress bar */}
          <div className="step-bar" style={{ marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <div key={i} className={`step-dot${i <= step ? " done" : ""}`} />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
            Алхам {step + 1} / {STEPS.length} — <strong>{STEPS[step]}</strong>
          </p>

          {/* Step 0: Date & Time */}
          {step === 0 && (
            <div className="anim-fade-up">
              <div className="form-group">
                <label className="form-label">📅 Огноо</label>
                <input
                  type="date"
                  className="form-input"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">🕐 Цаг сонгох</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`btn btn-sm${time === t ? " btn-primary" : " btn-outline"}`}
                      onClick={() => setTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 8 }}
                disabled={!canNext0}
                onClick={handleNext}
              >
                Үргэлжлэх →
              </button>
            </div>
          )}

          {/* Step 1: People & Note */}
          {step === 1 && (
            <div className="anim-fade-up">
              <div className="form-group">
                <label className="form-label">👥 Зочдын тоо</label>
                <div className="people-picker">
                  <button
                    type="button"
                    className="people-btn"
                    onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  >−</button>
                  <span className="people-num">{people}</span>
                  <button
                    type="button"
                    className="people-btn"
                    onClick={() => setPeople((p) => Math.min(20, p + 1))}
                  >+</button>
                  <span style={{ fontSize: 13, color: "var(--text-3)", marginLeft: 4 }}>хүн</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"> Тэмдэглэл (заавал биш)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Тусгай хүсэлт, тэмдэглэл..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleBack}>
                  ← Буцах
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={!canNext1}
                  onClick={handleNext}
                >
                  Үргэлжлэх →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="anim-fade-up">
              <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
                Мэдээллээ шалгаад баталгаажуулна уу.
              </p>
              <div className="res-info-card">
                <div className="res-info-row">
                  <span className="res-info-label">🏠 Газар</span>
                  <span className="res-info-val">{restaurant.name}</span>
                </div>
                <div className="res-info-row">
                  <span className="res-info-label">📅 Огноо</span>
                  <span className="res-info-val">{date}</span>
                </div>
                <div className="res-info-row">
                  <span className="res-info-label">🕐 Цаг</span>
                  <span className="res-info-val">{time}</span>
                </div>
                <div className="res-info-row">
                  <span className="res-info-label">👥 Зочин</span>
                  <span className="res-info-val">{people} хүн</span>
                </div>
                {note && (
                  <div className="res-info-row">
                    <span className="res-info-label">📝 Тэмдэглэл</span>
                    <span className="res-info-val">{note}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleBack}>
                  ← Буцах
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={handleConfirm}
                >
                  ✓ Баталгаажуулах
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export default ReservationModal;
