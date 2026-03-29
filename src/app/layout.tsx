import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], variable: "--font-barlow", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL("https://dropsplit.ai"),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full bg-[#F5F7FA] font-sans text-slate-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
