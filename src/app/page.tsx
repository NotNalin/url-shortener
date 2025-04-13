// app/page.tsx
import { CreateLinkForm } from '../components/CreateLinkForm';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth()
  const isLoggedIn = !!userId;
  
  return (
    <section>
      <p className="mb-4 text-muted-foreground">
        Create short, memorable links for your long URLs. Free to use, with premium features 
        available when you sign in.
      </p>
      <CreateLinkForm isLoggedIn={isLoggedIn} />
    </section>
  );
}