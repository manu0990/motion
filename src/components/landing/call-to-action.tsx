import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-8 text-center shadow-xl sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to bring your math to life?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
            Start creating beautiful mathematical animations today. No coding required.
          </p>
          <div className="mt-10">
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="font-semibold">
                Start Creating Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}