// src/app/dashboard/profile/page.tsx
"use client";

import { useAuth } from "@/lib/authContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "غير محدد";
    try {
      const d =
        typeof date === "string" || date instanceof Date
          ? new Date(date as string)
          : (date as { toDate: () => Date }).toDate?.() ?? new Date(date as string);
      return format(d, "dd MMMM yyyy", { locale: ar });
    } catch {
      return "غير محدد";
    }
  };

  const statusConfig = {
    مشترك: { bg: "#dcfce7", color: "#16a34a", icon: "✅" },
    "قيد المراجعة": { bg: "#fef3c7", color: "#d97706", icon: "⏳" },
    "غير مشترك": { bg: "#fee2e2", color: "#dc2626", icon: "❌" },
  };

  const status = statusConfig[user.subscriptionStatus] || statusConfig["غير مشترك"];

  const fields = [
    { label: "الاسم الثلاثي", value: user.fullName, icon: "👤" },
    { label: "الفرقة الدراسية", value: `الفرقة ${user.academicYear}`, icon: "🎓" },
    { label: "البريد الإلكتروني", value: user.email, icon: "📧" },
    { label: "رقم الهاتف", value: user.phone, icon: "📱" },
    { label: "تاريخ التسجيل", value: formatDate(user.createdAt), icon: "📅" },
  ];

  return (
    <div>
      <h1 className="page-title">الملف الشخصي</h1>
      <p className="page-subtitle">معلوماتك الشخصية وحالة اشتراكك</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-8 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #1a237e, #3949ab)",
              boxShadow: "0 8px 25px rgba(26,35,126,0.3)",
            }}
          >
            {user.fullName?.charAt(0)}
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Amiri', serif", color: "#1a237e" }}
          >
            {user.fullName}
          </h2>
          <p
            className="text-gray-500 text-sm mb-4"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            الفرقة {user.academicYear}
          </p>

          {/* Subscription status badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
            style={{
              background: status.bg,
              color: status.color,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            <span>{status.icon}</span>
            <span>حالة الاشتراك: {user.subscriptionStatus}</span>
          </div>

          {user.subscriptionStatus !== "مشترك" && (
            <div className="mt-4">
              <a
                href="/dashboard/subscription"
                className="btn-primary text-sm"
                style={{
                  textDecoration: "none",
                  padding: "8px 20px",
                  display: "inline-flex",
                }}
              >
                اشترك الآن
              </a>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="card p-6 md:col-span-2">
          <h3
            className="font-bold text-lg mb-5"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            البيانات الشخصية
          </h3>
          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "#f8f9ff" }}
              >
                <span className="text-2xl">{field.icon}</span>
                <div>
                  <div
                    className="text-xs text-gray-400 mb-0.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {field.label}
                  </div>
                  <div
                    className="font-semibold text-gray-800"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {field.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device info */}
      <div className="card p-6 mt-6">
        <h3
          className="font-bold text-base mb-3"
          style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
        >
          🔒 معلومات الأمان
        </h3>
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
        >
          <span className="text-2xl">📱</span>
          <div>
            <p
              className="font-semibold text-blue-800"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              هذا الحساب مرتبط بجهازك الحالي
            </p>
            <p
              className="text-blue-600 text-sm mt-1"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              لا يمكن تسجيل الدخول من جهاز آخر. للتغيير، تواصل مع الإدارة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
