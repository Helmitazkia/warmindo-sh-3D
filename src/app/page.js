import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import MenuSection from "@/components/landing/MenuSection";
import VibeSection from "@/components/landing/VibeSection";
import CTAFooter from "@/components/landing/CTAFooter";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />

      {/* Divider */}
      <div className="gradient-divider" style={{ margin: "0 5%" }} />

      <MenuSection />

      {/* Divider */}
      <div className="gradient-divider" style={{ margin: "0 5%" }} />

      <VibeSection />

      <CTAFooter />
    </main>
  );
}
