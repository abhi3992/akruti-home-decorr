import type { Metadata } from "next";
import { Libre_Baskerville, Manrope } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { AnalyticsPresenceBridge } from "@/components/AnalyticsPresenceBridge";
import { NavigationProgress } from "@/components/NavigationProgress";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteImages, getSiteContent } from "@/lib/site-settings";

const display = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.akrutihomedecor.com"),
  title: {
    default: "Akruti Home Decor",
    template: "%s · Akruti Home Decor",
  },
  description:
    "Handblock bedsheets, dohars, quilts, robes and home textiles — made with the craft we grew up with.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [images, content] = await Promise.all([
    getSiteImages(),
    getSiteContent(),
  ]);

  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <CartProvider>
          <WishlistProvider>
            <AnalyticsPresenceBridge />
            <NavigationProgress />
            <div className="announcement">{content.announcement}</div>
            <Header logoSrc={images.logoImage} />
            <main>{children}</main>
            <Footer
              logoSrc={images.logoImage}
              tagline={content.footerTagline}
              contact={content.footerContact}
              instagramUrl={content.instagramUrl}
              whatsappNumber={content.whatsappNumber}
            />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
