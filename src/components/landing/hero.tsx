import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {

  return (
    <section className="relative overflow-hidden flex items-center py-20 sm:py-32 lg:min-h-[calc(100vh-4rem)] ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="block">Transform Math into</span>
            <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 dark:from-purple-400 dark:via-fuchsia-600 dark:to-rose-600 bg-clip-text text-transparent">
              Beautiful Videos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Use AI to generate stunning mathematical animations with just a prompt. From simple equations to complex visualizations, bring your math to life.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="rounded-full px-8">
                Get Started
              </Button>
            </Link>

            <Link href="/#how-it-works" className="text-sm font-semibold leading-6 hover:text-primary">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}