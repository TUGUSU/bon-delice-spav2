import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

function MainLayout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
