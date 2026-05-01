import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import FilterBar from "../components/layout/FilterBar";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import ReservationModal from "../components/restaurant/ReservationModal";
import SkeletonCard from "../components/common/SkeletonCard";

// Active Filters-г харуулах компонент
function ActiveFiltersDisplay({ filters, onClearFilter, onClearAll }) {
    const RATING_OPTIONS = [ { value: "", label: "Бүгд" }, { value: "4.5-5.0", label: "4.5 – 5.0" }, { value: "4.0-4.5", label: "4.0 – 4.5" }, { value: "3.0-4.0", label: "3.0 – 4.0" }, ];
    const CUISINE_OPTIONS = [ { value: "", label: "Бүгд" }, { value: "korean", label: "Солонгос" }, { value: "italian", label: "Итали" }, { value: "mongolian", label: "Монгол" }, /* ... */ ];

    const activeFilters = [];
    if (filters.ratingFilter) {
        const option = RATING_OPTIONS.find(o => o.value === filters.ratingFilter);
        activeFilters.push({ key: 'ratingFilter', label: `⭐ ${option?.label}` });
    }
    if (filters.cuisineFilter) {
        const option = CUISINE_OPTIONS.find(o => o.value === filters.cuisineFilter);
        activeFilters.push({ key: 'cuisineFilter', label: `🍽️ ${option?.label}` });
    }
    if (activeFilters.length === 0) return null;

    return (
        <div className="active-filters-container">
            <span className="active-filters-label">Шүүлтүүр:</span>
            {activeFilters.map(filter => (
                <div key={filter.key} className="active-filter-pill">
                    <span>{filter.label}</span>
                    <button onClick={() => onClearFilter(filter.key)}>✕</button>
                </div>
            ))}
            <button className="clear-all-btn" onClick={onClearAll}>Бүгдийг арилгах</button>
        </div>
    );
}

// "Under Development" мессеж харуулах UI
function UnderDevelopmentMessage({ type }) {
    const title = type === 'pub' ? 'Паб & Лоунж' : 'Караоке';
    const emoji = type === 'pub' ? '🍻' : '🎤';
    
    return (
        <div className="favorites-empty" style={{ minHeight: '60vh', paddingTop: '4rem', gridColumn: '1 / -1' }}>
            <span className="empty-emoji" style={{ fontSize: '4rem' }}>{emoji}</span>
            <h1 className="page-title" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{title}</h1>
            <p className="empty-title">Уучлаарай, энэ хэсэг одоогоор хийгдэж байна.</p>
            <p className="empty-sub">Та "Ресторан"-аас өөрийн дуртай газараа сонгон захиална уу.</p>
        </div>
    );
}

function RestaurantsPage() {
    const { restaurants, toggleFavorite } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = new URLSearchParams(location.search);
    const urlQ = urlParams.get("q") || "";
    const urlType = urlParams.get("type") || "all";

    const [typeFilter, setTypeFilter] = useState(urlType);
    const [ratingFilter, setRatingFilter] = useState("");
    const [cuisineFilter, setCuisineFilter] = useState("");
    const [reserveTarget, setReserveTarget] = useState(null);

    useEffect(() => {
        setTypeFilter(urlParams.get("type") || "all");
    }, [location.search]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(location.search);
        if (key === "typeFilter") {
            if (value === 'all') newParams.delete('type');
            else newParams.set('type', value);
            navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
        }
        if (key === "ratingFilter") setRatingFilter(value);
        if (key === "cuisineFilter") setCuisineFilter(value);
    };

    const handleClearFilter = (key) => handleFilterChange(key, "");
    const handleClearAll = () => {
        handleFilterChange("ratingFilter", "");
        handleFilterChange("cuisineFilter", "");
    };

    const filters = { typeFilter, ratingFilter, cuisineFilter };
    
    const displayed = useMemo(() => {
        return restaurants.filter(r => {
            const ratingOk = !ratingFilter || (r.rating >= parseFloat(ratingFilter.split('-')[0]) && r.rating <= parseFloat(ratingFilter.split('-')[1]));
            const cuisineOk = !cuisineFilter || r.category === cuisineFilter;
            const searchOk = !urlQ || (r.name.toLowerCase().includes(urlQ.toLowerCase()) || (r.tags && r.tags.some(t => t.toLowerCase().includes(urlQ.toLowerCase()))));
            return ratingOk && cuisineOk && searchOk;
        });
    }, [restaurants, ratingFilter, cuisineFilter, urlQ]);

    const isUnavailableType = typeFilter === "pub" || typeFilter === "karaoke";

    return (
        <>
            {/* FILTERBAR */}
            <FilterBar onFilterChange={handleFilterChange} filters={filters} />
            
            <div className="page-wrap">
                <div className="page-header">
                    <h1 className="page-title">Ресторанууд</h1>
                    {!isUnavailableType && <p className="page-subtitle">{displayed.length} үр дүн олдлоо</p>}
                </div>
                
                {!isUnavailableType && <ActiveFiltersDisplay filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAll} />}

                {/* ЗӨВХӨН ДООРХ КОНТЕНТ НӨХЦЛӨӨС ХАМААРЧ СОЛИГДОНО */}
                <div className="cards-grid">
                    {isUnavailableType ? (
                        // "Pub" эсвэл "Karaoke" бол мессеж харуулах
                        <UnderDevelopmentMessage type={typeFilter} />
                    ) : displayed.length === 0 ? (
                        // Илэрц байхгүй бол мессеж харуулах
                        <div className="favorites-empty" style={{ gridColumn: '1 / -1' }}>
                            <span className="empty-emoji">🔍</span>
                            <p className="empty-title">Тохирох ресторан олдсонгүй</p>
                            <p className="empty-sub">Шүүлтүүрийг өөрчилж үзнэ үү.</p>
                        </div>
                    ) : (
                        // Илэрц олдсон бол картуудыг харуулах
                        displayed.map((r) => (
                            <div key={r.id}>
                                <RestaurantCard restaurant={r} onToggleFavorite={toggleFavorite} onReserve={setReserveTarget} />
                            </div>
                        ))
                    )}
                </div>
            </div>
            <ReservationModal restaurant={reserveTarget} isOpen={!!reserveTarget} onClose={() => setReserveTarget(null)} />
        </>
    );
}

export default RestaurantsPage;
