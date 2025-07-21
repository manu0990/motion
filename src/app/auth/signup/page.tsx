"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const fields: { name: keyof z.infer<typeof formSchema>; type: string; placeholder: string }[] = [
  { name: 'name', type: 'text', placeholder: 'Full Name' },
  { name: 'email', type: 'email', placeholder: 'Email Address' },
  { name: 'password', type: 'password', placeholder: 'Enter your password' },
  { name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password' },
];

const providers = [
  { id: 'google', label: 'Sign up with Google', icon: '/google-icon.svg' },
  { id: 'github', label: 'Sign up with GitHub', icon: '/github-icon.svg' },
];

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(fields.map(f => [f.name, ""])),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    form.clearErrors();
    try {
      await axios.post("/api/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setShowSuccess(true);
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      if (result?.error) {
        form.setError("email", { message: result.error });
        setShowSuccess(false);
      } else {
        router.push("/");
      }
    } catch (err: AxiosError | unknown) {
      const message = err instanceof AxiosError
        ? err.response?.data?.error ?? err.message
        : 'An error occurred. Please try again.';

      form.setError('email', { message });
      setShowSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
          <p className="text-muted-foreground mb-4">Signing you in now…</p>
          <div className="animate-pulse text-primary">Redirecting…</div>
        </div>
      </div>
    );
  }

  const providerButtonStyle = "w-full rounded-full h-12 text-md font-sans bg-input/20 border-input hover:bg-input/50 flex items-center justify-center space-x-3"

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm p-8 space-y-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-primary">Create Account</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(({ name, type, placeholder }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type={type}
                        placeholder={placeholder}
                        className="h-12 rounded-full bg-input/20 border-input text-md font-sans px-4 focus:bg-input/30 transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="submit"
              className="w-full rounded-full h-12 text-md font-medium mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-input" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <div className="space-y-3">
          {providers.map(({ id, label, icon }) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              className={providerButtonStyle}
              onClick={() => signIn(id, { callbackUrl: "/" })}
              disabled={isLoading}
            >
              <Image src={icon} alt={`${label} logo`} width={25} height={25} className="invert" />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};