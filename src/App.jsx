import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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

function App() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={currentUser ? "/home" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/home" replace /> : <RegisterPage />}
      />
      {/* Бүх хуудсыг нэг MainLayout дотор байрлуулах */}
      <Route
        path="/"
        element={currentUser ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
