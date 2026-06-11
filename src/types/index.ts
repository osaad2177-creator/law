// src/types/index.ts

export type AcademicYear = "الأولى" | "الثانية" | "الثالثة" | "الرابعة";
export type Term = "الأول" | "الثاني";
export type SubscriptionStatus = "مشترك" | "قيد المراجعة" | "غير مشترك";
export type PaymentMethod = "نقدي" | "InstaPay" | "Vodafone Cash";

export interface User {
  uid: string;
  fullName: string;
  academicYear: AcademicYear;
  phone: string;
  email: string;
  createdAt: Date | string;
  subscriptionStatus: SubscriptionStatus;
  isBlocked: boolean;
  deviceFingerprint?: string;
  deviceBoundAt?: Date | string;
  isAdmin?: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  academicYear: AcademicYear;
  term: Term;
  subject: string;
  isFree: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  studentName: string;
  academicYear: AcademicYear;
  phone: string;
  paymentMethod: PaymentMethod;
  transferImageUrl: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date | string;
  reviewedAt?: Date | string;
  reviewedBy?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  createdAt: Date | string;
}

export interface AdminStats {
  totalStudents: number;
  subscribedStudents: number;
  pendingRequests: number;
  totalLectures: number;
  freeLectures: number;
  paidLectures: number;
}

// Curriculum data types
export interface SubjectsByTerm {
  term1: string[];
  term2: string[];
}

export const CURRICULUM: Record<AcademicYear, SubjectsByTerm> = {
  الأولى: {
    term1: [
      "مدخل للعلوم القانونية",
      "نظم سياسية وقانون دستوري",
      "علم الإجرام والعقاب",
      "الشريعة الإسلامية",
    ],
    term2: [
      "منظمات دولية",
      "اقتصاد",
      "تاريخ القانون",
      "مصطلحات قانونية",
      "تطبيقات عملية",
      "قضايا مجتمعية",
    ],
  },
  الثانية: {
    term1: ["قانون مدني", "قانون جنائي", "تاريخ القانون", "قانون دولي"],
    term2: [
      "اقتصاد",
      "قانون إداري",
      "قانون مدني",
      "أحوال شخصية",
      "شريعة إسلامية",
      "تطبيقات عملية",
    ],
  },
  الثالثة: {
    term1: [
      "شريعة إسلامية (مواريث)",
      "مالية عامة وتشريع ضريبي",
      "قانون دولي خاص",
      "قانون تجاري",
      "قضاء إداري",
    ],
    term2: [
      "قانون جنائي",
      "قانون المرافعات",
      "قانون العمل والتأمينات",
      "قانون مدني",
      "تطبيقات عملية",
    ],
  },
  الرابعة: {
    term1: [
      "إجراءات جنائية",
      "تنفيذ جبري",
      "قانون دولي عام",
      "قانون مدني",
      "قانون زراعي",
    ],
    term2: [
      "أصول فقه",
      "قانون بحري وجوي",
      "قانون تجاري",
      "عقود إدارية",
      "تطبيقات عملية",
    ],
  },
};
