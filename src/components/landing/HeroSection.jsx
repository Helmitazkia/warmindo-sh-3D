"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";

const WA_LINK = `https://wa.me/6285817670115?text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20ya%20%F0%9F%8D%9C`;

/* ─────────────────────────────────────── helpers */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] } },
});

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  /* mouse parallax on hero bowl */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - left - width / 2) / (width / 2)) * 20);
    mouseY.set(((e.clientY - top - height / 2) / (height / 2)) * 20);
  };
  const resetMouse = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <section
      id="home"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetMouse}
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 120,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* ── Background gradient mesh ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 65% 45%, rgba(249,115,22,0.13) 0%, transparent 65%)," +
            "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(251,191,36,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Animated blobs ── */}
      <motion.div
        style={{
          position: "absolute",
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 65%)",
          filter: "blur(80px)",
          right: "-8%",
          top: "5%",
          y: heroY,
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 65%)",
          filter: "blur(60px)",
          left: "-5%",
          bottom: "10%",
          pointerEvents: "none",
          animation: "pulse-glow 7s ease-in-out infinite 2s",
        }}
      />

      {/* ── Decorative rings ── */}
      <motion.div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          border: "1px solid rgba(249,115,22,0.08)",
          borderRadius: "50%",
          right: "8%",
          top: "50%",
          translateY: "-50%",
          pointerEvents: "none",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          border: "1px dashed rgba(251,191,36,0.06)",
          borderRadius: "50%",
          right: "14%",
          top: "50%",
          translateY: "-50%",
          pointerEvents: "none",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* ════════ TWO-COLUMN LAYOUT ════════ */}
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
        className="hero-grid"
      >

        {/* ══ LEFT — TEXT COLUMN ══ */}
        <motion.div style={{ y: textY }}>

          {/* Label pill */}
          <motion.div
            variants={fadeUp(0.15)}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: 28 }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 18px",
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent-muted)",
                borderRadius: 999,
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-primary)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f97316",
                  boxShadow: "0 0 8px rgba(249,115,22,0.8)",
                  display: "inline-block",
                  animation: "pulse-glow 2s infinite",
                }}
              />
              Kedai Favorit Leuwisadeng
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp(0.25)}
            initial="hidden"
            animate="visible"
            style={{
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3rem, 5.5vw, 5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 28,
              color: "var(--text-primary)",
            }}
          >
            Rasanya{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #dc2626 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Nikmat,
            </span>
            <br />
            Harganya{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #dc2626 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Pas!
            </span>
          </motion.h1>

          {/* Sub text */}
          <motion.p
            variants={fadeUp(0.35)}
            initial="hidden"
            animate="visible"
            style={{
              color: "var(--text-muted)",
              fontSize: "1.05rem",
              lineHeight: 1.75,
              marginBottom: 44,
              maxWidth: 440,
            }}
          >
            Nikmati mie instan yang dimasak dengan cinta — dari{" "}
            <strong style={{ color: "#f97316", fontWeight: 700 }}>Indomie Goreng crispy</strong>{" "}
            hingga{" "}
            <strong style={{ color: "#fbbf24", fontWeight: 700 }}>Pangsit Chili Oil</strong>{" "}
            yang bikin nagih. Harga mahasiswa, rasa bintang lima! 🌟
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp(0.45)}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}
          >
            <a
              href="/order?table=1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                borderRadius: 999,
                textDecoration: "none",
                boxShadow: "0 6px 28px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                transition: "transform 0.25s, box-shadow 0.25s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(249,115,22,0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
            >
              <span>📱</span>
              <span>Self Order Meja</span>
            </a>

            <a
              href="#menu"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 28px",
                background: "rgba(255,255,255,0.05)",
                color: "#e5e7eb",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 999,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)";
                e.currentTarget.style.color = "#f97316";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span>Lihat Menu</span>
              <span>→</span>
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp(0.55)}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", gap: 0, flexWrap: "wrap" }}
          >
            {[
              { num: "50+", label: "Menu Pilihan", icon: "🍽️" },
              { num: "4.9★", label: "Rating Pelanggan", icon: "⭐" },
              { num: "1rb+", label: "Pelanggan Puas", icon: "😋" },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 28px",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-poppins), sans-serif",
                    fontWeight: 800,
                    fontSize: "1.6rem",
                    background: "linear-gradient(135deg, #fbbf24, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}
                >
                  {s.num}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.3 }}>
                  {s.icon} {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══ RIGHT — FLOATING IMAGE COLUMN ══ */}
        <motion.div
          style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hero-image-wrapper"
        >
          {/* Multi-layer glow rings */}
          <div
            style={{
              position: "absolute",
              width: "85%",
              height: "85%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 65%)",
              filter: "blur(50px)",
              animation: "pulse-glow 3.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 65%)",
              filter: "blur(30px)",
              animation: "pulse-glow 5s ease-in-out infinite 1s",
            }}
          />

          {/* Main bowl image with mouse parallax */}
          <motion.div
            style={{ x: springX, y: springY, position: "relative", zIndex: 2 }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/asset/The_Floating_Hero_Object.png"
              alt="Mangkuk Indomie Warmindo SH yang menggiurkan"
              width={560}
              height={560}
              priority
              style={{
                width: "100%",
                maxWidth: 520,
                height: "auto",
                objectFit: "contain",
                filter:
                  "drop-shadow(0 40px 80px rgba(249,115,22,0.4)) " +
                  "drop-shadow(0 0 120px rgba(251,191,36,0.15))",
              }}
            />
          </motion.div>

          {/* ── Floating Side Dishes ── */}
          {/* 1. Es Matcha (Top Right) */}
          <motion.div
            className="floating-dish floating-matcha-item"
            style={{ position: "absolute", top: "-5%", right: "-6%", zIndex: 3 }}
            animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, rotate: 8 }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Image
                src="/asset/Es_Matcha.png"
                alt="Es Matcha Segar"
                width={190}
                height={190}
                className="hero-dish-img"
                style={{
                  width: 175,
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(16, 185, 129, 0.45)) drop-shadow(0 0 45px rgba(16, 185, 129, 0.25))",
                }}
              />
              <div
                className="dish-badge-pill"
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "-8px",
                  background: "rgba(6, 78, 59, 0.85)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  color: "#6ee7b7",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>🍵</span> Es Matcha
              </div>
            </div>
          </motion.div>

          {/* 2. Pangsit Chili Oil (Bottom Left) */}
          <motion.div
            className="floating-dish floating-pangsit-item"
            style={{ position: "absolute", bottom: "-5%", left: "-6%", zIndex: 3 }}
            animate={{ y: [0, 16, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            whileHover={{ scale: 1.1, rotate: -8 }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Image
                src="/asset/Pangsit_Chili_Oil.png"
                alt="Pangsit Chili Oil Lezat"
                width={210}
                height={210}
                className="hero-dish-img"
                style={{
                  width: 195,
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(220, 38, 38, 0.5)) drop-shadow(0 0 50px rgba(249, 115, 22, 0.3))",
                }}
              />
              <div
                className="dish-badge-pill"
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "-8px",
                  background: "rgba(127, 29, 29, 0.85)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  color: "#fca5a5",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(248, 113, 113, 0.35)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>🥟</span> Pangsit Chili Oil
              </div>
            </div>
          </motion.div>

          {/* ── Floating badges ── */}
          <motion.div
            className="hero-badge-topleft"
            style={{ position: "absolute", top: "12%", left: "6%", zIndex: 4 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: "var(--bg-card)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border-glass)",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(249,115,22,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                🔥
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#fbbf24" }}>
                  Best Seller
                </div>
                <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>Indomie Goreng</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-badge-bottomright"
            style={{ position: "absolute", bottom: "14%", right: "4%", zIndex: 4 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                background: "var(--bg-card)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--border-glass)",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(52,211,153,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                }}
              >
                ✅
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#34d399" }}>
                  Mulai Rp 8.000
                </div>
                <div style={{ fontSize: "0.68rem", color: "#9ca3af" }}>Harga Terjangkau</div>
              </div>
            </div>
          </motion.div>

          {/* Spice icon floating */}
          <motion.div
            className="hero-spice-icon"
            style={{ position: "absolute", top: "45%", right: "-2%", zIndex: 4 }}
            animate={{ y: [0, -14, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(239,68,68,0.18)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              🌶️
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            text-align: center;
          }
          .hero-grid > div:last-child { order: -1; }
          .hero-grid > div:first-child > div:last-child { justify-content: center; }

          .hero-image-wrapper {
            margin-top: 1rem;
            padding: 1rem 0;
          }

          .hero-dish-img {
            width: 120px !important;
          }

          .floating-matcha-item {
            top: -6% !important;
            right: -2% !important;
          }

          .floating-pangsit-item {
            bottom: -6% !important;
            left: -2% !important;
          }

          .dish-badge-pill {
            font-size: 0.65rem !important;
            padding: 3px 9px !important;
          }

          .hero-badge-topleft {
            top: 2% !important;
            left: 0% !important;
          }

          .hero-badge-bottomright {
            bottom: 2% !important;
            right: 0% !important;
          }

          .hero-spice-icon {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .hero-dish-img {
            width: 95px !important;
          }

          .floating-matcha-item {
            top: -8% !important;
            right: -4% !important;
          }

          .floating-pangsit-item {
            bottom: -8% !important;
            left: -4% !important;
          }

          .hero-badge-topleft, .hero-badge-bottomright {
            scale: 0.9;
          }
        }
      `}</style>
    </section>
  );
}
