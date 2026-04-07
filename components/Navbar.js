"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #ef4444, #f87171)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "white",
            boxShadow: "0 4px 15px rgba(239,68,68,0.4)"
          }}>HJ</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "white", letterSpacing: "-0.3px" }}>Happy Journey</div>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 1.5 }}>DISCOVER INDIA</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">
          {[["Home", "/"], ["Explore", "#states"], ["Trip Planner", "/planner"], ["About", "#about"], ["Admin", "/admin"]].map(([label, href]) => (
            <Link key={label} href={href} style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "var(--primary)"}
              onMouseLeave={e => e.target.style.color = "#cbd5e1"}>
              {label}
            </Link>
          ))}
          <Link href="#states" className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>
            ✈️ Plan Trip
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}
          className="mobile-menu-btn">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          marginTop: 12, padding: "24px",
          background: "var(--dark-2)", borderRadius: 16,
          border: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: 12,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }}>
          {[["🏠 Home", "/"], ["🗺️ Explore", "#states"], ["ℹ️ About", "#about"], ["🔐 Admin", "/admin"]].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              style={{ color: "white", textDecoration: "none", fontSize: 15, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
