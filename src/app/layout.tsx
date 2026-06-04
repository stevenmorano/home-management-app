import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Management OS",
  description: "A property health command center for homeowners."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
