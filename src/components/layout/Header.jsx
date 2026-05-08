import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, Heart, LogOut, Menu, User, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

function Header() {
    const [q, setQ] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const { restaurants, orders, currentUser, logoutUser } = useApp();
    const favCount = restaurants.filter((r) => r.isFavorite).length;
    const ordersCount = orders.filter((o) => o.status === "confirmed").length;

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }

        function handleEscape(e) {
            if (e.key === "Escape") setMenuOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function onSubmit(e) {
        e.preventDefault();
        if (q.trim()) {
            navigate(`/restaurants?q=${encodeURIComponent(q.trim())}`);
            setMenuOpen(false);
        }
    }

    function handleLogout() {
        logoutUser();
        setMenuOpen(false);
        navigate("/login");
    }

    return (
        <header className="header">
            <Link to="/home" className="header-logo">
                <img
                    src="/images/banners/logo.png"
                    alt="Bon Delice Logo"
                    className="custom-logo-img"
                />
                <span className="logo-text">Bon Delice</span>
            </Link>

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

            <nav className="header-nav" ref={menuRef} aria-label="Хэрэглэгчийн цэс">
                <button
                    type="button"
                    className={`header-menu-btn${menuOpen ? " active" : ""}`}
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? "Цэс хаах" : "Цэс нээх"}
                    aria-expanded={menuOpen}
                    aria-controls="header-slide-menu"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    {(favCount > 0 || ordersCount > 0) && (
                        <span className="header-menu-alert">{favCount + ordersCount}</span>
                    )}
                </button>

                <div
                    id="header-slide-menu"
                    className={`header-menu-panel${menuOpen ? " open" : ""}`}
                    aria-hidden={!menuOpen}
                >
                    {currentUser ? (
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `header-menu-link${isActive ? " active" : ""}`}
                            onClick={() => setMenuOpen(false)}
                            tabIndex={menuOpen ? 0 : -1}
                        >
                            <span className="header-menu-icon-wrap">
                                <User size={19} />
                            </span>
                            <span>Профайл</span>
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/login"
                            className={({ isActive }) => `header-menu-link${isActive ? " active" : ""}`}
                            onClick={() => setMenuOpen(false)}
                            tabIndex={menuOpen ? 0 : -1}
                        >
                            <span className="header-menu-icon-wrap">
                                <User size={19} />
                            </span>
                            <span>Нэвтрэх</span>
                        </NavLink>
                    )}

                    <NavLink
                        to="/favorites"
                        className={({ isActive }) => `header-menu-link${isActive ? " active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                        tabIndex={menuOpen ? 0 : -1}
                    >
                        <span className="header-menu-icon-wrap">
                            <Heart size={19} />
                            {favCount > 0 && <span className="nav-badge">{favCount}</span>}
                        </span>
                        <span>Хадгалсан</span>
                    </NavLink>

                    <NavLink
                        to="/orders"
                        className={({ isActive }) => `header-menu-link${isActive ? " active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                        tabIndex={menuOpen ? 0 : -1}
                    >
                        <span className="header-menu-icon-wrap">
                            <CalendarDays size={19} />
                            {ordersCount > 0 && <span className="nav-badge">{ordersCount}</span>}
                        </span>
                        <span>Захиалга</span>
                    </NavLink>

                    {currentUser && (
                        <>
                            <div className="header-menu-divider" />

                            <button
                                type="button"
                                className="header-menu-link header-menu-logout"
                                onClick={handleLogout}
                                tabIndex={menuOpen ? 0 : -1}
                            >
                                <LogOut size={19} />
                                <span>Гарах</span>
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
