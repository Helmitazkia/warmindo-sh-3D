"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
          {/* Floating Images Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            {/* Left Image */}
            <motion.div
              className="float-slow"
              initial={{ opacity: 0, x: 40, rotate: -20, scale: 0.7 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: -10, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              style={{ zIndex: 1, marginRight: "-40px" }}
            >
              <Image
                src="/asset/Mie_Nyemek.png"
                alt="Mie Nyemek"
                width={130}
                height={130}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(249,115,22,0.3))",
                  display: "inline-block",
                }}
              />
            </motion.div>

            {/* Center Image */}
            <motion.div
              className="float-slow"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: 2 }}
            >
              <Image
                src="/asset/The_Floating_Hero_Object.png"
                alt="Mangkuk Warmindo SH"
                width={180}
                height={180}
                style={{
                  width: 170,
                  height: 170,
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(249,115,22,0.4))",
                  display: "inline-block",
                }}
              />
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="float-slow"
              initial={{ opacity: 0, x: -40, rotate: 20, scale: 0.7 }}
              animate={isInView ? { opacity: 1, x: 0, rotate: 10, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{ zIndex: 1, marginLeft: "-40px" }}
            >
              <Image
                src="/asset/Es_Matcha.png"
                alt="Es Matcha"
                width={130}
                height={130}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  filter: "drop-shadow(0 15px 30px rgba(0,200,100,0.3))",
                  display: "inline-block",
                }}
              />
            </motion.div>
          </div>

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
              Pesan sekarang langsung dari meja Anda atau chat lewat WhatsApp. Mie racikan khas, kuah hangat gurih,
              dan es warkop menanti kamu di Warmindo SH.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}
          >
            <Link
              href="/order?table=1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 40px",
                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                borderRadius: 99,
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.1rem",
                textDecoration: "none",
                boxShadow:
                  "0 12px 40px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                transition: "box-shadow 0.3s ease, transform 0.2s ease",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
              className="btn-glow"
            >
              <span style={{ fontSize: "1.4rem" }}>📱</span>
              <span>Self Order di Meja</span>
              <span style={{ fontSize: "1.2rem", opacity: 0.8 }}>→</span>
            </Link>

            <motion.a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 36px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-glass)",
                borderRadius: 99,
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s ease",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>💬</span>
              <span>Pesan via WhatsApp</span>
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
