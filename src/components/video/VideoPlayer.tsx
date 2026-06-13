// src/components/video/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeId, buildEmbedUrl } from "@/lib/youtube";
import type { Lecture, User } from "@/types";

interface VideoPlayerProps {
  lecture: Lecture;
  user: User;
}

export default function VideoPlayer({ lecture, user }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showWarning, setShowWarning] = useState(false);

  const videoId = extractYouTubeId(lecture.youtubeUrl);
  const embedUrl = videoId ? buildEmbedUrl(videoId) : null;

  // ─── Security: Disable right-click ───────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    el.addEventListener("contextmenu", handleContextMenu);
    el.addEventListener("dragstart", handleDragStart);

    return () => {
      el.removeEventListener("contextmenu", handleContextMenu);
      el.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  // ─── Screenshot detection ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen, Windows+Shift+S, etc.
      if (
        e.key === "PrintScreen" ||
        (e.key === "S" && e.shiftKey && e.metaKey) ||
        (e.key === "s" && e.shiftKey && e.metaKey)
      ) {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Possible screenshot or tab switch
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!embedUrl) {
    return (
      <div
        className="flex items-center justify-center h-48 rounded-xl"
        style={{ background: "#f1f5f9" }}
      >
        <p
          className="text-gray-500"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          رابط الفيديو غير صحيح
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Lecture title */}
      <h4
        className="font-bold text-base mb-3"
        style={{ color: "#1e293b", fontFamily: "'Cairo', sans-serif" }}
      >
        {lecture.title}
      </h4>

      {/* Video container with security wrapper */}
      <div
        ref={containerRef}
        className="video-container"
        style={{
          position: "relative",
          background: "#000",
          borderRadius: "12px",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Transparent shield overlay (top 40% and sides to block right-click on video) */}
        <div
          className="video-shield"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: "60px",
            zIndex: 5,
            cursor: "default",
          }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />

        {/* Moving Watermark */}
        <WatermarkOverlay user={user} />

        {/* YouTube embed */}
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
  src={embedUrl}
  title={lecture.title}
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
  allowFullScreen
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  }}
  sandbox="allow-scripts allow-same-origin allow-presentation"
/>
        </div>
      </div>

      {/* Screenshot warning */}
      {showWarning && (
        <div
          className="mt-3 p-3 rounded-xl text-center"
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
          }}
        >
          <p
            className="text-red-700 text-sm font-semibold"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            ⚠️ تم تسجيل محاولة التصوير
          </p>
        </div>
      )}

      {/* Description */}
      {lecture.description && (
        <p
          className="mt-3 text-sm text-gray-500"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {lecture.description}
        </p>
      )}

      {/* Disclaimer */}
      <div
        className="mt-4 p-3 rounded-xl text-xs"
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          fontFamily: "'Cairo', sans-serif",
          color: "#92400e",
        }}
      >
        ⚠️ لا يمكن  تصوير الشاشة أو التسجيل 
       
      </div>
    </div>
  );
}

// ─── Moving Watermark Component ───────────────────────────────
function WatermarkOverlay({ user }: { user: User }) {
  const [position, setPosition] = useState({ top: "10%", right: "10%" });
  const [opacity, setOpacity] = useState(0.18);

  useEffect(() => {
    const positions = [
      { top: "8%", right: "8%" },
      { top: "35%", right: "55%" },
      { top: "65%", right: "15%" },
      { top: "20%", right: "75%" },
      { top: "75%", right: "60%" },
      { top: "50%", right: "40%" },
    ];
    const opacities = [0.15, 0.22, 0.18, 0.20, 0.16, 0.19];

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % positions.length;
      setPosition(positions[idx]);
      setOpacity(opacities[idx]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        right: position.right,
        zIndex: 20,
        pointerEvents: "none",
        transition: "top 2s ease-in-out, right 2s ease-in-out, opacity 1s ease",
        opacity,
        transform: "rotate(-25deg)",
        textAlign: "center",
        color: "white",
        fontFamily: "'Cairo', sans-serif",
        fontWeight: 700,
        fontSize: "13px",
        lineHeight: "1.6",
        textShadow: "0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
        whiteSpace: "nowrap",
      }}
    >
      {user.fullName}
      <br />
      {user.email}
      <br />
      {user.phone}
    </div>
  );
}
