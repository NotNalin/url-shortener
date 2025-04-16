import { CreateLinkForm } from "@/components/CreateLinkForm";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <div className="space-y-8 flex flex-col items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">URL Shortener</h1>
        <p className="text-muted-foreground">
          Create short, memorable links with analytics and password protection
        </p>
      </div>
      <CreateLinkForm isLoggedIn={isLoggedIn} />
    </div>
  );
}
