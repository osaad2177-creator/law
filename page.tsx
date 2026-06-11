// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/firestore";

interface Stats {
  totalStudents: number;
  subscribedStudents: number;
  pendingRequests: number;
  totalLectures: number;
  freeLectures: number;
  paidLectures: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = stats
    ? [
        {
          label: "إجمالي الطلاب",
          value: stats.totalStudents,
          icon: "👥",
          bg: "#dbeafe",
          color: "#1d4ed8",
        },
        {
          label: "الطلاب المشتركين",
          value: stats.subscribedStudents,
          icon: "✅",
          bg: "#dcfce7",
          color: "#16a34a",
        },
        {
          label: "الطلبات المعلقة",
          value: stats.pendingRequests,
          icon: "⏳",
          bg: "#fef3c7",
          color: "#d97706",
        },
        {
          label: "إجمالي المحاضرات",
          value: stats.totalLectures,
          icon: "🎬",
          bg: "#f3e8ff",
          color: "#7c3aed",
        },
        {
          label: "المحاضرات المجانية",
          value: stats.freeLectures,
          icon: "🆓",
          bg: "#d1fae5",
          color: "#059669",
        },
        {
          label: "المحاضرات المدفوعة",
          value: stats.paidLectures,
          icon: "💎",
          bg: "#fee2e2",
          color: "#dc2626",
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">الإحصائيات العامة</h1>
        <p className="page-subtitle">نظرة عامة على المنصة التعليمية</p>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="spinner mx-auto mb-4" />
          <p style={{ fontFamily: "'Cairo', sans-serif", color: "#94a3b8" }}>
            جاري تحميل الإحصائيات...
          </p>
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: card.bg, fontSize: "28px" }}
                >
                  {card.icon}
                </div>
                <div>
                  <div
                    className="text-3xl font-bold"
                    style={{ color: card.color, fontFamily: "'Cairo', sans-serif" }}
                  >
                    {card.value.toLocaleString("ar-EG")}
                  </div>
                  <div
                    className="text-sm text-gray-500 mt-0.5"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription rate */}
          {stats.totalStudents > 0 && (
            <div className="card p-6 mt-6">
              <h3
                className="font-bold text-base mb-4"
                style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
              >
                📈 معدل الاشتراك
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div
                    className="h-4 rounded-full overflow-hidden"
                    style={{ background: "#e2e8f0" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round(
                          (stats.subscribedStudents / stats.totalStudents) * 100
                        )}%`,
                        background: "linear-gradient(90deg, #1a237e, #3949ab)",
                      }}
                    />
                  </div>
                </div>
                <span
                  className="font-bold text-xl"
                  style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
                >
                  {Math.round(
                    (stats.subscribedStudents / stats.totalStudents) * 100
                  )}
                  %
                </span>
              </div>
              <p
                className="text-sm text-gray-400 mt-2"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {stats.subscribedStudents} من أصل {stats.totalStudents} طالب
                مشترك
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <a
              href="/admin/requests"
              className="card p-5 text-center hover:scale-105 transition-transform"
              style={{ textDecoration: "none" }}
            >
              <div className="text-4xl mb-3">📋</div>
              <div
                className="font-bold"
                style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
              >
                طلبات الاشتراك
              </div>
              {stats.pendingRequests > 0 && (
                <div
                  className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#fee2e2", color: "#dc2626" }}
                >
                  {stats.pendingRequests} طلب معلق
                </div>
              )}
            </a>
            <a
              href="/admin/lectures"
              className="card p-5 text-center hover:scale-105 transition-transform"
              style={{ textDecoration: "none" }}
            >
              <div className="text-4xl mb-3">🎬</div>
              <div
                className="font-bold"
                style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
              >
                إدارة المحاضرات
              </div>
            </a>
            <a
              href="/admin/students"
              className="card p-5 text-center hover:scale-105 transition-transform"
              style={{ textDecoration: "none" }}
            >
              <div className="text-4xl mb-3">👥</div>
              <div
                className="font-bold"
                style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
              >
                إدارة الطلاب
              </div>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
