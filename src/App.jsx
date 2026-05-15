import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { useApp } from "./context/AppContext";

function ProtectedRoutes() {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function App() {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="page-wrap" style={{ padding: 48, textAlign: "center" }}>
        <p className="page-subtitle">Ачаалж байна…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/home" replace /> : <RegisterPage />}
      />
      <Route element={<ProtectedRoutes />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
