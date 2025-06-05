"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const providerButtonStyle = "w-full rounded space-x-5 h-12 text-md font-sans rounded-full bg-input/20 border-input hover:bg-input/50";

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-primary">
          Sign In
        </h2>

        <div
          className="space-y-3"
        >
          <Button
            variant='outline'
            size='lg'
            className={providerButtonStyle}
            onClick={() =>
              signIn("google", {
                callbackUrl,
              })
            }
          >
            <Image src='/google-icon.svg' alt="google logo" width={25} height={25} className="dark:invert-0 invert" />
            <p>Sign in with Google</p>
          </Button>

          <Button
            variant='outline'
            size='lg'
            className={providerButtonStyle}
            onClick={() =>
              // signIn("github", {
              //   callbackUrl,
              // })
              alert("Login with github temprarily unavailable")
            }
          >
            <Image src='/github-icon.svg' alt="github logo" width={25} height={25} className="dark:invert-0 invert" />
            <p>Sign in with github</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
