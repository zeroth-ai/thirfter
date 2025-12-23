import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BLR Thrifter | Discover Bangalore's Best Thrift Stores",
  description:
    "AI-powered discovery of 100+ thrift stores, surplus warehouses & factory outlets in Bangalore. Find your perfect style with semantic search and image-based recommendations.",
  keywords: [
    "thrift stores bangalore",
    "surplus stores",
    "factory outlets",
    "vintage shopping",
    "sustainable fashion",
    "budget fashion",
  ],
  authors: [{ name: "BLR Thrifter" }],
  openGraph: {
    title: "BLR Thrifter | Discover Bangalore's Best Thrift Stores",
    description: "AI-powered thrift store discovery in Bangalore",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "https://res.cloudinary.com/dqwbkjfuh/image/upload/v1764588498/Screenshot_2025-11-26_at_6.58.01_PM_m1stjx.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased min-h-screen flex flex-col bg-canvas text-fg selection:bg-accent-blue/20">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
