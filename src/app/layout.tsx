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
  title: "REVIVE - Medical Tourism Algeria | منصة REVIVE للسياحة العلاجية في الجزائر",
  description:
    "REVIVE - Your gateway to medical tourism in Algeria. Discover top healthcare providers, medical services, and therapeutic treatments across all 58 wilayas. بوابتك للسياحة العلاجية في الجزائر.",
  keywords: ["REVIVE", "medical tourism", "السياحة العلاجية", "Algeria", "الجزائر", "healthcare", "الصحة", "booking", "حجز", "doctors", "أطباء"],
  authors: [{ name: "REVIVE Platform" }],
  icons: { icon: "/images/logo.png" },
  openGraph: {
    title: "REVIVE - Medical Tourism Algeria",
    description: "Discover the best medical and therapeutic services across Algeria's 58 wilayas with trusted healthcare providers.",
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
