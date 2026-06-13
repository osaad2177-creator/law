// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "الفرق الدراسية", icon: "🎓", exact: true },
  { href: "/dashboard/free-lectures", label: "المحاضرات المجانية", icon: "🎬" },
  { href: "/dashboard/subscription", label: "الاشتراك والدفع", icon: "💳" },
  { href: "/dashboard/profile", label: "الملف الشخصي", icon: "👤" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !user) {
        router.push("/auth/login");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ fontFamily: "'Cairo', sans-serif", color: "#1a237e" }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f0f4ff" }} dir="rtl">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          style={{ zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          background: "linear-gradient(180deg, #0d1257 0%, #1a237e 100%)",
          minHeight: "100vh",
          width: "260px",
          position: "fixed",
          right: 0,
          top: 0,
          zIndex: 100,
          transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
        className="md:translate-x-0"
      >
        {/* Logo */}
        <div
          className="p-6 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <div
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                المنصة القانونية
              </div>
              <div className="text-blue-200 text-xs mt-0.5">
                {user.academicYear ? `الفرقة ${user.academicYear}` : "طالب"}
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div
          className="px-5 py-4 mx-3 mt-4 rounded-xl"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ background: "rgba(201,162,39,0.6)" }}
            >
              {user.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">
                {user.fullName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`badge text-xs ${
                    user.subscriptionStatus === "مشترك"
                      ? "badge-success"
                      : user.subscriptionStatus === "قيد المراجعة"
                      ? "badge-warning"
                      : "badge-danger"
                  }`}
                  style={{ fontSize: "10px", padding: "2px 8px" }}
                >
                  {user.subscriptionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                isActive(item.href, item.exact) ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:text-white hover:bg-red-600 transition-all duration-200"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 500 }}
          >
            <span className="text-xl">🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="transition-all duration-300 md:mr-[260px] mr-0">
        {/* Top bar */}
        <header
          className="bg-white sticky top-0 z-50 px-4 py-4 flex items-center justify-between"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          {/* Hamburger - always visible on mobile */}
          <button
            className="p-2 rounded-lg flex flex-col gap-1 md:hidden"
            style={{ background: "#f0f4ff" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className="w-5 h-0.5 bg-gray-600" />
            <div className="w-5 h-0.5 bg-gray-600" />
            <div className="w-5 h-0.5 bg-gray-600" />
          </button>

          <div
            className="text-gray-400 text-sm"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            مرحباً،{" "}
            <strong className="text-gray-700">
              {user.fullName?.split(" ")[0]}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`badge ${
                user.subscriptionStatus === "مشترك"
                  ? "badge-success"
                  : user.subscriptionStatus === "قيد المراجعة"
                  ? "badge-warning"
                  : "badge-danger"
              }`}
            >
              {user.subscriptionStatus}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
