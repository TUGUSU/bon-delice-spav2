import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import restaurantData from "../data/restaurants.json";

/** AppContext – global state store */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState(restaurantData.restaurants);
  const [orders,      setOrders]      = useState([]);
  const [reviews,     setReviews]     = useState({});      // { [id]: Review[] }
  const [toasts,      setToasts]      = useState([]);
  const [users,       setUsers]       = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const savedUsers = JSON.parse(localStorage.getItem("bon_delice_users") || "[]");
      const savedCurrentUser = JSON.parse(
        localStorage.getItem("bon_delice_current_user") || "null"
      );
      if (Array.isArray(savedUsers)) setUsers(savedUsers);
      if (savedCurrentUser) setCurrentUser(savedCurrentUser);
    } catch {
      // Ignore malformed local storage values.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bon_delice_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("bon_delice_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

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

  /* Auth */
  const registerUser = useCallback(
    ({ fullName, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: "И-мэйл заавал оруулна уу." };
      }
      if (users.some((u) => u.email === normalizedEmail)) {
        return { ok: false, message: "Энэ и-мэйл бүртгэлтэй байна." };
      }

      const newUser = {
        id: Date.now(),
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser({ id: newUser.id, fullName: newUser.fullName, email: newUser.email });
      return { ok: true, user: newUser };
    },
    [users]
  );

  const loginUser = useCallback(
    ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const foundUser = users.find(
        (u) => u.email === normalizedEmail && u.password === password
      );
      if (!foundUser) {
        return { ok: false, message: "И-мэйл эсвэл нууц үг буруу байна." };
      }
      setCurrentUser({
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
      });
      return { ok: true, user: foundUser };
    },
    [users]
  );

  const updateProfile = useCallback(
    ({ fullName, email }) => {
      if (!currentUser) {
        return { ok: false, message: "Нэвтрээгүй байна." };
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: "И-мэйл хоосон байж болохгүй." };
      }
      if (users.some((u) => u.email === normalizedEmail && u.id !== currentUser.id)) {
        return { ok: false, message: "Энэ и-мэйл өөр хэрэглэгч дээр бүртгэлтэй байна." };
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, fullName: fullName.trim(), email: normalizedEmail }
            : u
        )
      );
      const next = {
        id: currentUser.id,
        fullName: fullName.trim(),
        email: normalizedEmail,
      };
      setCurrentUser(next);
      return { ok: true, user: next };
    },
    [currentUser, users]
  );

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
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
      users,
      currentUser,
      registerUser,
      loginUser,
      updateProfile,
      logoutUser,
    }),
    [restaurants, orders, reviews, toasts,
     toggleFavorite, createOrder, cancelOrder, updateOrder, addReview, addToast,
     users, currentUser, registerUser, loginUser, updateProfile, logoutUser]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
