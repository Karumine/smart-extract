import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartExtract — Image to Excel with AI",
  description:
    "Upload images, extract text data using Gemini AI, customize columns, edit results, and export to professional Excel files.",
  keywords: ["OCR", "image to text", "Excel export", "Gemini AI", "data extraction"],
  openGraph: {
    title: "SmartExtract — Image to Excel with AI",
    description: "Extract structured data from images using AI and export to Excel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
