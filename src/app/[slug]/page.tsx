// app/[slug]/page.tsx
import { connectToDatabase } from '@/lib/db';
import { Url } from '../../lib/models/url';
import { notFound, redirect } from 'next/navigation';
import { PasswordPrompt } from '../../components/PasswordPrompt';

interface RedirectPageProps {
  params: {
    slug: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params;
  await connectToDatabase();
  
  const url = await Url.findOne({ slug });
  
  if (!url) {
    notFound();
  }
  
  // Check if expired
  if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-700">Link Expired</h2>
        <p className="mt-2">This shortened URL has expired and is no longer valid.</p>
        <a href="/" className="block mt-4 text-blue-600 hover:underline">Create a new shortened URL</a>
      </div>
    );
  }
  
  // Check if max clicks reached
  if (url.maxClicks && url.currentClicks >= url.maxClicks) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-yellow-50 rounded-lg shadow">
        <h2 className="text-xl font-bold text-yellow-700">Usage Limit Reached</h2>
        <p className="mt-2">This link has reached its maximum number of allowed uses.</p>
        <a href="/" className="block mt-4 text-blue-600 hover:underline">Create a new shortened URL</a>
      </div>
    );
  }
  
  // If password protected, show password form
  if (url.passwordHash) {
    return <PasswordPrompt urlId={url._id.toString()} slug={slug} />;
  }
  
  // No password, increment clicks and redirect
  await Url.findByIdAndUpdate(url._id, { $inc: { currentClicks: 1 } });
  redirect(url.originalUrl);
}