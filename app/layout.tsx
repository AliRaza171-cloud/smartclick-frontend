import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import PageViewTracker from "@/components/PageViewTracker";
import CursorGlow from "@/components/CursorGlow";
import IntroSplash from "@/components/IntroSplash3D";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Smart Click",
  description: "AI-curated shopping.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <PageViewTracker />
            <CursorGlow />
            <IntroSplash />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}