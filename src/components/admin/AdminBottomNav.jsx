"use client";

import { Home, Grid, Wallet, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Pesanan", path: "/admin", icon: Home },
    { name: "Master", path: "/admin/master", icon: Grid },
    { name: "Keuangan", path: "/admin/finance", icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass rounded-t-3xl border-t border-white/10 mx-2 mb-2 pb-safe">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-14"
            >
              {isActive && (
                <motion.div
                  layoutId="admin-nav-bubble"
                  className="absolute inset-0 bg-orange-500/20 rounded-2xl border border-orange-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={24}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              />
              <span
                className={`relative z-10 text-[10px] mt-1 font-medium transition-colors duration-300 ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
