"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WA_NUMBER = "6285817670115";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20ya%20%F0%9F%8D%9C`;

const navLinks = [
  { label: "Home", href: "#home", icon: "🏠" },
  { label: "Menu", href: "#menu", icon: "🍽️" },
  { label: "Lokasi", href: "#lokasi", icon: "📍" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Check stored theme or system preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "16px 20px 0",
        pointerEvents: "none",
      }}
    >
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          pointerEvents: "all",
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: `1px solid ${scrolled ? "rgba(249,115,22,0.25)" : "var(--nav-border)"}`,
          borderRadius: 20,
          boxShadow: scrolled
            ? "0 10px 40px rgba(0,0,0,0.25)"
            : "0 4px 20px rgba(0,0,0,0.1)",
          transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
        }}
      >
        {/* ── LOGO ── */}
        <a href="#home" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #f97316, #dc2626)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                boxShadow: "0 4px 16px rgba(249,115,22,0.45)",
                flexShrink: 0,
              }}
            >
              🍜
            </div>
            <span
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Warmindo_SH
            </span>
          </div>
        </a>

        {/* ── NAV LINKS — desktop ── */}
        <ul
          className="nav-links-desktop"
          style={{ display: "flex", gap: 4, listStyle: "none", margin: 0, padding: 0 }}
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link-item"
                style={{
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "8px 16px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "color 0.2s, background 0.2s",
                  letterSpacing: "0.01em",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-orange)";
                  e.currentTarget.style.background = "rgba(249,115,22,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* ── RIGHT: Theme Toggle + CTA + Hamburger ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Dark/Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark/light theme"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid var(--border-glass)",
              background: "var(--theme-toggle-bg)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.15rem",
              transition: "transform 0.2s, background 0.2s",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* WA CTA Button */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 20px",
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.825rem",
              borderRadius: 999,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(249,115,22,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(249,115,22,0.35)";
            }}
          >
            <span>💬</span>
            <span>Pesan WA</span>
          </a>

          {/* Hamburger (Mobile Only) */}
          <button
            id="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="nav-hamburger"
            style={{
              background: "var(--theme-toggle-bg)",
              border: "1px solid var(--border-glass)",
              borderRadius: 10,
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: "8px",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="17" x2="21" y2="17" /></>
              }
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile dropdown (Mobile Only) ── */}
      <div className="mobile-dropdown-wrapper" style={{ maxWidth: 1180, margin: "0 auto", pointerEvents: "all" }}>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: 8,
                background: "var(--dropdown-bg)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid var(--border-glass)",
                borderRadius: 18,
                padding: "14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    padding: "12px 16px",
                    borderRadius: 12,
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(249,115,22,0.1)";
                    e.currentTarget.style.color = "var(--accent-orange)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(249,115,22,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}

              {/* Mobile WA Button inside dropdown */}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <span>💬</span>
                <span>Pesan via WhatsApp</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .mobile-dropdown-wrapper { display: none !important; }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-cta-btn       { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
