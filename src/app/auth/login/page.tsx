// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      const {
        signInWithEmailAndPassword,
        setPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const { isAdmin } = await import("@/lib/firestore");

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const adminCheck = await isAdmin(credential.user.uid);

      toast.success("تم تسجيل الدخول بنجاح");

      if (adminCheck) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.href = "/admin";
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found"
      ) {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً");
      } else {
        toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0d1257 0%, #1a237e 50%, #0d1257 100%)",
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #c9a227, transparent)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3949ab, transparent)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-4xl">⚖️</span>
          </div>
          <h1
            className="text-white text-3xl font-bold"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            المنصة القانونية
          </h1>
          <p
            className="text-blue-200 mt-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            منصة أ.د / اسلام المتر التعليمية
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
        >
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ fontFamily: "'Amiri', serif", color: "#1a237e" }}
          >
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="input-field"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}
              >
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="input-field"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#1a237e",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "14px",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                تذكرني
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
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
                  جاري الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                if (!email) {
                  toast.error("أدخل بريدك الإلكتروني أولاً");
                  return;
                }
                try {
                  const { sendPasswordResetEmail } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebase");
                  await sendPasswordResetEmail(auth, email);
                  toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
                } catch {
                  toast.error("حدث خطأ، تأكد من البريد الإلكتروني");
                }
              }}
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: "13px",
                color: "#1a237e",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: "1px solid #e2e8f0" }}
          >
            <p
              className="text-gray-500 text-sm"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              ليس لديك حساب؟{" "}
              <Link
                href="/auth/register"
                className="font-bold"
                style={{ color: "#1a237e" }}
              >
                سجّل الآن
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-blue-200 text-xs mt-6"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          🔐 محمي بنظام التحقق من الجهاز
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
