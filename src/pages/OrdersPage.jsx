import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Modal from "../components/common/Modal";

/** OrdersPage – table reservation tvvh bolon tsag oorchloh bolon tsutslah*/

const TIMES = [
  "11:00","12:00","13:00","14:00","15:00",
  "16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];

function OrdersPage() {
  const { orders, cancelOrder, updateOrder, addToast } = useApp();

  /* Edit modal state */
  const [editTarget, setEditTarget] = useState(null);
  const [editDate,   setEditDate]   = useState("");
  const [editTime,   setEditTime]   = useState("");

  const upcoming  = orders.filter((o) => o.status === "confirmed");
  const history   = orders.filter((o) => o.status === "cancelled");

  function openEdit(order) {
    setEditTarget(order);
    setEditDate(order.date);
    setEditTime(order.time);
  }

  async function handleEditSave() {
    if (!editDate || !editTime) return;
    try {
      await updateOrder(editTarget.id, { date: editDate, time: editTime });
      addToast("Захиалга амжилттай шинэчлэгдлээ", "info");
      setEditTarget(null);
    } catch (err) {
      addToast(err.message || "Өөрчлөлт хадгалагдсангүй.", "error");
    }
  }

  async function handleCancel(id) {
    try {
      await cancelOrder(id);
      addToast("Захиалга цуцлагдлаа.", "error");
    } catch (err) {
      addToast(err.message || "Цуцлаж чадсангүй.", "error");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="page-wrap">
      {/* Page header */}
      <div className="page-section-hdr">
        <div className="page-section-eyebrow">Ширээний захиалга</div>
        <h1 className="page-title">Миний захиалгууд</h1>
        <p className="page-subtitle">
          {upcoming.length > 0
            ? `${upcoming.length} идэвхтэй захиалга`
            : "Идэвхтэй захиалга байхгүй"}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <span className="empty-emoji"></span>
          <p className="empty-title">Захиалга байхгүй байна</p>
          <p className="empty-sub">Ресторан дээр "Ширээ захиалах" товч дарна уу.</p>
          <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: 16 }}>
            Ресторан харах →
          </Link>
        </div>
      ) : (
        <>
          {/* ── Upcoming / confirmed ── */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                Удахгүй болох захиалга
              </h2>
              <div className="orders-list">
                {upcoming.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onEdit={() => openEdit(o)}
                    onCancel={() => handleCancel(o.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Cancelled history ── */}
          {history.length > 0 && (
            <section>
              <h2 className="section-title" style={{ color: "var(--text-3)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-4)", display: "inline-block" }} />
                Цуцлагдсан захиалга
              </h2>
              <div className="orders-list">
                {history.map((o) => (
                  <OrderCard key={o.id} order={o} isCancelled />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Edit modal ── */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Захиалга өөрчлөх"
      >
        {editTarget && (
          <div>
            <div className="res-info-card" style={{ marginBottom: 20 }}>
              <div className="res-info-row">
                <span className="res-info-label">Газар</span>
                <span className="res-info-val">{editTarget.venueImg} {editTarget.venueName}</span>
              </div>
              <div className="res-info-row">
                <span className="res-info-label">Одоогийн цаг</span>
                <span className="res-info-val">{editTarget.date} · {editTarget.time}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"> Шинэ огноо</label>
              <input
                type="date"
                className="form-input"
                min={today}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label"> Шинэ цаг</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm${editTime === t ? " btn-primary" : " btn-outline"}`}
                    onClick={() => setEditTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditTarget(null)}>
                Болих
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={!editDate || !editTime}
                onClick={handleEditSave}
              >
                Хадгалах
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── OrderCard sub-component ── */
function OrderCard({ order, onEdit, onCancel, isCancelled }) {
  return (
    <div className={`order-card${isCancelled ? " order-card-cancelled" : ""}`}>
      <div className="order-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{order.venueImg}</span>
          <div>
            <p className="order-name">{order.venueName}</p>
            <p style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>
              Захиалсан: {order.createdAt}
            </p>
          </div>
        </div>
        <span className={`order-status-pill${isCancelled ? " cancelled" : ""}`}>
          {isCancelled ? "Цуцлагдсан" : "✓ Баталгаажсан"}
        </span>
      </div>

      <div className="order-meta">
        <span className="order-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: .5 }}>
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
          </svg>
          {order.date || "—"}
        </span>
        <span className="order-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: .5 }}>
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
          {order.time || "—"}
        </span>
        <span className="order-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: .5 }}>
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          {order.people} хүн
        </span>
        {order.note && (
          <span className="order-meta-item" style={{ color: "var(--text-2)" }}>
             {order.note}
          </span>
        )}
      </div>

      {!isCancelled && (
        <div className="order-actions">
          <button className="btn btn-outline btn-sm" onClick={onEdit}>
             Цаг өөрчлөх
          </button>
          <button
            className="btn btn-sm"
            style={{ background: "#fef2f2", color: "var(--red)", border: "1.5px solid #fee2e2" }}
            onClick={onCancel}
          >
            ✕ Цуцлах
          </button>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
