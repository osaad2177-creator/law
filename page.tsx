// src/app/admin/lectures/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture,
} from "@/lib/firestore";
import type { Lecture, AcademicYear } from "@/types";
import { CURRICULUM } from "@/types";
import toast from "react-hot-toast";

const emptyForm = {
  title: "",
  description: "",
  youtubeUrl: "",
  academicYear: "" as AcademicYear | "",
  term: "" as "الأول" | "الثاني" | "",
  subject: "",
  isFree: false,
};

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const loadLectures = async () => {
    setLoading(true);
    try {
      const data = await getLectures(
        filterYear ? { academicYear: filterYear } : undefined
      );
      setLectures(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, [filterYear]);

  const subjects =
    form.academicYear && form.term
      ? CURRICULUM[form.academicYear as AcademicYear][
          form.term === "الأول" ? "term1" : "term2"
        ]
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.youtubeUrl || !form.academicYear || !form.term || !form.subject) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateLecture(editingId, {
          title: form.title,
          description: form.description,
          youtubeUrl: form.youtubeUrl,
          academicYear: form.academicYear as AcademicYear,
          term: form.term as "الأول" | "الثاني",
          subject: form.subject,
          isFree: form.isFree,
        });
        toast.success("تم تعديل المحاضرة بنجاح");
      } else {
        await createLecture({
          title: form.title,
          description: form.description,
          youtubeUrl: form.youtubeUrl,
          academicYear: form.academicYear as AcademicYear,
          term: form.term as "الأول" | "الثاني",
          subject: form.subject,
          isFree: form.isFree,
        });
        toast.success("تم إضافة المحاضرة بنجاح");
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      loadLectures();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setForm({
      title: lecture.title,
      description: lecture.description,
      youtubeUrl: lecture.youtubeUrl,
      academicYear: lecture.academicYear,
      term: lecture.term,
      subject: lecture.subject,
      isFree: lecture.isFree,
    });
    setEditingId(lecture.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف محاضرة "${title}"؟`)) return;
    try {
      await deleteLecture(id);
      toast.success("تم حذف المحاضرة");
      loadLectures();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const filtered = lectures.filter(
    (l) =>
      l.title.includes(search) ||
      l.subject.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">إدارة المحاضرات</h1>
          <p className="page-subtitle">إضافة وتعديل وحذف المحاضرات</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="btn-primary"
        >
          {showForm ? "إلغاء" : "+ إضافة محاضرة"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3
            className="font-bold text-lg mb-5"
            style={{ color: "#1a237e", fontFamily: "'Cairo', sans-serif" }}
          >
            {editingId ? "✏️ تعديل المحاضرة" : "➕ إضافة محاضرة جديدة"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                الفرقة <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={form.academicYear}
                onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value as AcademicYear, subject: "" }))}
                className="input-field"
              >
                <option value="">-- اختر الفرقة --</option>
                <option value="الأولى">الفرقة الأولى</option>
                <option value="الثانية">الفرقة الثانية</option>
                <option value="الثالثة">الفرقة الثالثة</option>
                <option value="الرابعة">الفرقة الرابعة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                الترم <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={form.term}
                onChange={(e) => setForm((p) => ({ ...p, term: e.target.value as "الأول" | "الثاني", subject: "" }))}
                className="input-field"
              >
                <option value="">-- اختر الترم --</option>
                <option value="الأول">الترم الأول</option>
                <option value="الثاني">الترم الثاني</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                المادة <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="input-field"
                disabled={subjects.length === 0}
              >
                <option value="">-- اختر المادة --</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                نوع المحاضرة <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  <input
                    type="radio"
                    name="isFree"
                    checked={form.isFree === true}
                    onChange={() => setForm((p) => ({ ...p, isFree: true }))}
                  />
                  <span className="badge badge-success">مجاني</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  <input
                    type="radio"
                    name="isFree"
                    checked={form.isFree === false}
                    onChange={() => setForm((p) => ({ ...p, isFree: false }))}
                  />
                  <span className="badge badge-gold">مدفوع</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                عنوان المحاضرة <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="عنوان المحاضرة"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                رابط يوتيوب (Unlisted) <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-field"
                dir="ltr"
              />
              <p className="text-xs text-amber-600 mt-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                ⚠️ تأكد من أن الفيديو مضبوط على "غير مدرج" (Unlisted) في يوتيوب
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#334155", fontFamily: "'Cairo', sans-serif" }}>
                وصف المحاضرة
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="input-field"
                style={{ resize: "vertical" }}
                placeholder="وصف مختصر للمحاضرة..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}
                className="btn-ghost"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة المحاضرة"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="بحث بالعنوان أو المادة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ maxWidth: "280px" }}
        />
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="input-field"
          style={{ maxWidth: "200px" }}
        >
          <option value="">كل الفرق</option>
          <option value="الأولى">الفرقة الأولى</option>
          <option value="الثانية">الفرقة الثانية</option>
          <option value="الثالثة">الفرقة الثالثة</option>
          <option value="الرابعة">الفرقة الرابعة</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16"><div className="spinner mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎬</div>
          <p style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد محاضرات</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-arab">
              <thead>
                <tr>
                  <th>عنوان المحاضرة</th>
                  <th>الفرقة</th>
                  <th>الترم</th>
                  <th>المادة</th>
                  <th>النوع</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lec) => (
                  <tr key={lec.id}>
                    <td className="font-semibold max-w-xs truncate">{lec.title}</td>
                    <td>الفرقة {lec.academicYear}</td>
                    <td>الترم {lec.term}</td>
                    <td>{lec.subject}</td>
                    <td>
                      <span className={`badge ${lec.isFree ? "badge-success" : "badge-gold"}`}>
                        {lec.isFree ? "مجاني" : "مدفوع"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(lec)}
                          className="px-3 py-1 rounded-lg text-xs font-bold"
                          style={{ background: "#dbeafe", color: "#1d4ed8", fontFamily: "'Cairo', sans-serif" }}
                        >
                          تعديل ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(lec.id, lec.title)}
                          className="px-3 py-1 rounded-lg text-xs font-bold"
                          style={{ background: "#fee2e2", color: "#dc2626", fontFamily: "'Cairo', sans-serif" }}
                        >
                          حذف 🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
