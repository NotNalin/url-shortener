// app/dashboard/page.tsx
import { getUserUrls } from '../actions';
import { LinksList } from '../../components/LinksList';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UrlDocument } from '@/lib/types';

export default async function Dashboard() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const urls = await getUserUrls() as UrlDocument[];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Links</h1>
      {urls.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600">You haven't created any shortened URLs yet.</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Create your first shortened URL
          </a>
        </div>
      ) : (
        <LinksList urls={urls} />
      )}
    </div>
  );
}