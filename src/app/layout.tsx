// src/app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "اسلام المتر ",
  description: "منصة تعليمية متكاملة لطلاب كلية الحقوق",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body dir="rtl">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "toast-arabic",
              style: {
                fontFamily: "'Cairo', sans-serif",
                direction: "rtl",
                textAlign: "right",
              },
              success: {
                iconTheme: { primary: "#16a34a", secondary: "#white" },
              },
              error: {
                iconTheme: { primary: "#dc2626", secondary: "white" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
