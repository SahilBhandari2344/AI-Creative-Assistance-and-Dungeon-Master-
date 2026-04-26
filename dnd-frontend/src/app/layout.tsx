import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D&D AI Adventure",
  description: "Play D&D with AI companions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
