// src/app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import toast from "react-hot-toast";
import type { AcademicYear } from "@/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    academicYear: "" as AcademicYear | "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!formData.fullName.trim()) return "يرجى إدخال الاسم الثلاثي";
    if (formData.fullName.trim().split(" ").length < 2)
      return "يرجى إدخال الاسم الثلاثي كاملاً";
    if (!formData.academicYear) return "يرجى اختيار الفرقة الدراسية";
    if (!formData.phone) return "يرجى إدخال رقم الهاتف";
    if (!/^(010|011|012|015)\d{8}$/.test(formData.phone))
      return "يرجى إدخال رقم هاتف مصري صحيح";
    if (!formData.email) return "يرجى إدخال البريد الإلكتروني";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return "يرجى إدخال بريد إلكتروني صحيح";
    if (!formData.password) return "يرجى إدخال كلمة المرور";
    if (formData.password.length < 6)
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (formData.password !== formData.confirmPassword)
      return "كلمة المرور وتأكيدها غير متطابقين";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: formData.fullName,
        academicYear: formData.academicYear as AcademicYear,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
      toast.success("تم إنشاء الحساب بنجاح! مرحباً بك");
setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/email-already-in-use") {
        toast.error("هذا البريد الإلكتروني مسجل بالفعل");
      } else if (error.code === "auth/weak-password") {
        toast.error("كلمة المرور ضعيفة جداً");
      } else {
        toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-10"
      style={{
        background: "linear-gradient(135deg, #0d1257 0%, #1a237e 50%, #0d1257 100%)",
      }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #c9a227, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3949ab, transparent)" }}
        />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
          >
            <span className="text-4xl">⚖️</span>
          </div>
          <h1
            className="text-white text-3xl font-bold"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            إنشاء حساب جديد
          </h1>
          <p className="text-blue-200 mt-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            انضم إلى المنصة القانونية التعليمية
          </p>
        </div>

        {/* Form card */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* الاسم الثلاثي */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                الاسم الثلاثي <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="أدخل اسمك الثلاثي كاملاً"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* الفرقة الدراسية */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                الفرقة الدراسية <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              >
                <option value="">-- اختر الفرقة الدراسية --</option>
                <option value="الأولى">الفرقة الأولى</option>
                <option value="الثانية">الفرقة الثانية</option>
                <option value="الثالثة">الفرقة الثالثة</option>
                <option value="الرابعة">الفرقة الرابعة</option>
              </select>
            </div>

            {/* رقم الهاتف */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                رقم الهاتف (واتساب) <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="مثال: 01012345678"
                className="input-field"
                disabled={loading}
                maxLength={11}
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                البريد الإلكتروني <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                className="input-field"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                كلمة المرور <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="6 أحرف على الأقل"
                className="input-field"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                تأكيد كلمة المرور <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                className="input-field"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-4"
              style={{
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #1a237e, #3949ab)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  جاري إنشاء الحساب...
                </span>
              ) : (
                "إنشاء الحساب"
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid #e2e8f0" }}
          >
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="font-bold"
                style={{ color: "#1a237e" }}
              >
                سجّل دخولك
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-blue-200 text-xs mt-6"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          🔐 سيتم ربط هذا الحساب بجهازك الحالي عند تسجيل الدخول الأول
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
