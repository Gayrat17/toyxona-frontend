import type { Metadata } from "next";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/manrope";
import "lenis/dist/lenis.css";
import "./globals.css";
import { AuthProvider } from "@/store/auth-context";
import { QueryProvider } from "@/providers/query-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { ScrollProgressBar } from "@/components/motion/scroll-progress";

export const metadata: Metadata = {
  title: "TOYXONA — To'y zallari va barlar bron qilish platformasi",
  description:
    "O'zbekiston bo'ylab eng sara to'y zallari, restoranlar va barlarni toping, bo'sh sanalarni ko'ring va bir necha daqiqada bron qiling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {/* Gold scroll-depth progress bar fixed at top of viewport */}
        <ScrollProgressBar />
        <QueryProvider>
          <AuthProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
