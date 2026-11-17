import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./orders.css";
import AccessGate from "@/components/AccessGate";

// Mêmes fichiers Futura Now que dans le premier prototype Horizon.
const futuraText = localFont({ src: "./fonts/futura-text.woff2", variable: "--font-givaudan-text", weight: "400", display: "swap" });
const futuraHeadline = localFont({ src: "./fonts/futura-headline.woff2", variable: "--font-givaudan-display", weight: "500 900", display: "swap" });

export const metadata: Metadata = {
  title: "Givaudan Horizon",
  description:
    "Cinq étapes à travers la pyramide olfactive pour transformer votre idée en brief parfumé.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${futuraText.variable} ${futuraHeadline.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><AccessGate>{children}</AccessGate></body>
    </html>
  );
}
