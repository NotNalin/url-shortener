"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ThemeSwitch } from "./ThemeSwitch";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm mb-4 sm:mb-6 lg:mb-8">
      <div className="container mx-auto px-4 sm:px-0">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg sm:text-xl font-bold hover:text-primary transition-colors duration-200"
            >
              URL Shortener
            </Link>
          </div>
          <div className="flex items-center space-x-3 px-2 sm:px-4">
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors duration-200"
              >
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors duration-200"
              >
                Sign Up
              </Link>
            </SignedOut>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
}
