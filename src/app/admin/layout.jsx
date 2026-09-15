import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin POS - Warmindo SH",
  description: "Dashboard pengelolaan pesanan dan master data Warmindo SH",
};

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--admin-bg)", color: "var(--admin-text)", transition: "background 0.3s, color 0.3s" }}>
      <AdminHeader />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 80px" }}>
        {children}
      </main>
    </div>
  );
}
