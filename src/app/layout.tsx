import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plurally",
  description: "A tool to manage your plurality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
