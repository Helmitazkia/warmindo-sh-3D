import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MenuSection from "./components/MenuSection";
import VibeSection from "./components/VibeSection";
import CTAFooter from "./components/CTAFooter";

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
