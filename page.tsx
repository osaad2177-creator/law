// src/app/admin/requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getSubscriptionRequests,
  approveSubscription,
  rejectSubscription,
} from "@/lib/firestore";
import type { SubscriptionRequest } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionRequests(
        filter === "all" ? undefined : filter
      );
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const handleApprove = async (req: SubscriptionRequest) => {
    if (!user) return;
    setActionLoading(req.id);
    try {
      await approveSubscription(req.id, req.userId, user.uid);
      toast.success(`تم قبول اشتراك ${req.studentName}`);
      loadRequests();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (req: SubscriptionRequest) => {
    if (!user) return;
    setActionLoading(req.id);
    try {
      await rejectSubscription(req.id, req.userId, user.uid);
      toast.error(`تم رفض اشتراك ${req.studentName}`);
      loadRequests();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter(
    (r) =>
      r.studentName.includes(search) ||
      r.phone.includes(search)
  );

  const formatDate = (date: unknown) => {
    if (!date) return "";
    try {
      const d =
        typeof date === "object" && date !== null && "toDate" in date
          ? (date as { toDate: () => Date }).toDate()
          : new Date(date as string);
      return d.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const statusLabels = {
    pending: { text: "قيد المراجعة", cls: "badge-warning" },
    approved: { text: "مقبول", cls: "badge-success" },
    rejected: { text: "مرفوض", cls: "badge-danger" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">طلبات الاشتراك</h1>
        <p className="page-subtitle">مراجعة وإدارة طلبات اشتراك الطلاب</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap items-center">
        {/* Filter */}
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "'Cairo', sans-serif",
                background: filter === f ? "#1a237e" : "white",
                color: filter === f ? "white" : "#475569",
                border: filter === f ? "none" : "1px solid #e2e8f0",
              }}
            >
              {f === "all"
                ? "الكل"
                : f === "pending"
                ? "معلقة"
                : f === "approved"
                ? "مقبولة"
                : "مرفوضة"}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="بحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ maxWidth: "280px" }}
        />
      </div>

      {loading && (
        <div className="text-center py-16">
          <div className="spinner mx-auto" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد طلبات</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-arab">
              <thead>
                <tr>
                  <th>اسم الطالب</th>
                  <th>الفرقة</th>
                  <th>الهاتف</th>
                  <th>وسيلة الدفع</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>إيصال</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td className="font-semibold">{req.studentName}</td>
                    <td>الفرقة {req.academicYear}</td>
                    <td dir="ltr" className="text-right">
                      {req.phone}
                    </td>
                    <td>{req.paymentMethod}</td>
                    <td className="text-sm text-gray-400">
                      {formatDate(req.createdAt)}
                    </td>
                    <td>
                      <span className={`badge ${statusLabels[req.status].cls}`}>
                        {statusLabels[req.status].text}
                      </span>
                    </td>
                    <td>
                      {req.transferImageUrl && (
                        <button
                          onClick={() => setPreviewImage(req.transferImageUrl)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            fontFamily: "'Cairo', sans-serif",
                          }}
                        >
                          عرض الصورة
                        </button>
                      )}
                    </td>
                    <td>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                            style={{
                              background: "#dcfce7",
                              color: "#16a34a",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            {actionLoading === req.id ? "..." : "قبول ✅"}
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            {actionLoading === req.id ? "..." : "رفض ❌"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-bold"
                style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
              >
                صورة التحويل
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <img
              src={previewImage}
              alt="صورة التحويل"
              className="w-full rounded-xl"
              style={{ maxHeight: "500px", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
