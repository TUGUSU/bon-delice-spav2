import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import restaurantData from "../data/restaurants.json";

/** AppContext – global state store */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState(restaurantData.restaurants);
  const [orders,      setOrders]      = useState([]);
  const [reviews,     setReviews]     = useState({});      // { [id]: Review[] }
  const [toasts,      setToasts]      = useState([]);

  /* Toast system*/
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  /* Favorites */
  const toggleFavorite = useCallback((id) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }, []);

  /*Reservations */
  const createOrder = useCallback((data) => {
    const order = {
      id:        Date.now(),
      venueId:   data.venueId,
      venueName: data.venueName,
      venueImg:  data.venueImg,
      date:      data.date,
      time:      data.time,
      people:    data.people,
      note:      data.note || "",
      status:    "confirmed",
      createdAt: new Date().toLocaleString("mn-MN"),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const cancelOrder = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
    );
  }, []);

  const updateOrder = useCallback((orderId, changes) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...changes } : o))
    );
  }, []);

  /* Reviews */
  const addReview = useCallback((venueId, review) => {
    setReviews((prev) => ({
      ...prev,
      [venueId]: [{ id: Date.now(), ...review }, ...(prev[venueId] || [])],
    }));
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === venueId
          ? { ...r, reviewCount: r.reviewCount + 1 }
          : r
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      restaurants,
      orders,
      reviews,
      toasts,
      toggleFavorite,
      createOrder,
      cancelOrder,
      updateOrder,
      addReview,
      addToast,
    }),
    [restaurants, orders, reviews, toasts,
     toggleFavorite, createOrder, cancelOrder, updateOrder, addReview, addToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
