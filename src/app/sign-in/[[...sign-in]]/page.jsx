// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            card: "bg-white",
          },
        }}
        routing="path"
        signUpUrl="/sign-up"
        redirectUrl="/"
      />
    </div>
  );
}