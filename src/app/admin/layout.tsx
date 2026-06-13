// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";

const adminNavItems = [
  { href: "/admin", label: "الإحصائيات", icon: "📊", exact: true },
  { href: "/admin/requests", label: "طلبات الاشتراك", icon: "📋" },
  { href: "/admin/lectures", label: "إدارة المحاضرات", icon: "🎬" },
  { href: "/admin/students", label: "إدارة الطلاب", icon: "👥" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user && !isAdmin) {
        router.push("/auth/login");
      }
    }
  }, [user, isAdmin, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f0f4ff" }} dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-90 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className="sidebar"
        style={{
          background: "linear-gradient(180deg, #0a0e45, #1a237e)",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <div className="text-white font-bold text-lg" style={{ fontFamily: "'Amiri', serif" }}>
                لوحة الإدارة
              </div>
              <div className="text-yellow-300 text-xs mt-0.5 font-semibold">
                🔐 Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div
          className="px-5 py-4 mx-3 mt-4 rounded-xl"
          style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.3)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: "#c9a227", color: "#1a237e" }}
            >
              👑
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{user?.fullName}</div>
              <div className="text-yellow-300 text-xs">مدير النظام</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href, item.exact) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-600 transition-all text-sm mb-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <span>🏠</span>
            <span>الصفحة الرئيسية</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:text-white hover:bg-red-600 transition-all"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 500 }}
          >
            <span className="text-xl">🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginRight: "260px" }}>
        <header
          className="bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ background: "#f0f4ff" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600 mb-1" />
            <div className="w-5 h-0.5 bg-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              👑 مدير النظام
            </span>
          </div>

          <div className="text-sm text-gray-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
            لوحة تحكم المدير
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(100%) !important; }
          .sidebar.open { transform: translateX(0) !important; }
          div[style*="marginRight: 260px"] { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  );
}
