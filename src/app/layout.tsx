import type { Metadata } from "next";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AuthProvider } from "@/store/auth-context";
import { QueryProvider } from "@/providers/query-provider";

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
    <html lang="uz" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
