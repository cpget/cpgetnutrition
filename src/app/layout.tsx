import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SmartFooter from "@/components/SmartFooter";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPGET NUTRITION",
  description: "Advanced Learning Platform for Nutrition Students",

  verification: {
    google: "-Kp9xxQeLx6kjkFLHIUCd4NeQQIPNYz5wXNc5jWkYug",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>

              {/* This component handles its own visibility internally */}
              <SmartFooter />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}