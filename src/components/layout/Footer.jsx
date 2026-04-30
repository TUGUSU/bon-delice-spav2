import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <p>
        © 2026 <Link to="/home">Bon Delice</Link> ·{" "}
        <Link to="/restaurants">Ресторан</Link> ·{" "}
        <Link to="/favorites">Хадгалсан</Link> ·{" "}
        <Link to="/orders">Захиалга</Link>
      </p>
    </footer>
  );
}

export default Footer;
