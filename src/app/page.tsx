// app/page.tsx
import { CreateLinkForm } from '../components/CreateLinkForm';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth()
  const isLoggedIn = !!userId;
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">URL Shortener</h1>
      <CreateLinkForm isLoggedIn={isLoggedIn} />
    </div>
  );
}