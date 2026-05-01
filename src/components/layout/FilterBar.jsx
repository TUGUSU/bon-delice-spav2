import React, { useEffect, useRef, useState } from "react";

const RATING_OPTIONS = [ { value: "", label: "Үнэлгээ" }, { value: "4.5-5.0", label: "4.5 – 5.0" }, { value: "4.0-4.5", label: "4.0 – 4.5" }, { value: "3.5-4.0", label: "3.5 – 4.0" },  { value: "3.0-3.5", label: "3.0 – 3.5" } ];
const CUISINE_OPTIONS = [ { value: "", label: "Үндэстний зоог" }, { value: "korean", label: "Солонгос" }, { value: "italian", label: "Итали" }, { value: "mongolian", label: "Монгол" }, { value: "chinese", label: "Хятад" }, { value: "vietnam", label: "Вьетнам" }, { value: "uzbek", label: "Узбек" }/* ... */ ];
const TYPE_OPTIONS = [ { value: "all", label: "Бүгд" }, { value: "restaurant", label: "Ресторан" }, { value: "pub", label: "Паб" }, ];

function Dropdown({ label, options, value, onChange, icon }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);
    const selected = options.find((o) => o.value === value);
    return (
        <div className="filter-dropdown" ref={ref}>
            <button type="button" className={`filter-dropdown-btn${value ? " active" : ""}`} onClick={() => setOpen((p) => !p)}>
                {icon && <span>{icon}</span>}
                {selected?.label || label}
                <span className="filter-chevron">▼</span>
            </button>
            {open && (
                <div className="filter-menu">
                    {options.map((opt) => (
                        <div key={opt.value} className={`filter-menu-item${opt.value === value ? " selected" : ""}`} onClick={() => { onChange(opt.value); setOpen(false); }}>{opt.label}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterBar({ filters, onFilterChange }) {
    if (!filters || typeof onFilterChange !== 'function') {
        return null;
    }
    return (
        <div className="filter-bar-wrapper">
            <div className="filter-bar-container">
                <div className="filter-group">
                    {TYPE_OPTIONS.map((t) => (
                        <button key={t.value} type="button" className={`filter-pill${filters.typeFilter === t.value ? " active" : ""}`} onClick={() => onFilterChange("typeFilter", t.value)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="filter-group-right">
                    <Dropdown label="Үнэлгээ" options={RATING_OPTIONS} value={filters.ratingFilter} onChange={(v) => onFilterChange("ratingFilter", v)} />
                    <Dropdown label="Үндэстний зоог" options={CUISINE_OPTIONS} value={filters.cuisineFilter} onChange={(v) => onFilterChange("cuisineFilter", v)} />
                </div>
            </div>
        </div>
    );
}

export default FilterBar;
