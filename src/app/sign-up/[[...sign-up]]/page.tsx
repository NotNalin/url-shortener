import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <SignUp />
    </div>
  );
}
