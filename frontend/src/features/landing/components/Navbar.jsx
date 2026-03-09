import { useEffect, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";

const NAV_LINKS = [
  { label: "Características", href: "#features" },
  { label: "Precios", href: "#pricing" },
  { label: "Contacto", href: "#footer" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className={[
          "mx-auto flex items-center justify-between",
          "px-5 sm:px-8 py-3 rounded-full",
          "max-w-[960px]",
          "transition-[background,border,box-shadow] duration-500 ease-apple-out",
          scrolled
            ? "bg-white/80 backdrop-blur-2xl border border-black/10 shadow-sm"
            : "bg-transparent border border-transparent",
        ].join(" ")}
      >
        <a
          href="#"
          className={`font-heading font-bold text-[17px] tracking-tight transition-colors duration-500 ${scrolled ? "text-accent" : "text-white"}`}
        >
          Stylio
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[13px] font-medium transition-colors duration-300 ease-apple ${scrolled ? "text-text-primary/80" : "text-white/80"}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="text-[13px] font-semibold px-5 py-2 rounded-full bg-brand text-white hover:bg-brand-light transition-all duration-300 ease-apple active:scale-[0.97]"
          >
            Empezar gratis
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 transition-colors duration-300 ease-apple ${scrolled ? "text-accent" : "text-white"}`}
          aria-label="Menú"
        >
          {menuOpen ? <XIcon size={20} /> : <ListIcon size={20} weight="bold" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mx-auto max-w-[960px] mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/10 p-5 md:hidden shadow-lg">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-text-primary font-medium text-[15px] py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors duration-300 ease-apple"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="bg-brand text-white text-center font-semibold text-[15px] px-5 py-3 rounded-full mt-3 hover:bg-brand-light transition-colors duration-300 ease-apple"
            >
              Empezar gratis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
