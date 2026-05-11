import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "../api/restaurantApi";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /* =============================
     RESTAURANTS (API)
  ============================== */
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.getRestaurants({ limit: 100 });
        const normalized = res.data.map((r) => ({
          ...r,
          id: r._id,
          isFavorite: false,
        }));
        setRestaurants(normalized);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* =============================
     LOCAL STATES
  ============================== */
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});
  const [toasts, setToasts] = useState([]);

  /* =============================
     AUTH SYSTEM (teammate)
  ============================== */
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem("bon_delice_users") || "[]");
      const savedCurrentUser = JSON.parse(
        localStorage.getItem("bon_delice_current_user") || "null"
      );
      if (Array.isArray(savedUsers)) setUsers(savedUsers);
      if (savedCurrentUser) setCurrentUser(savedCurrentUser);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("bon_delice_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("bon_delice_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  /* =============================
     TOAST
  ============================== */
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  /* =============================
     FAVORITES
  ============================== */
  const toggleFavorite = useCallback((id) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }, []);

  /* =============================
     RESERVATIONS (DB)
  ============================== */
  const createOrder = useCallback(
    async (data) => {
      try {
        const saved = await api.createReservation({
          restaurantId: data.venueId,
          name: data.guestName || "Guest",
          phone: data.phone || "",
          date: data.date,
          time: data.time,
          people: data.people,
          note: data.note || "",
        });

        const order = {
          id: saved._id,
          venueId: data.venueId,
          venueName: data.venueName,
          venueImg: data.venueImg,
          date: data.date,
          time: data.time,
          people: data.people,
          note: data.note || "",
          status: "confirmed",
          createdAt: new Date().toLocaleString("mn-MN"),
        };

        setOrders((prev) => [order, ...prev]);
        return order;
      } catch (err) {
        addToast("Захиалга хадгалахад алдаа гарлаа", "error");
        throw err;
      }
    },
    [addToast]
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      try {
        await api.cancelReservation(orderId);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      } catch {
        addToast("Цуцлахад алдаа гарлаа", "error");
      }
    },
    [addToast]
  );

  const updateOrder = useCallback(
    async (orderId, changes) => {
      try {
        await api.updateReservation(orderId, changes);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...changes } : o))
        );
      } catch {
        addToast("Өөрчлөлт хадгалахад алдаа гарлаа", "error");
      }
    },
    [addToast]
  );

  /* =============================
     REVIEWS (DB)
  ============================== */
  const addReview = useCallback(
    async (venueId, review) => {
      try {
        const saved = await api.createReview(venueId, review);
        setReviews((prev) => ({
          ...prev,
          [venueId]: [{ id: saved._id, ...saved }, ...(prev[venueId] || [])],
        }));

        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === venueId
              ? { ...r, reviewCount: (r.reviewCount || 0) + 1 }
              : r
          )
        );
      } catch {
        addToast("Сэтгэгдэл хадгалахад алдаа гарлаа", "error");
      }
    },
    [addToast]
  );

  /* =============================
     AUTH METHODS (unchanged)
  ============================== */

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  /* =============================
     CONTEXT VALUE
  ============================== */
  const value = useMemo(
    () => ({
      restaurants,
      loading,
      orders,
      reviews,
      toasts,
      users,
      currentUser,
      toggleFavorite,
      createOrder,
      cancelOrder,
      updateOrder,
      addReview,
      addToast,
      logoutUser,
    }),
    [
      restaurants,
      loading,
      orders,
      reviews,
      toasts,
      users,
      currentUser,
      toggleFavorite,
      createOrder,
      cancelOrder,
      updateOrder,
      addReview,
      addToast,
      logoutUser,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
