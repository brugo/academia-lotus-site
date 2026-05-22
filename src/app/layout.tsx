import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@/styles/rich-editor.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { createClient } from "@/utils/supabase/server";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academia Espiritual de Lótus",
  description: "Clínica de autoconhecimento e agendamento de atendimentos.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} antialiased bg-midnight-950 text-slate-200`}
    >
      <body className="min-h-screen flex flex-col font-sans selection:bg-gold-500/30 selection:text-gold-200">
        <SmoothScrollProvider>
          <Navbar user={user} />
          <main className="flex-grow flex flex-col relative">
            {children}
          </main>
          <Footer />
        </SmoothScrollProvider>
        {/* Google Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18180014272"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18180014272');
          `}
        </Script>
      </body>
    </html>
  );
}
