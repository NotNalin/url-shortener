import { getUserUrls } from "../actions";
import { LinksList } from "../../components/LinksList";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FaLink } from "react-icons/fa6";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const urls = await getUserUrls();

  return (
    <section>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Links</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-98 hover:-translate-y-1 border border-primary/20"
        >
          <FaPlus className="w-4 h-4 animate-pulse" />
          <span>Create New Link</span>
        </Link>
      </div>
      <div className="w-full h-px bg-border my-4" />
      {urls.length === 0 ? (
        <div className="p-8 rounded-lg shadow-md border border-border text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <FaLink />
          </div>
          <p className="text-muted-foreground text-lg">
            There are no shortened URLs yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block py-2 px-4 rounded-md btn-primary"
          >
            Create your first shortened URL
          </Link>
        </div>
      ) : (
        <LinksList urls={urls} />
      )}
    </section>
  );
}
