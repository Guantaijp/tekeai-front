import { Button } from "@/components/ui/button";
import { Check, Package2, ShieldCheck, Truck, MapPin, Route } from "lucide-react";
import Link from "next/link";

export default function HeroPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Package2 className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline text-primary">teke.AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
             <Link
              href="/login"
              className="text-sm font-medium"
              prefetch={false}
            >
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="/signup"
              className="text-sm font-medium"
              prefetch={false}
            >
              Sign Up
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-6 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                      You click. <span className="text-primary">We deliver fast.</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
                      Ship smarter, not harder.
                    </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button asChild size="lg">
                        <Link href="/dashboard" prefetch={false}>
                        Ship an Item
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                        <Link href="/transporter-dashboard" prefetch={false}>
                        Become a Transporter
                        </Link>
                    </Button>
                </div>
                </div>
            </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose <span className="text-primary">teke.AI</span>?</h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    We provide a seamless and secure platform to connect you with professional transporters for all your shipping needs.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4">
                <div className="grid gap-1 text-center">
                  <div className="flex justify-center items-center">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Verified Transporters</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered checks ensure every transporter is credible and reliable, so you can ship with confidence.
                  </p>
                </div>
                <div className="grid gap-1 text-center">
                   <div className="flex justify-center items-center">
                    <Truck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Effortless Booking</h3>
                  <p className="text-muted-foreground">
                    Submit your request in minutes and receive competitive quotes from our network of professionals.
                  </p>
                </div>
                <div className="grid gap-1 text-center">
                  <div className="flex justify-center items-center">
                    <MapPin className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Real-Time Tracking</h3>
                  <p className="text-muted-foreground">
                    Stay updated on your shipment's progress from pickup to delivery with our live tracking feature.
                  </p>
                </div>
                 <div className="grid gap-1 text-center">
                  <div className="flex justify-center items-center">
                    <Route className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Smart Routing</h3>
                  <p className="text-muted-foreground">
                    Our AI-powered routing optimizes for cost and efficiency, allowing transporters to increase their margins.
                  </p>
                </div>
              </div>
            </div>
          </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 teke.AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/admin" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Admin
          </Link>
          <Link href="#features" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            About Us
          </Link>
           <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
