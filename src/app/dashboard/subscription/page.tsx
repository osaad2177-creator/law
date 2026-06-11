// src/app/dashboard/subscription/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { createSubscriptionRequest } from "@/lib/firestore";
import toast from "react-hot-toast";
import type { PaymentMethod } from "@/types";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentName: user?.fullName || "",
    phone: user?.phone || "",
    paymentMethod: "" as PaymentMethod | "",
    notes: "",
  });
  const [transferImageBase64, setTransferImageBase64] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const PAYMENT_NUMBER = "01017693700";

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: "نقدي", label: "نقدي", icon: "💵" },
    { value: "InstaPay", label: "InstaPay", icon: "💳" },
    { value: "Vodafone Cash", label: "Vodafone Cash", icon: "📱" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setTransferImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentName) return toast.error("يرجى إدخال اسم الطالب");
    if (!formData.phone) return toast.error("يرجى إدخال رقم الهاتف");
    if (!formData.paymentMethod) return toast.error("يرجى اختيار وسيلة الدفع");
    if (!transferImageBase64) return toast.error("يرجى رفع صورة التحويل");
    if (!user) return;

    setSubmitting(true);
    try {
      await createSubscriptionRequest({
        userId: user.uid,
        studentName: formData.studentName,
        academicYear: user.academicYear,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod as PaymentMethod,
        transferImageUrl: transferImageBase64,
        notes: formData.notes,
      });
      setSubmitted(true);
      toast.success("تم إرسال طلب الاشتراك بنجاح! سيتم مراجعته قريباً");
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.subscriptionStatus === "مشترك") {
    return (
      <div>
        <h1 className="page-title">الاشتراك والدفع</h1>
        <div className="card p-10 text-center max-w-md mx-auto mt-8">
          <div className="text-6xl mb-4">✅</div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Amiri', serif", color: "#16a34a" }}
          >
            أنت مشترك بالفعل
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            لديك وصول كامل لجميع المحاضرات. استمتع بالتعلم!
          </p>
        </div>
      </div>
    );
  }

  if (user?.subscriptionStatus === "قيد المراجعة" || submitted) {
    return (
      <div>
        <h1 className="page-title">الاشتراك والدفع</h1>
        <div className="card p-10 text-center max-w-md mx-auto mt-8">
          <div className="text-6xl mb-4">⏳</div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Amiri', serif", color: "#d97706" }}
          >
            طلبك قيد المراجعة
          </h2>
          <p
            className="text-gray-500"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            تم استلام طلبك وسيتم مراجعته من قِبل الإدارة في أقرب وقت. سيتم
            تفعيل اشتراكك بعد التأكيد.
          </p>
          <div
            className="mt-4 p-3 rounded-xl text-sm"
            style={{
              background: "#fef3c7",
              color: "#92400e",
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            للاستفسار: واتساب على{" "}
            <strong>{PAYMENT_NUMBER}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">الاشتراك والدفع</h1>
      <p className="page-subtitle">سجّل اشتراكك للوصول إلى جميع المحاضرات</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment info */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3
              className="font-bold text-lg mb-4"
              style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
            >
              💳 طرق الدفع المتاحة
            </h3>
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                className="flex items-center gap-3 p-3 rounded-xl mb-2"
                style={{ background: "#f8f9ff", border: "1px solid #e2e8f0" }}
              >
                <span className="text-2xl">{method.icon}</span>
                <span
                  className="font-semibold"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {method.label}
                </span>
              </div>
            ))}

            <div
              className="mt-4 p-4 rounded-xl text-center"
              style={{ background: "linear-gradient(135deg, #1a237e, #3949ab)" }}
            >
              <p
                className="text-white text-sm mb-1"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                رقم الدفع / واتساب
              </p>
              <p className="text-white text-2xl font-bold" dir="ltr">
                {PAYMENT_NUMBER}
              </p>
            </div>
          </div>

          <div
            className="card p-5"
            style={{ border: "1px solid #fde68a", background: "#fffbeb" }}
          >
            <p
              className="text-amber-800 text-sm font-semibold leading-relaxed"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              📌 بعد التحويل يرجى إرسال صورة التحويل واسم الطالب عبر واتساب
              لتأكيد الاشتراك.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <h3
            className="font-bold text-lg mb-5"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            📋 طلب الاشتراك
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                اسم الطالب
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, studentName: e.target.value }))
                }
                className="input-field"
                disabled={submitting}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                className="input-field"
                disabled={submitting}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                وسيلة الدفع
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                className="input-field"
                disabled={submitting}
              >
                <option value="">-- اختر وسيلة الدفع --</option>
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.icon} {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                صورة التحويل <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={submitting}
                className="w-full text-sm"
                style={{
                  padding: "10px",
                  border: "2px dashed #cbd5e1",
                  borderRadius: "10px",
                  fontFamily: "'Cairo', sans-serif",
                  cursor: "pointer",
                }}
              />
              {imageFile && (
                <p
                  className="text-green-600 text-xs mt-1"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  ✅ تم اختيار: {imageFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                ملاحظات (اختياري)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                className="input-field"
                disabled={submitting}
                style={{ resize: "vertical" }}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3"
              style={{
                background: submitting
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #c9a227, #e8c547)",
              }}
            >
              {submitting ? "جاري الإرسال..." : "إرسال طلب الاشتراك"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
