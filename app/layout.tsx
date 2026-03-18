import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smart Brains Media Hub",
  description: "A curated media library for Smart Brains students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!font-sans !text-sm !rounded-lg !shadow-lg",
            duration: 3000,
            style: {
              background: '#fafaf8',
              color: '#1c1917',
              border: '1px solid #e8e5e0',
            },
          }}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
