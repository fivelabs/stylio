import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Características", href: "#features" },
  { label: "Precios", href: "#pricing" },
  { label: "Contacto", href: "#footer" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" }
      );
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 opacity-0 px-4 pt-5"
    >
      <nav
        className={[
          "mx-auto flex items-center justify-between",
          "px-5 sm:px-8 py-3.5 rounded-full",
          "max-w-[920px]",
          "transition-[background,border,box-shadow] duration-500 ease-out",
          scrolled
            ? "bg-white/95 sm:bg-white/70 sm:backdrop-blur-2xl border border-border shadow-lg shadow-black/[0.04]"
            : "bg-transparent border border-transparent",
        ].join(" ")}
      >
        <a
          href="#"
          className={`font-heading font-bold text-lg tracking-tight transition-colors duration-500 ${scrolled ? "text-accent" : "text-white"
            }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Stylio
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors duration-500 hover:text-brand ${scrolled ? "text-text-primary" : "text-white/90"
                }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            className={`text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.04] ${scrolled
                ? "bg-brand text-white hover:bg-brand-dark"
                : "bg-white text-accent hover:bg-white/90"
              }`}
          >
            Únete a Stylio
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors duration-500 ${scrolled ? "text-accent" : "text-white"
            }`}
          aria-label="Menú"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mx-auto max-w-[920px] mt-3 bg-white rounded-[2rem] border border-border p-6 md:hidden shadow-2xl">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-text-primary font-medium text-base py-2 hover:text-brand transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="bg-brand text-white text-center font-semibold px-5 py-3 rounded-full mt-2 hover:bg-brand-dark transition-colors"
            >
              Empezar gratis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
