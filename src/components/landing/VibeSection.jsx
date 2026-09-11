"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const WA_LINK = `https://wa.me/6285817670115?text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20ya%20%F0%9F%8D%9C`;
const GMAPS_LINK = "https://maps.google.com/?q=Leuwisadeng,Bogor,Jawa+Barat";

const infoItems = [
  { icon: "📍", label: "Alamat", value: "Jl raya, Leuwisadeng, Kec. Leuwisadeng, Kabupaten Bogor, Jawa Barat 16640" },
  { icon: "⏰", label: "Jam Buka", value: "Setiap Hari — 10.00 s/d 22.00 WIB" },
  { icon: "📞", label: "WhatsApp", value: "+62 858-1767-0115" },
  { icon: "🛵", label: "Layanan", value: "Makan di tempat & Take away" },
];

export default function VibeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="lokasi"
      style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}
    >
      {/* Ambients */}
      <div
        className="blob"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          top: "20%",
          right: "-10%",
          position: "absolute",
          animation: "pulse-glow 5s ease-in-out infinite",
        }}
      />
      <div
        className="blob"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          bottom: "10%",
          left: "-5%",
          position: "absolute",
          animation: "pulse-glow 7s ease-in-out infinite 1s",
        }}
      />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}
        ref={ref}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <span className="section-label">🏮 Suasana & Lokasi</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-poppins), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Tempat{" "}
            <span className="gradient-text">Nongkrong</span>
            {" "}Asik
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto" }}>
            Suasana cozy, harga bersahabat, dan tentunya rasa yang bikin kamu balik lagi!
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
          className="vibe-grid"
        >
          {/* LEFT — Diorama Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", display: "flex", justifyContent: "center" }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                inset: "10%",
                background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
                borderRadius: "50%",
                animation: "pulse-glow 4s ease-in-out infinite",
              }}
            />

            <motion.div
              className="float-slow"
              whileHover={{ scale: 1.04, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Image
                src="/asset/The_Cozy_Diorama__Miniatur_Toko.png"
                alt="Miniatur Kedai Warmindo SH yang cozy"
                width={520}
                height={520}
                style={{
                  width: "100%",
                  maxWidth: 480,
                  height: "auto",
                  objectFit: "contain",
                  filter:
                    "drop-shadow(0 30px 60px rgba(0,0,0,0.5)) drop-shadow(0 0 50px rgba(249,115,22,0.2))",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </motion.div>

            {/* Floating props */}
            <motion.div
              className="float-reverse"
              style={{
                position: "absolute",
                bottom: "5%",
                right: "5%",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "12px 18px",
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4 }}>Kedai kami</div>
              <div style={{ fontWeight: 700, color: "#f97316", fontSize: "0.9rem" }}>
                🏠 Warmindo SH
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 }}>Leuwisadeng, Bogor</div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Info */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
              {infoItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: 14,
                    transition: "all 0.3s",
                    cursor: "default",
                  }}
                  whileHover={{
                    background: "rgba(249,115,22,0.05)",
                    borderColor: "rgba(249,115,22,0.2)",
                    x: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.4rem",
                      width: 44,
                      height: 44,
                      background: "rgba(249,115,22,0.1)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {item.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href={GMAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>🗺️</span>
                <span>Buka Google Maps</span>
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <span>💬</span>
                <span>Chat WA</span>
              </a>
            </div>

            {/* Open status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
                padding: "8px 16px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 999,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#34d399",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 8px rgba(52,211,153,0.7)",
                  animation: "pulse-glow 2s infinite",
                  display: "inline-block",
                }}
              />
              Buka Sekarang — Sampai jam 22.00
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .vibe-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
