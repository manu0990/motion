"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src='/motion-logo.svg' width={50} height={50} alt="Motion-logo" className="md:hidden h-8 w-8 text-primary mr-2 dark:invert-0 invert" />
            <span className="hidden md:block text-xl font-bold">∑otion</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-6">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Link href="/auth/signin">
            <Button variant="default" className="rounded-full">Log in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" className="rounded-full" >Sign up for free</Button>
          </Link>
        </div>

        <Link href="/chat" className="md:hidden">
          <Button variant="default" className="rounded-full">Log in</Button>
        </Link>
      </div>

    </nav>
  );
}