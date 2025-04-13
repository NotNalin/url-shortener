// components/Navbar.tsx
"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="bg-white shadow py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          URL Shortener
        </Link>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/sign-up" className="text-gray-600 hover:text-gray-900">
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
