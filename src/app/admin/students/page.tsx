// src/app/admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserProfile,
  deleteUser,
  resetUserDevice,
} from "@/lib/firestore";
import type { User, SubscriptionStatus } from "@/types";
import toast from "react-hot-toast";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const handleAction = async (uid: string, action: string) => {
    setActionLoading(`${uid}-${action}`);
    try {
      switch (action) {
        case "activate":
          await updateUserProfile(uid, { subscriptionStatus: "مشترك" });
          toast.success("تم تفعيل الاشتراك");
          break;
        case "deactivate":
          await updateUserProfile(uid, { subscriptionStatus: "غير مشترك" });
          toast.success("تم إيقاف الاشتراك");
          break;
        case "block":
          await updateUserProfile(uid, { isBlocked: true });
          toast.success("تم حظر الطالب");
          break;
        case "unblock":
          await updateUserProfile(uid, { isBlocked: false });
          toast.success("تم فك الحظر");
          break;
        case "reset_device":
          await resetUserDevice(uid);
          toast.success("تم إعادة تعيين الجهاز");
          break;
        case "delete":
          if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
          await deleteUser(uid);
          toast.success("تم حذف الطالب");
          break;
      }
      loadStudents();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName?.includes(search) ||
      s.email?.includes(search) ||
      s.phone?.includes(search);
    const matchYear = filterYear ? s.academicYear === filterYear : true;
    const matchStatus = filterStatus ? s.subscriptionStatus === filterStatus : true;
    return matchSearch && matchYear && matchStatus;
  });

  const statusBadge = (s: User) => {
    const map: Record<string, { cls: string }> = {
      مشترك: { cls: "badge-success" },
      "قيد المراجعة": { cls: "badge-warning" },
      "غير مشترك": { cls: "badge-danger" },
    };
    return map[s.subscriptionStatus] || { cls: "badge-info" };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">إدارة الطلاب</h1>
        <p className="page-subtitle">عرض وإدارة جميع الطلاب المسجلين</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ maxWidth: "300px" }}
        />
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input-field" style={{ maxWidth: "180px" }}>
          <option value="">كل الفرق</option>
          <option value="الأولى">الفرقة الأولى</option>
          <option value="الثانية">الفرقة الثانية</option>
          <option value="الثالثة">الفرقة الثالثة</option>
          <option value="الرابعة">الفرقة الرابعة</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field" style={{ maxWidth: "180px" }}>
          <option value="">كل الحالات</option>
          <option value="مشترك">مشترك</option>
          <option value="قيد المراجعة">قيد المراجعة</option>
          <option value="غير مشترك">غير مشترك</option>
        </select>
        <div className="text-sm text-gray-400 self-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
          إجمالي: {filtered.length} طالب
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="spinner mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">👥</div>
          <p style={{ fontFamily: "'Cairo', sans-serif" }}>لا يوجد طلاب</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-arab">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الفرقة</th>
                  <th>البريد</th>
                  <th>الهاتف</th>
                  <th>الحالة</th>
                  <th>الجهاز</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const isLoading = actionLoading?.startsWith(s.uid);
                  return (
                    <tr key={s.uid} style={{ opacity: s.isBlocked ? 0.6 : 1 }}>
                      <td>
                        <div className="font-semibold">{s.fullName}</div>
                        {s.isBlocked && (
                          <span className="badge badge-danger text-xs">محظور</span>
                        )}
                      </td>
                      <td>الفرقة {s.academicYear}</td>
                      <td className="text-sm text-gray-500">{s.email}</td>
                      <td dir="ltr" className="text-right text-sm">{s.phone}</td>
                      <td>
                        <span className={`badge ${statusBadge(s).cls}`}>
                          {s.subscriptionStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.deviceFingerprint ? "badge-success" : "badge-warning"}`}>
                          {s.deviceFingerprint ? "مرتبط" : "غير مرتبط"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {s.subscriptionStatus !== "مشترك" ? (
                            <button
                              onClick={() => handleAction(s.uid, "activate")}
                              disabled={isLoading}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ background: "#dcfce7", color: "#16a34a", fontFamily: "'Cairo', sans-serif" }}
                            >
                              تفعيل
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(s.uid, "deactivate")}
                              disabled={isLoading}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ background: "#fef3c7", color: "#d97706", fontFamily: "'Cairo', sans-serif" }}
                            >
                              إيقاف
                            </button>
                          )}
                          {!s.isBlocked ? (
                            <button
                              onClick={() => handleAction(s.uid, "block")}
                              disabled={isLoading}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ background: "#fee2e2", color: "#dc2626", fontFamily: "'Cairo', sans-serif" }}
                            >
                              حظر
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(s.uid, "unblock")}
                              disabled={isLoading}
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{ background: "#dbeafe", color: "#1d4ed8", fontFamily: "'Cairo', sans-serif" }}
                            >
                              فك الحظر
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(s.uid, "reset_device")}
                            disabled={isLoading}
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{ background: "#f3e8ff", color: "#7c3aed", fontFamily: "'Cairo', sans-serif" }}
                          >
                            إعادة الجهاز
                          </button>
                          <button
                            onClick={() => handleAction(s.uid, "delete")}
                            disabled={isLoading}
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{ background: "#f1f5f9", color: "#64748b", fontFamily: "'Cairo', sans-serif" }}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
