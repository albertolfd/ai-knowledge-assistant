import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "streamdown/styles.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Knowledge assistant",
  description:
    "Ask questions about a personal knowledge base, with cited sources.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} `}>
      <body className="antialiased">
        <Providers>
          <div className="flex h-dvh flex-col bg-white">
            <header className="border-b border-gray-200 px-4 py-3">
              <h1 className="text-base font-semibold text-gray-900">
                Knowledge assistant
              </h1>
            </header>
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
