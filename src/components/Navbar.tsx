// components/Navbar.tsx
"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ThemeSwitch } from "./ThemeSwitch"; // Update the path to the correct location of ThemeSwitch

export function Navbar() {  
  return (
    <nav className="py-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
          >
            URL Shortener
          </Link>
        </div>
        <div className="flex flex-row gap-4 sm:ml-auto items-center">
          <SignedIn>
            <Link
              href="/dashboard"
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Sign Up
            </Link>
          </SignedOut>
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
}
