import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sentiment Analyzer - AI-Powered Text Analysis",
  description: "Analyze text sentiment in real-time using advanced machine learning. Perfect for understanding customer feedback, social media posts, and more.",
  keywords: ["sentiment analysis", "AI", "machine learning", "text analysis", "NLP"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Sentiment Analyzer - AI-Powered Text Analysis",
    description: "Analyze text sentiment in real-time using advanced machine learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
