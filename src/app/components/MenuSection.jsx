"use client";

import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const WA_LINK = `https://wa.me/6285817670115?text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20ya%20%F0%9F%8D%9C`;

const menuItems = [
  {
    id: "indomie-goreng",
    name: "Indomie Goreng",
    desc: "Indomie goreng dengan topping telur, kerupuk, dan sambal spesial rumahan yang nagih!",
    price: "Rp 8.000",
    emoji: "🍜",
    tag: "Best Seller",
    tagColor: "#f97316",
    image: "/asset/Makanan__Disajikan_dalam_mangkuk.png",
    glow: "rgba(249,115,22,0.3)",
  },
  {
    id: "pangsit-chili-oil",
    name: "Pangsit Chili Oil",
    desc: "Pangsit lembut berisi daging dengan siraman chili oil aromatik yang pedas menggoda.",
    price: "Rp 12.000",
    emoji: "🥟",
    tag: "Spicy 🌶️",
    tagColor: "#ef4444",
    image: "/asset/Pangsit_Chili_Oil.png",
    glow: "rgba(239,68,68,0.3)",
  },
  {
    id: "mie-nyemek",
    name: "Mie Nyemek",
    desc: "Paduan kuah dan goreng yang sempurna — kuah sedikit, rasa penuh, bikin ketagihan.",
    price: "Rp 9.000",
    emoji: "🥣",
    tag: "Favorit",
    tagColor: "#8b5cf6",
    image: "/asset/Mie_Nyemek.png",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    id: "es-matcha",
    name: "Es Matcha",
    desc: "Matcha premium dengan susu segar dan sedikit gula aren. Dingin, creamy, sempurna.",
    price: "Rp 10.000",
    emoji: "🍵",
    tag: "Trending",
    tagColor: "#10b981",
    image: "/asset/Es_Matcha.png",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    id: "es-gula-aren",
    name: "Es Gula Aren",
    desc: "Minuman segar dengan gula aren asli Bogor, susu segar, dan es batu yang menyegarkan.",
    price: "Rp 9.000",
    emoji: "🧋",
    tag: "Segar",
    tagColor: "#fbbf24",
    image: "/asset/Es_Gula_Aren.png",
    glow: "rgba(251,191,36,0.3)",
  },
];

function MenuCard({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
    mouseY.set((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div
      ref={ref}
      id={`menu-card-${item.id}`}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="menu-card"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Image area */}
        <div
          style={{
            position: "relative",
            height: 220,
            background: `radial-gradient(circle at center, ${item.glow.replace("0.3", "0.12")} 0%, transparent 70%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <motion.div
            className="float-slow"
            whileHover={{ scale: 1.12, y: -12 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              position: "relative",
              zIndex: 2,
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={200}
              height={200}
              style={{
                width: 190,
                height: 190,
                objectFit: "contain",
                filter: `drop-shadow(0 20px 40px ${item.glow}) drop-shadow(0 0 30px ${item.glow.replace("0.3", "0.15")})`,
              }}
            />
          </motion.div>

          {/* Tag badge */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              padding: "4px 12px",
              background: `${item.tagColor}22`,
              border: `1px solid ${item.tagColor}55`,
              borderRadius: 999,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: item.tagColor,
              letterSpacing: "0.05em",
              zIndex: 3,
            }}
          >
            {item.tag}
          </div>
        </div>

        {/* Info area */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <h3
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {item.emoji} {item.name}
            </h3>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #fbbf24, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                whiteSpace: "nowrap",
                marginLeft: 8,
              }}
            >
              {item.price}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 18 }}>
            {item.desc}
          </p>
          <a
            href={`${WA_LINK}&text=Halo%20Warmindo%20SH!%20Saya%20mau%20pesan%20${encodeURIComponent(item.name)}%20dong%20%F0%9F%8D%9C`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: item.tagColor,
              textDecoration: "none",
              padding: "8px 0",
              transition: "gap 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.gap = "14px"; }}
            onMouseLeave={(e) => { e.currentTarget.style.gap = "8px"; }}
          >
            <span>Pesan sekarang</span>
            <span>→</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MenuSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="menu" style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      {/* ambient */}
      <div
        className="blob"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          position: "absolute",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: 72 }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <span className="section-label">🍽️ Menu Andalan</span>
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
            Pilihan{" "}
            <span className="gradient-text">Best Sellers</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto" }}>
            Dimasak segar setiap hari, dijamin bikin nagih. Pilih favoritmu!
          </p>
        </motion.div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {menuItems.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: "center", marginTop: 60 }}
        >
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <span>📋</span>
            <span>Lihat Menu Lengkap di WA</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
