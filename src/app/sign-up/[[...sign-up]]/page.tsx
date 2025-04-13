// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            card: "bg-white",
          },
        }}
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}