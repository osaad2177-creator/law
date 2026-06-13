// src/lib/authContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  getUserProfile,
  createUserProfile,
  setUserDeviceFingerprint,
  isAdmin as checkIsAdmin,
  logActivity,
} from "./firestore";
import { getDeviceFingerprint } from "./deviceFingerprint";
import type { User, AcademicYear } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  deviceBlocked: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  fullName: string;
  academicYear: AcademicYear;
  phone: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceBlocked, setDeviceBlocked] = useState(false);

  const loadUserData = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const adminStatus = await checkIsAdmin(fbUser.uid).catch(() => false);

      if (adminStatus) {
        setDeviceBlocked(false);
        setUser({
          uid: fbUser.uid,
          fullName: "مدير النظام",
          academicYear: "الأولى",
          phone: "",
          email: fbUser.email || "",
          createdAt: new Date().toISOString(),
          subscriptionStatus: "مشترك",
          isBlocked: false,
          isAdmin: true,
        });
        setFirebaseUser(fbUser);
        setIsAdmin(true);
        return;
      }

      const profile = await getUserProfile(fbUser.uid);
      if (!profile) return;

      const currentFingerprint = await getDeviceFingerprint();

      if (profile.isBlocked) {
        await firebaseSignOut(auth);
        setUser(null);
        setFirebaseUser(null);
        setDeviceBlocked(true);
        return;
      }

      if (profile.deviceFingerprint) {
        if (profile.deviceFingerprint !== currentFingerprint) {
          await firebaseSignOut(auth);
          setDeviceBlocked(true);
          setUser(null);
          setFirebaseUser(null);
          return;
        }
      } else {
        try {
          await setUserDeviceFingerprint(fbUser.uid, currentFingerprint);
          profile.deviceFingerprint = currentFingerprint;
        } catch (e) {
          console.error("Device binding failed:", e);
        }
      }

      setDeviceBlocked(false);
      setUser(profile);
      setFirebaseUser(fbUser);
      setIsAdmin(false);

    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await loadUserData(fbUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await loadUserData(credential.user);
      await logActivity(credential.user.uid, "تسجيل دخول", "تسجيل دخول ناجح");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await createUserProfile(credential.user.uid, {
  fullName: data.fullName,
  academicYear: data.academicYear,
  phone: data.phone,
  email: data.email,
  subscriptionStatus: "غير مشترك",
  isBlocked: false,
});

// Small delay to ensure Firestore write completes
await new Promise((resolve) => setTimeout(resolve, 1500));
await loadUserData(credential.user);
      await logActivity(credential.user.uid, "تسجيل حساب جديد", data.fullName);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (user) {
      await logActivity(user.uid, "تسجيل خروج", "");
    }
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setIsAdmin(false);
    setDeviceBlocked(false);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        deviceBlocked,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
