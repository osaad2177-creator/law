// src/lib/deviceFingerprint.ts
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedFingerprint = result.visitorId;
    return cachedFingerprint;
  } catch (error) {
    console.error("Fingerprint error:", error);
    // Fallback fingerprint
    const fallback = generateFallbackFingerprint();
    cachedFingerprint = fallback;
    return fallback;
  }
}

function generateFallbackFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("fingerprint", 2, 2);
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || "",
    canvas.toDataURL(),
  ];

  return btoa(components.join("|")).substring(0, 32);
}

export function storeDeviceFingerprint(fingerprint: string): void {
  try {
    localStorage.setItem("device_fingerprint", fingerprint);
  } catch {
    // localStorage not available
  }
}

export function getStoredFingerprint(): string | null {
  try {
    return localStorage.getItem("device_fingerprint");
  } catch {
    return null;
  }
}
