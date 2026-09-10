"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const WA_NUMBER = "6285817670115";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20ya%20%F0%9F%8D%9C`;

const socialLinks = [
  { label: "WhatsApp", href: WA_LINK, emoji: "💬" },
  { label: "Instagram", href: "#", emoji: "📸" },
  { label: "TikTok", href: "#", emoji: "🎵" },
];

export default function CTAFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      {/* ── CTA SECTION ─────────────────────────── */}
      <section
        ref={ref}
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        {/* Big glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Decorative big ring */}
        <div
          className="spin-decoration"
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            border: "1px dashed rgba(249,115,22,0.08)",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Floating bowl image */}
          <motion.div
            className="float-slow"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 32 }}
          >
            <Image
              src="/asset/The_Floating_Hero_Object.png"
              alt="Mangkuk Warmindo SH"
              width={160}
              height={160}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 20px 40px rgba(249,115,22,0.4))",
                display: "inline-block",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                letterSpacing: "-0.03em",
                marginBottom: 20,
                lineHeight: 1.15,
                color: "var(--text-primary)",
              }}
            >
              Lapar? Jangan{" "}
              <span className="gradient-text">Ditahan!</span>
              <span style={{ fontSize: "0.9em" }}> 🍜</span>
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "1.15rem",
                lineHeight: 1.7,
                marginBottom: 48,
                maxWidth: 560,
                marginInline: "auto",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Pesan sekarang lewat WhatsApp. Mie racikan khas, kuah hangat gurih,
              dan es warkop menanti kamu di Warmindo SH.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 48px",
                background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
                borderRadius: 99,
                color: "#000",
                fontWeight: 800,
                fontSize: "1.25rem",
                textDecoration: "none",
                boxShadow:
                  "0 12px 40px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                transition: "box-shadow 0.3s ease",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
              className="btn-glow"
            >
              <span style={{ fontSize: "1.6rem" }}>💬</span>
              <span>Pesan via WhatsApp Now</span>
              <span style={{ fontSize: "1.2rem", opacity: 0.8 }}>→</span>
            </motion.a>
          </motion.div>

          {/* Guarantee Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              marginTop: 40,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "⚡", text: "Respon Cepat" },
              { icon: "🔥", text: "Selalu Hangat" },
              { icon: "🛵", text: "Siap Antar" },
            ].map((b) => (
              <span
                key={b.text}
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-glass)",
          padding: "48px 24px 32px",
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-poppins), sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            textAlign: "center",
          }}
        >
          {/* Top Row: Logo & Links */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>🍜</span>
              <span
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  background: "linear-gradient(135deg, #fbbf24, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Warmindo SH
              </span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              Nongkrong Asyik, Makan Nikmat — Ciawi, Bogor.
            </p>

            <div style={{ display: "flex", gap: 20 }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    transition: "color 0.2s",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {s.emoji} {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div
            style={{
              width: "100%",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              color: "#4b5563",
              fontSize: "0.82rem",
            }}
          >
            <span>© {new Date().getFullYear()} Warmindo SH. All rights reserved.</span>
            <span>Dibuat dengan ❤️ & Racikan Cabai Segar</span>
          </div>
        </div>
      </footer>
    </>
  );
}
