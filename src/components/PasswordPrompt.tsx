// components/PasswordPrompt.tsx
"use client";

import { useState } from "react";
import { verifyUrlPassword } from "@/app/actions";

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
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Password Protected Link</h2>
      <p className="mb-4 text-gray-600">
        This link is password protected. Please enter the password to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
