import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

// Jost : police gratuite géométrique, très proche du Futura utilisé par Givaudan.
const jost = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Le Voyage Olfactif",
  description:
    "Cinq étapes à travers la pyramide olfactive pour transformer votre idée en brief parfumé.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jost.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
