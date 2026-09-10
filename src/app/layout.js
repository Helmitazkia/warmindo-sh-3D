import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Warmindo SH — Rasanya Nikmat, Harganya Pas!",
  description:
    "Warmindo SH — kedai mie instan terbaik di Leuwisadeng. Nikmati Indomie Goreng, Pangsit Chili Oil, Mie Nyemek, Es Matcha, dan Es Gula Aren. Harga ramah, rasa bintang lima!",
  keywords: "warmindo, indomie, pangsit chili oil, mie nyemek, es matcha, leuwisadeng, bogor",
  openGraph: {
    title: "Warmindo SH — Rasanya Nikmat, Harganya Pas!",
    description: "Kedai mie instan cozy terbaik di Leuwisadeng. Pesan sekarang via WhatsApp!",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
