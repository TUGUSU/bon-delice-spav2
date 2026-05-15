import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import restaurantData from "../data/restaurants.json";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api/client";
import {
  demoCancelOrder,
  demoCreateOrder,
  demoGetSessionUser,
  demoListOrders,
  demoLogin,
  demoLogout,
  demoRegister,
  demoUpdateOrder,
  demoUpdateProfile,
  validatePasswordDemo,
} from "../auth/demoAuth";

/** AppContext – global state store */
const AppContext = createContext(null);

const isDemoAuth =
  typeof process !== "undefined" &&
  process.env &&
  process.env.DEMO_AUTH === "true";

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validatePasswordClient(plain) {
  if (isDemoAuth) return validatePasswordDemo(plain);
  if (typeof plain !== "string" || plain.length < 8) {
    return "Нууц үг хамгийн багадаа 8 тэмдэгт, том жижиг үсэг, тоо, тусгай тэмдэгт агуулна.";
  }
  if (!PASSWORD_RULE.test(plain)) {
    return "Нууц үг: дор хаяж 8 тэмдэгт, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт шаардлагатай.";
  }
  return null;
}

export function AppProvider({ children }) {
  const [restaurants, setRestaurants] = useState(restaurantData.restaurants);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({});
  const [toasts, setToasts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadDemoOrders = useCallback((userId) => {
    if (!userId) {
      setOrders([]);
      return;
    }
    setOrders(demoListOrders(userId));
  }, []);

  const refreshOrders = useCallback(async () => {
    if (isDemoAuth) {
      loadDemoOrders(currentUser?.id);
      return;
    }
    try {
      const data = await apiGet("/orders");
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
  }, [currentUser?.id, loadDemoOrders]);

  useEffect(() => {
    if (isDemoAuth) {
      const user = demoGetSessionUser();
      setCurrentUser(user);
      loadDemoOrders(user?.id);
      setAuthLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet("/auth/me");
        if (!cancelled && data.user) {
          setCurrentUser(data.user);
          await refreshOrders();
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
          setOrders([]);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDemoOrders, refreshOrders]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }, []);

  const createOrder = useCallback(
    async (data) => {
      const payload = {
        venueId: data.venueId,
        venueName: data.venueName,
        venueImg: data.venueImg,
        date: data.date,
        time: data.time,
        people: data.people,
        note: data.note || "",
      };
      if (isDemoAuth) {
        if (!currentUser) {
          const err = new Error("Нэвтрэх шаардлагатай.");
          err.status = 401;
          throw err;
        }
        const order = demoCreateOrder(currentUser.id, payload);
        setOrders((prev) => [order, ...prev]);
        return order;
      }
      const { order } = await apiPost("/orders", payload);
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [currentUser]
  );

  const cancelOrder = useCallback(
    async (orderId) => {
      if (isDemoAuth) {
        if (!currentUser) throw Object.assign(new Error("Нэвтрэх шаардлагатай."), { status: 401 });
        const order = demoCancelOrder(currentUser.id, orderId);
        setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
        return;
      }
      const { order } = await apiDelete(`/orders/${orderId}`);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    },
    [currentUser]
  );

  const updateOrder = useCallback(
    async (orderId, changes) => {
      if (isDemoAuth) {
        if (!currentUser) throw Object.assign(new Error("Нэвтрэх шаардлагатай."), { status: 401 });
        const order = demoUpdateOrder(currentUser.id, orderId, changes);
        setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
        return;
      }
      const { order } = await apiPatch(`/orders/${orderId}`, changes);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    },
    [currentUser]
  );

  const addReview = useCallback((venueId, review) => {
    setReviews((prev) => ({
      ...prev,
      [venueId]: [{ id: Date.now(), ...review }, ...(prev[venueId] || [])],
    }));
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === venueId ? { ...r, reviewCount: r.reviewCount + 1 } : r
      )
    );
  }, []);

  const registerUser = useCallback(async ({ username, fullName, email, password }) => {
    const u = String(username || "").trim();
    if (!u) {
      return { ok: false, message: "Хэрэглэгчийн нэрээ оруулна уу." };
    }
    const pwdErr = validatePasswordClient(password);
    if (pwdErr) {
      return { ok: false, message: pwdErr };
    }
    if (isDemoAuth) {
      return demoRegister({
        username: u,
        fullName,
        email,
        password,
      });
    }
    try {
      const data = await apiPost("/auth/register", {
        username: u,
        fullName: String(fullName || "").trim(),
        email: String(email || "").trim(),
        password,
      });
      if (!data.user) {
        return { ok: false, message: "Бүртгэлийн хариу буруу байна." };
      }
      setCurrentUser(null);
      setOrders([]);
      return { ok: true, user: data.user };
    } catch (err) {
      return {
        ok: false,
        message: err.message || "Бүртгэл амжилтгүй.",
        status: err.status,
      };
    }
  }, []);

  const loginUser = useCallback(
    async ({ username, password }) => {
      const u = String(username || "").trim().toLowerCase();
      if (!u) {
        return { ok: false, message: "Хэрэглэгчийн нэрээ оруулна уу." };
      }
      if (isDemoAuth) {
        const result = demoLogin({ username: u, password });
        if (result.ok) {
          setCurrentUser(result.user);
          loadDemoOrders(result.user.id);
        }
        return result;
      }
      try {
        const data = await apiPost("/auth/login", { username: u, password });
        if (!data.user) {
          return { ok: false, message: "Нэвтрэлтийн хариу буруу байна." };
        }
        setCurrentUser(data.user);
        await refreshOrders();
        return { ok: true, user: data.user };
      } catch (err) {
        if (err.status === 429) {
          return { ok: false, message: err.message || "Түр хүлээнэ үү." };
        }
        return { ok: false, message: err.message || "Нэвтрэлт амжилтгүй." };
      }
    },
    [loadDemoOrders, refreshOrders]
  );

  const updateProfile = useCallback(
    async ({ fullName, email }) => {
      if (!currentUser) {
        return { ok: false, message: "Нэвтрээгүй байна." };
      }
      if (isDemoAuth) {
        const result = demoUpdateProfile(currentUser.id, { fullName, email });
        if (result.ok) setCurrentUser(result.user);
        return result;
      }
      try {
        const data = await apiPatch("/users/me", {
          fullName: String(fullName || "").trim(),
          email: String(email || "").trim(),
        });
        setCurrentUser(data.user);
        return { ok: true, user: data.user };
      } catch (err) {
        return { ok: false, message: err.message || "Хадгалалт амжилтгүй." };
      }
    },
    [currentUser]
  );

  const logoutUser = useCallback(async () => {
    if (!isDemoAuth) {
      try {
        await apiPost("/auth/logout", {});
      } catch {
        // Still clear local session UI if the network fails.
      }
    } else {
      demoLogout();
    }
    setCurrentUser(null);
    setOrders([]);
  }, []);

  const value = useMemo(
    () => ({
      restaurants,
      orders,
      reviews,
      toasts,
      authLoading,
      isDemoAuth,
      toggleFavorite,
      createOrder,
      cancelOrder,
      updateOrder,
      addReview,
      addToast,
      currentUser,
      registerUser,
      loginUser,
      updateProfile,
      logoutUser,
    }),
    [
      restaurants,
      orders,
      reviews,
      toasts,
      authLoading,
      toggleFavorite,
      createOrder,
      cancelOrder,
      updateOrder,
      addReview,
      addToast,
      currentUser,
      registerUser,
      loginUser,
      updateProfile,
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
