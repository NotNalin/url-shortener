import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <SignIn />
    </div>
  );
}
