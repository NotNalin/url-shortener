// components/Navbar.tsx
"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ThemeSwitch } from "./ThemeSwitch";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg sm:text-xl lg:text-4xl font-semibold tracking-tight hover:text-primary transition-colors"
            >
              URL Shortener
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted/50"
              >
                Dashboard
              </Link>
              <div className="pl-1">
                <UserButton 
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted/50"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors px-2 py-1.5 rounded-md"
              >
                Sign Up
              </Link>
            </SignedOut>
            <div className="pl-1">
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
