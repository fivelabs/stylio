import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = {
  Producto: [
    { label: "Características", href: "#features" },
    { label: "Precios", href: "#pricing" },
    { label: "Integraciones", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Empresa: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Contacto", href: "#" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-footer-content]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 92%",
          toggleActions: "play none none none",
        },
      });
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="relative bg-accent rounded-t-[4rem] pt-24 pb-10 px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto" data-footer-content>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-4">
            <a href="#" className="inline-flex items-center gap-2.5 mb-6">
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                Stylio 🧩
              </span>
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-8">
              La plataforma de gestión diseñada exclusivamente para
              profesionales de la estética. Hecha con obsesión por el detalle.
            </p>
            <a
              href="#pricing"
              className="btn-magnetic inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-full text-sm"
            >
              <span className="inline-flex items-center gap-2">
                Comenzar gratis
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
          </div>

          {/* Links */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-heading font-semibold text-white text-sm mb-5 uppercase tracking-wider">
                  {category}
                </h4>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-white/40 text-sm hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Stylio by FiveLabs. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <span className="text-white/50 text-sm font-medium">
              Sistema Operativo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
