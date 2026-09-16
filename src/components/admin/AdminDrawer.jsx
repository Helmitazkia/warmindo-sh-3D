"use client";

import { Home, LayoutGrid, Wallet, X, ChefHat, ShoppingBag, BarChart3, Layers, QrCode } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Pesanan Aktif", path: "/admin", icon: ShoppingBag, desc: "Kelola antrean pesanan" },
  { name: "Kelola Produk", path: "/admin/master", icon: LayoutGrid, desc: "Stok & ketersediaan menu" },
  { name: "Master Kategori", path: "/admin/categories", icon: Layers, desc: "Grup menu & urutan katalog" },
  { name: "Master Meja & QR", path: "/admin/tables", icon: QrCode, desc: "Kapasitas meja & cetak QR" },
  { name: "Laporan Keuangan", path: "/admin/finance", icon: BarChart3, desc: "Pemasukan & pengeluaran" },
];

export default function AdminDrawer({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-500 px-5 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ChefHat size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white leading-tight">Warmindo SH</h2>
                  <p className="text-blue-100 text-xs font-medium">Admin & Kasir</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-4">Menu Utama</p>
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                      <Icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-blue-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className={`text-xs truncate mt-0.5 ${isActive ? "text-blue-100" : "text-gray-400"}`}>{item.desc}</p>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-white shrink-0" />}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  K
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">Kasir Utama</p>
                  <p className="text-xs text-gray-500">Warmindo SH • Tebet Barat</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
