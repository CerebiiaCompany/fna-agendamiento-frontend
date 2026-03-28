import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalHeader } from "../components/layout/ConditionalHeader";
import { PageWrapper } from "../components/layout/PageWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FNA - Agendamiento de Citas",
  description: "Sistema de agendamiento de citas del Fondo Nacional del Ahorro.",
  icons: {
    icon: "/happy-icon.jpeg",
    apple: "/happy-icon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConditionalHeader />
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
