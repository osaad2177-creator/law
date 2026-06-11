// src/app/dashboard/free-lectures/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { getFreeLectures } from "@/lib/firestore";
import type { Lecture } from "@/types";
import VideoPlayer from "@/components/video/VideoPlayer";

export default function FreeLecturesPage() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [filterYear, setFilterYear] = useState<string>("الكل");

  const years = ["الكل", "الأولى", "الثانية", "الثالثة", "الرابعة"];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFreeLectures();
        setLectures(data);
      } catch {
        setLectures([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    filterYear === "الكل"
      ? lectures
      : lectures.filter((l) => l.academicYear === filterYear);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">المحاضرات المجانية</h1>
        <p className="page-subtitle">محاضرات مجانية متاحة لجميع الطلاب</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setFilterYear(year)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              fontFamily: "'Cairo', sans-serif",
              background:
                filterYear === year
                  ? "linear-gradient(135deg, #1a237e, #3949ab)"
                  : "white",
              color: filterYear === year ? "white" : "#475569",
              border: filterYear === year ? "none" : "1px solid #e2e8f0",
              boxShadow:
                filterYear === year
                  ? "0 4px 15px rgba(26,35,126,0.3)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {year === "الكل" ? "الكل" : `الفرقة ${year}`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="spinner mx-auto mb-4" />
          <p style={{ fontFamily: "'Cairo', sans-serif", color: "#94a3b8" }}>
            جاري تحميل المحاضرات...
          </p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <p
            className="text-gray-400 text-lg"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            لا توجد محاضرات مجانية متاحة حالياً
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lecture list */}
          <div className="lg:col-span-1 space-y-3">
            {filtered.map((lecture) => (
              <button
                key={lecture.id}
                onClick={() => setSelectedLecture(lecture)}
                className="w-full text-right card p-4 transition-all"
                style={{
                  border:
                    selectedLecture?.id === lecture.id
                      ? "2px solid #1a237e"
                      : "1px solid #e2e8f0",
                  background:
                    selectedLecture?.id === lecture.id ? "#f0f4ff" : "white",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🎬</span>
                  <div className="flex-1">
                    <p
                      className="font-semibold text-sm text-gray-800 mb-1"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {lecture.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-info text-xs">
                        {lecture.subject}
                      </span>
                      <span className="badge badge-success text-xs">مجاني</span>
                      <span className="text-xs text-gray-400">
                        الفرقة {lecture.academicYear}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Player */}
          <div className="lg:col-span-2">
            {selectedLecture ? (
              <div className="card p-5">
                <VideoPlayer lecture={selectedLecture} user={user!} />
              </div>
            ) : (
              <div
                className="card p-16 text-center"
                style={{ border: "2px dashed #e2e8f0" }}
              >
                <div className="text-5xl mb-4">▶️</div>
                <p
                  className="text-gray-400"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  اختر محاضرة للمشاهدة
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
