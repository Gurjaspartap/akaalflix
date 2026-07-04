import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AkaalFLIX  | Your Movies",
  description: "A premium streaming platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
          <Navbar />
          <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
