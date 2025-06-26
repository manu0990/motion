import { Suspense } from "react";
import SigninClient from "./signin-client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninClient />
    </Suspense>
  );
}
