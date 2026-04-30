import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
// Footer байгаа бол энд импортлоно

function MainLayout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default MainLayout;
