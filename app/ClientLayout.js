'use client';

import { useEffect, useState } from 'react';
import { Inter, Pixelify_Sans } from "next/font/google";
import Loader from '@/layout/Loader';
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { AuthProvider } from "@/features/context/AuthContext";
import { PostHogProvider } from './providers';
import { NotificationProvider } from "@/features/notifications/context/NotificationContext";
import NotificationModal from "@/features/notifications/components/NotificationModal";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ClientLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <body className={`${inter.variable} ${pixelifySans.variable} antialiased`}>
        <Loader />
      </body>
    );
  }

  return (
    <body className={`${inter.variable} ${pixelifySans.variable} antialiased cursor-none`}>
      <SmoothCursor />
      <NotificationProvider>
        <NotificationModal />
        <AuthProvider>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </AuthProvider>
      </NotificationProvider>
    </body>
  );
}