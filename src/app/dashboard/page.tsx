// app/dashboard/page.tsx
import { getUserUrls } from "../actions";
import { LinksList } from "../../components/LinksList";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FaLink } from "react-icons/fa6";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const urls = await getUserUrls();

  return (
    <section>
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Your Links</h1>
      {urls.length === 0 ? (
        <div className="p-8 rounded-lg shadow-md border border-border text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <FaLink />
          </div>
          <p className="text-muted-foreground text-lg">
            You haven't created any shortened URLs yet.
          </p>
          <a
            href="/"
            className="mt-4 inline-block py-2 px-4 rounded-md btn-primary"
          >
            Create your first shortened URL
          </a>
        </div>
      ) : (
        <LinksList urls={urls} />
      )}
    </section>
  );
}
