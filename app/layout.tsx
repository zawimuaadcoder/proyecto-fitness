import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proyecto Fitness",
  description: "Seguimiento de hábitos, peso, entrenamiento y cardio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={inter.className}
        style={{
          margin: 0,
          background: "#0b0b0c",
          color: "#f5f5f5",
        }}
      >
        {children}
      </body>
    </html>
  );
}
