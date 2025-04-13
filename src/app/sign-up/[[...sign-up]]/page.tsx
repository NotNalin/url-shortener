// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}