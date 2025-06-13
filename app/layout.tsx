import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./providers/StoreProvider";
import QueryProvider from "./providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helium Contractor Assignment",
  description: "As completed by @tonymamo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        href="https://framerusercontent.com/images/M0HXLcSnzrS0RPXmmamdZtJMk.png"
        rel="icon"
        media="(prefers-color-scheme: light)"
      />
      <link
        href="https://framerusercontent.com/images/M0HXLcSnzrS0RPXmmamdZtJMk.png"
        rel="icon"
        media="(prefers-color-scheme: dark)"
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <StoreProvider>{children}</StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
