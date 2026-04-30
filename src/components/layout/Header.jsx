import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

function Header() {
    const [q, setQ] = useState("");
    const navigate = useNavigate();
    const { restaurants, orders } = useApp();
    const favCount = restaurants.filter((r) => r.isFavorite).length;
    const ordersCount = orders.filter((o) => o.status === "confirmed").length;

    function onSubmit(e) {
        e.preventDefault();
        if (q.trim()) navigate(`/restaurants?q=${encodeURIComponent(q.trim())}`);
    }

    return (
        // **БҮХ ИЛҮҮ DIV-Г УСТГАСАН**
        <header className="header">
            {/* Left: logo */}
            <Link to="/home" className="header-logo">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="36" rx="8" fill="#ef4444" />
                    <path d="M9 10h5v16H9zM16 10h2v16h-2zM22 10c3.3 0 5 1.8 5 4s-1.7 4-5 4h-3v8h-2V10h5z" fill="white" />
                </svg>
                <span>menu</span>
            </Link>

            {/* Center: search */}
            <form className="header-search" onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Хоол, Ресторан хайх..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Хайх"
                />
                <button type="submit" className="header-search-btn" aria-label="Хайх">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </button>
            </form>

            {/* Right: navigation links */}
            <nav className="header-nav">
                <NavLink to="/favorites" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                    <span className="header-nav-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        {favCount > 0 && <span className="nav-badge">{favCount}</span>}
                    </span>
                    <span className="header-nav-label">Хадгалсан</span>
                </NavLink>
                <NavLink to="/orders" className={({ isActive }) => `header-nav-link${isActive ? " active" : ""}`}>
                    <span className="header-nav-icon-wrap">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                        </svg>
                        {ordersCount > 0 && <span className="nav-badge">{ordersCount}</span>}
                    </span>
                    <span className="header-nav-label">Захиалга</span>
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
