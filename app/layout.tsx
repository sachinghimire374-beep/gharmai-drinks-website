import type { Metadata } from "next";
import { Playfair_Display, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: "Gharmai Drinks | Premium Alcohol & Food Delivery in Pokhara — Until 3 AM",
  description:
    "Nepal's premium alcohol delivery. Whiskey, Scotch, Wine, Beer, Vodka & food delivered to your door in Pokhara, 2 PM – 3 AM daily. VIP membership, party boxes & fast late-night delivery.",
  keywords: [
    "alcohol delivery Pokhara",
    "whiskey delivery Nepal",
    "wine delivery Pokhara",
    "late night liquor delivery",
    "premium drinks Pokhara",
  ],
  openGraph: {
    title: "Gharmai Drinks | Premium Drinks Delivered Until 3 AM",
    description: "Your Party Starts at Home. Premium alcohol & food delivery in Pokhara.",
    images: ["/logo.png"],
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${space.variable}`}>
      <body className="font-body bg-dark text-white antialiased">{children}</body>
    </html>
  );
}
