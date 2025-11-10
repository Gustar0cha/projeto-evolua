import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evolua",
  description: "Evolua — WebApp de Treinamento Corporativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors toastOptions={{
          style: { backgroundColor: "var(--surface)", color: "var(--foreground)" },
        }} />
      </body>
    </html>
  );
}
