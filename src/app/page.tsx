import { CreateLinkForm } from "../components/CreateLinkForm";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <section>
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl font-bold mb-4">Simplify Your Links</h1>
        <p className="text-lg text-muted-foreground">
          Transform long URLs into short, powerful links. Get started for free,
          or unlock premium features by signing in.
        </p>
      </div>
      <CreateLinkForm isLoggedIn={isLoggedIn} />
    </section>
  );
}
