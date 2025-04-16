"use client";

import { useState } from "react";
import { verifyUrlPassword } from "@/app/actions";
import { FaLock, FaSpinner } from "react-icons/fa";

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
      const originalReferrer = document.referrer;
      const result = await verifyUrlPassword(urlId, password);

      if (result.success && result.originalUrl) {
        const redirectUrl = new URL(result.originalUrl);
        if (originalReferrer) {
          redirectUrl.searchParams.set("original_referrer", originalReferrer);
        }
        window.location.href = redirectUrl.toString();
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
        <div className="p-3 rounded-full bg-white">
          <FaLock className="text-red-600 text-xl" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-5 text-center">Protected Link</h2>
      <p className="mb-5 text-center text-muted-foreground font-bold">
        {typeof window !== "undefined"
          ? window.location.origin.replace(/(^\w+:|^)\/\//, "")
          : ""}
        /{slug}
      </p>
      <p className="mb-4 text-center text-muted-foreground">
        This link is protected. <br />
        Please enter the passphrase to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="password">
            Passphrase
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
            placeholder="Enter passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full py-2 px-6 mt-3 text-base font-medium text-primary bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Verifying...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </form>

      <p className="text-xs text-center text-muted-foreground mt-4">
        You can also access this link by adding{" "}
        <code className="bg-white px-1 py-1 rounded">?key=password</code> to the
        URL.
      </p>
    </div>
  );
}
