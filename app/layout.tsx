import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/providers/cart-provider";
import QueryProvider from "@/components/query-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bemlanja — Belanja Mudah, Terpercaya",
    template: "%s | Bemlanja",
  },
  description:
    "Bemlanja adalah platform e-commerce terpercaya untuk menemukan produk dari berbagai toko lokal pilihan di Indonesia.",
  keywords: ["bemlanja", "belanja online", "toko lokal", "e-commerce indonesia", "produk lokal"],
  authors: [{ name: "Bemlanja" }],
  creator: "Bemlanja",
  verification: {
    google: "qo3SG0B2NPeSljDmb9oZZ6Z-Uv94yQmd3ttjfh-NZlA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Bemlanja",
    title: "Bemlanja — Belanja Mudah, Terpercaya",
    description:
      "Platform e-commerce terpercaya untuk menemukan produk dari berbagai toko lokal pilihan di Indonesia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bemlanja — Belanja Mudah, Terpercaya",
    description:
      "Platform e-commerce terpercaya untuk menemukan produk dari berbagai toko lokal pilihan di Indonesia.",
  },
};

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} antialiased min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
