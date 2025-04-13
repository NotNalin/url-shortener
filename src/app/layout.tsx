// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import { ThemeProvider } from "../components/ThemeSwitch";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/react"
import { defaultInternalTheme } from "@clerk/themes/dist/clerk-js/src/ui/foundations";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Shorten your URLs with custom features",
};

const cx: (...classes: (string | undefined | null | false)[]) => string = (
  ...classes
) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={cx(GeistSans.variable, GeistMono.variable)}>
        <body className="antialiased flex flex-col items-center justify-center mx-auto mt-1 lg:mt-4 mb-10 lg:mb-20">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex-auto min-w-0 mt-1 md:mt-3 flex flex-col px-4 sm:px-2 md:px-0 max-w-[800px] w-full">
              <Navbar />
              {children}
              <Footer />
            </main>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
