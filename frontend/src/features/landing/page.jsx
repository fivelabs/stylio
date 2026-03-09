import Navbar from "@/features/landing/components/Navbar";
import Hero from "@/features/landing/components/Hero";
import Features from "@/features/landing/components/Features";
import Pricing from "@/features/landing/components/Pricing";
import Footer from "@/features/landing/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
