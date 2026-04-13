import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safara Travel - خدمات سياحية متكاملة",
  description:
    "Discover amazing tourism experiences with Safara Travel. Explore the best tours, adventures, and destinations with trusted local providers. اكتشف تجارب سياحية مذهلة مع سفارة ترافل.",
  keywords: [
    "Safara Travel",
    "tourism",
    "السياحة",
    "سفارة ترافل",
    "travel services",
    "tours",
    "adventures",
    "destinations",
  ],
  authors: [{ name: "Safara Travel" }],
  icons: {
    icon: "/images/logo.png",
  },
  openGraph: {
    title: "Safara Travel - خدمات سياحية متكاملة",
    description:
      "Discover amazing tourism experiences with trusted local providers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
