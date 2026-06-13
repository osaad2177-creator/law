// src/lib/firestore.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User, Lecture, SubscriptionRequest } from "@/types";

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: Omit<User, "uid" | "createdAt">
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    subscriptionStatus: "غير مشترك",
    isBlocked: false,
  });
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as User;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<User>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), data);
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as User));
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

export async function setUserDeviceFingerprint(
  uid: string,
  fingerprint: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    deviceFingerprint: fingerprint,
    deviceBoundAt: serverTimestamp(),
  });
  await addDoc(collection(db, "device_registry"), {
    userId: uid,
    fingerprint,
    boundAt: serverTimestamp(),
  });
}

export async function resetUserDevice(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    deviceFingerprint: null,
    deviceBoundAt: null,
  });
}

// ─── Admin check ─────────────────────────────────────────────────────────────

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    console.log("isAdmin check:", uid, "exists:", snap.exists());
    return snap.exists();
  } catch (error) {
    console.error("isAdmin error:", error);
    // Try alternative check via users collection
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists() && userSnap.data()?.isAdmin === true) {
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}

// ─── Lectures ─────────────────────────────────────────────────────────────────

export async function createLecture(
  data: Omit<Lecture, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "lectures"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLecture(
  id: string,
  data: Partial<Lecture>
): Promise<void> {
  await updateDoc(doc(db, "lectures", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLecture(id: string): Promise<void> {
  await deleteDoc(doc(db, "lectures", id));
}

export async function getLectures(filters?: {
  academicYear?: string;
  term?: string;
  subject?: string;
  isFree?: boolean;
}): Promise<Lecture[]> {
  // Fetch all lectures and filter in memory to avoid composite index issues
  const snap = await getDocs(collection(db, "lectures"));
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture));

  if (filters?.academicYear) {
    results = results.filter((l) => l.academicYear === filters.academicYear);
  }
  if (filters?.term) {
    results = results.filter((l) => l.term === filters.term);
  }
  if (filters?.subject) {
    results = results.filter((l) => l.subject === filters.subject);
  }
  if (filters?.isFree !== undefined) {
    results = results.filter((l) => l.isFree === filters.isFree);
  }

  return results.sort((a, b) => {
    const aTime = (a.createdAt as any)?.seconds || 0;
    const bTime = (b.createdAt as any)?.seconds || 0;
    return bTime - aTime;
  });
}

export async function getFreeLectures(): Promise<Lecture[]> {
  const q = query(
    collection(db, "lectures"),
    where("isFree", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lecture));
}

// ─── Subscription Requests ────────────────────────────────────────────────────

export async function createSubscriptionRequest(
  data: Omit<SubscriptionRequest, "id" | "createdAt" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, "subscription_requests"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSubscriptionRequests(
  status?: "pending" | "approved" | "rejected"
): Promise<SubscriptionRequest[]> {
  let q = query(
    collection(db, "subscription_requests"),
    orderBy("createdAt", "desc")
  );
  if (status) {
    q = query(q, where("status", "==", status));
  }
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as SubscriptionRequest)
  );
}

export async function approveSubscription(
  requestId: string,
  userId: string,
  adminUid: string
): Promise<void> {
  await updateDoc(doc(db, "subscription_requests", requestId), {
    status: "approved",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });
  await updateDoc(doc(db, "users", userId), {
    subscriptionStatus: "مشترك",
  });
}

export async function rejectSubscription(
  requestId: string,
  userId: string,
  adminUid: string
): Promise<void> {
  await updateDoc(doc(db, "subscription_requests", requestId), {
    status: "rejected",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
  });
  await updateDoc(doc(db, "users", userId), {
    subscriptionStatus: "غير مشترك",
  });
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function logActivity(
  userId: string,
  action: string,
  details?: string
): Promise<void> {
  await addDoc(collection(db, "activity_logs"), {
    userId,
    action,
    details: details || "",
    createdAt: serverTimestamp(),
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [usersSnap, lecturesSnap, requestsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "lectures")),
    getDocs(
      query(collection(db, "subscription_requests"), where("status", "==", "pending"))
    ),
  ]);

  const users = usersSnap.docs.map((d) => d.data());
  const lectures = lecturesSnap.docs.map((d) => d.data());

  return {
    totalStudents: usersSnap.size,
    subscribedStudents: users.filter((u) => u.subscriptionStatus === "مشترك")
      .length,
    pendingRequests: requestsSnap.size,
    totalLectures: lecturesSnap.size,
    freeLectures: lectures.filter((l) => l.isFree).length,
    paidLectures: lectures.filter((l) => !l.isFree).length,
  };
}
