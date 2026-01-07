import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueueButton } from "@/components/queue/QueueButton";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: "Chapters - AI-Powered Story Creation",
  description: "Transform your ideas into viral TikTok/Reels carousels with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
        <QueueButton />
      </body>
    </html>
  );
}
