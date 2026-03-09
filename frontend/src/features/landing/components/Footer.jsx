import { ArrowUpRightIcon } from "@phosphor-icons/react";

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
  return (
    <footer
      id="footer"
      className="relative bg-accent pt-20 sm:pt-24 pb-10 px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <div className="md:col-span-5 lg:col-span-4">
            <span className="font-heading font-bold text-xl text-white tracking-tight block mb-5">
              Stylio
            </span>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-7">
              La plataforma de gestión diseñada exclusivamente para
              profesionales de la estética.
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-brand text-white font-medium px-5 py-2.5 rounded-full text-sm hover:bg-brand-light transition-colors duration-300 ease-apple active:scale-[0.97]"
            >
              Comenzar gratis
              <ArrowUpRightIcon size={14} weight="bold" />
            </a>
          </div>

          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12">
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white/60 text-xs font-semibold mb-4 uppercase tracking-wider">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-white/40 text-sm hover:text-white transition-colors duration-300 ease-apple"
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

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Stylio by FiveLabs
          </p>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-white/40 text-xs font-medium">
              Todos los sistemas operativos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
