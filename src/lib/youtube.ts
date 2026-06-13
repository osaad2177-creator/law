// src/lib/youtube.ts

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function buildEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&showinfo=0&iv_load_policy=3&color=white&origin=${typeof window !== "undefined" ? window.location.origin : ""}`;
}

export function obfuscateUrl(url: string): string {
  return btoa(url).split("").reverse().join("");
}

export function deobfuscateUrl(obfuscated: string): string {
  return atob(obfuscated.split("").reverse().join(""));
}
