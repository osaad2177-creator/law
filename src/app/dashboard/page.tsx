// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { getLectures } from "@/lib/firestore";
import type { Lecture, AcademicYear } from "@/types";
import { CURRICULUM } from "@/types";
import VideoPlayer from "@/components/video/VideoPlayer";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(
    (user?.academicYear as AcademicYear) || "الأولى"
  );
  const [selectedTerm, setSelectedTerm] = useState<"الأول" | "الثاني">("الأول");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  const years: AcademicYear[] = user?.isAdmin
    ? ["الأولى", "الثانية", "الثالثة", "الرابعة"]
    : [user?.academicYear as AcademicYear];
  const curriculum = CURRICULUM[selectedYear];
  const subjects =
    selectedTerm === "الأول" ? curriculum.term1 : curriculum.term2;

  useEffect(() => {
    if (user?.academicYear) {
      setSelectedYear(user.academicYear as AcademicYear);
    }
  }, [user]);

  useEffect(() => {
    setSelectedSubject(null);
    setLectures([]);
  }, [selectedYear, selectedTerm]);

  const loadLectures = async (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLecture(null);
    setLoadingLectures(true);
    try {
      const data = await getLectures({
        academicYear: selectedYear,
      });
      const filtered2 = data.filter(
        (l) => l.term === selectedTerm && l.subject === subject
      );
    
      // Filter: show free ones always, paid ones only if subscribed
      const filtered = filtered2.filter(
        (l) => l.isFree || user?.subscriptionStatus === "مشترك"
      );
      setLectures(filtered);
    } catch {
      setLectures([]);
    } finally {
      setLoadingLectures(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">الفرق الدراسية</h1>
        <p className="page-subtitle">اختر الفرقة والترم والمادة لعرض المحاضرات</p>
      </div>

      {/* Year Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              fontFamily: "'Cairo', sans-serif",
              background:
                selectedYear === year
                  ? "linear-gradient(135deg, #1a237e, #3949ab)"
                  : "white",
              color: selectedYear === year ? "white" : "#475569",
              boxShadow:
                selectedYear === year
                  ? "0 4px 15px rgba(26,35,126,0.3)"
                  : "0 1px 4px rgba(0,0,0,0.08)",
              border:
                selectedYear === year
                  ? "none"
                  : "1px solid #e2e8f0",
            }}
          >
            الفرقة {year}
            {user?.academicYear === year && (
              <span className="mr-2 text-xs opacity-75">● فرقتي</span>
            )}
          </button>
        ))}
      </div>

      {/* Term Tabs */}
      <div className="flex gap-3 mb-6">
        {(["الأول", "الثاني"] as const).map((term) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(term)}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              fontFamily: "'Cairo', sans-serif",
              background: selectedTerm === term ? "#c9a227" : "#f1f5f9",
              color: selectedTerm === term ? "white" : "#64748b",
            }}
          >
            الترم {term}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects List */}
        <div className="card p-5">
          <h3
            className="font-bold text-base mb-4"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            📚 المواد الدراسية
          </h3>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => loadLectures(subject)}
                className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  background:
                    selectedSubject === subject
                      ? "linear-gradient(135deg, #1a237e, #3949ab)"
                      : "#f8f9ff",
                  color: selectedSubject === subject ? "white" : "#334155",
                  border:
                    selectedSubject === subject
                      ? "none"
                      : "1px solid #e2e8f0",
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Lectures List */}
        <div className="card p-5">
          <h3
            className="font-bold text-base mb-4"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            🎬 المحاضرات
          </h3>

          {!selectedSubject && (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">📖</div>
              <p style={{ fontFamily: "'Cairo', sans-serif" }}>
                اختر مادة لعرض محاضراتها
              </p>
            </div>
          )}

          {selectedSubject && loadingLectures && (
            <div className="text-center py-10">
              <div className="spinner mx-auto" />
            </div>
          )}

          {selectedSubject && !loadingLectures && lectures.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">🎞️</div>
              <p style={{ fontFamily: "'Cairo', sans-serif" }}>
                لا توجد محاضرات متاحة حالياً
              </p>
              {user?.subscriptionStatus !== "مشترك" && (
                <p
                  className="text-sm mt-2 text-amber-600"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  اشترك للوصول إلى المحاضرات المدفوعة
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {lectures.map((lecture) => (
              <button
                key={lecture.id}
                onClick={() => setSelectedLecture(lecture)}
                className="w-full text-right px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  background:
                    selectedLecture?.id === lecture.id ? "#f0f4ff" : "#f8f9ff",
                  border:
                    selectedLecture?.id === lecture.id
                      ? "2px solid #1a237e"
                      : "1px solid #e2e8f0",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {lecture.title}
                  </span>
                  <span
                    className={`badge text-xs ${
                      lecture.isFree ? "badge-success" : "badge-gold"
                    }`}
                  >
                    {lecture.isFree ? "مجاني" : "مدفوع"}
                  </span>
                </div>
                {lecture.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {lecture.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div className="card p-5">
          <h3
            className="font-bold text-base mb-4"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            ▶️ مشاهدة المحاضرة
          </h3>

          {!selectedLecture ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🎥</div>
              <p style={{ fontFamily: "'Cairo', sans-serif" }}>
                اختر محاضرة للمشاهدة
              </p>
            </div>
          ) : (
            <div>
              <VideoPlayer lecture={selectedLecture} user={user!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
