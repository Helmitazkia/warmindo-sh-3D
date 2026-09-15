"use client";

import { Home, Grid, Wallet, Coffee } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Pesanan", path: "/admin", icon: Home },
    { name: "Master", path: "/admin/master", icon: Grid },
    { name: "Keuangan", path: "/admin/finance", icon: Wallet },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-black/40 backdrop-blur-3xl z-50">
      <div className="p-6 pb-2 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Coffee size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">Warmindo SH</h2>
          <p className="text-xs text-orange-400 uppercase tracking-widest font-semibold">Admin POS</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? "text-orange-400 font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-bubble"
                  className="absolute inset-0 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="glass p-4 rounded-xl text-center border-orange-500/20 bg-orange-500/5">
          <p className="text-xs text-gray-400">Login sebagai</p>
          <p className="font-bold text-white text-sm">Kasir Utama</p>
        </div>
      </div>
    </aside>
  );
}
