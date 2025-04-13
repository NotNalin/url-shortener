"use client";

import { useState } from "react";
import { verifyUrlPassword } from "@/app/actions";
import { FaLock } from "react-icons/fa";

interface PasswordPromptProps {
  urlId: string;
  slug: string;
}

export function PasswordPrompt({ urlId, slug }: PasswordPromptProps) {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await verifyUrlPassword(urlId, password);

      if (result.success && result.originalUrl) {
        window.location.href = result.originalUrl;
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-lg shadow-md border border-border">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
          <FaLock className="text-blue-600 dark:text-blue-400 text-xl" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4 text-center">Protected Link</h2>
      <p className="mb-2 text-center text-muted-foreground">
        {typeof window !== "undefined"
          ? window.location.origin.replace(/(^\w+:|^)\/\//, "")
          : ""}
        /{slug}
      </p>
      <p className="mb-6 text-center text-muted-foreground">
        This link is protected. Please enter the passphrase to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="password">
            Passphrase
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Continue"}
          </button>
        </div>
      </form>
      <p className="text-sm text-center text-muted-foreground">
        If you do not have a passphrase, please contact the link owner.
      </p>
    </div>
  );
}
