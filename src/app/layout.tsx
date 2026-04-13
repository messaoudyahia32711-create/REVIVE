import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H - Tourism Platform | منصة H السياحية",
  description:
    "Discover amazing tourism experiences with H. Explore the best tours, adventures, and destinations with trusted local providers. اكتشف تجارب سياحية مذهلة مع منصة H.",
  keywords: ["H", "tourism", "السياحة", "travel", "booking", "tours", "adventures"],
  authors: [{ name: "H Platform" }],
  icons: { icon: "/images/logo.png" },
  openGraph: {
    title: "H - Tourism Platform",
    description: "Discover amazing tourism experiences with trusted local providers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
        style={{ fontFamily: 'var(--font-cairo), sans-serif' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
