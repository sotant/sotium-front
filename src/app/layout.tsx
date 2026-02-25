import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sotium Academy",
  description: "SaaS platform foundation for academy management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
