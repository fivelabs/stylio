import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Check,
  Megaphone,
  Package,
  TrendingUp,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import pricingData from "../data/pricing.json";

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  Megaphone,
  Package,
  TrendingUp,
  Users,
};

export default function Pricing() {
  const sectionRef = useRef(null);
  const [selectedModules, setSelectedModules] = useState([]);

  const toggleModule = (id) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const totalPrice =
    pricingData.base.price +
    pricingData.modules
      .filter((m) => selectedModules.includes(m.id))
      .reduce((acc, m) => acc + m.price, 0);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-pricing-header]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-pricing-header]",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from("[data-pricing-base]", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-pricing-base]",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from("[data-pricing-modules]", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-pricing-modules]",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-28 sm:py-36 px-6 sm:px-10 lg:px-16 bg-surface"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20" data-pricing-header>
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-wider mb-4">
            Precios
          </span>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-text-primary tracking-tight leading-tight mb-6">
            Simple, transparente,
            <br />
            <span className="text-brand">a tu medida.</span>
          </h2>
          <p className="text-text-primary/50 text-lg leading-relaxed">
            Una base sólida con módulos que añades solo si los necesitas. Sin
            sorpresas, sin compromisos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Base Tier */}
          <div
            data-pricing-base
            className="lg:col-span-7 bg-canvas rounded-[2rem] p-8 sm:p-10 border border-border/50 relative overflow-hidden"
          >
            <div className="hidden sm:block absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <h3 className="font-heading font-bold text-2xl text-text-primary mb-2">
                {pricingData.base.name}
              </h3>
              <p className="text-text-primary/50 text-sm mb-8 max-w-md leading-relaxed">
                {pricingData.base.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-heading font-extrabold text-5xl sm:text-6xl text-text-primary">
                  {pricingData.currency} {pricingData.base.price.toLocaleString()}
                </span>
                <span className="text-text-primary/40 text-lg font-medium">
                  /{pricingData.base.period}
                </span>
              </div>

              <ul className="space-y-3.5 mb-10">
                {pricingData.base.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-text-primary/70 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button className="btn-magnetic w-full bg-brand text-white font-semibold py-4 rounded-full text-base">
                <span>¡Empieza ahora!</span>
              </button>
            </div>
          </div>

          {/* Modules */}
          <div data-pricing-modules className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-canvas rounded-[2rem] p-6 sm:p-7 border border-border/50">
              <h4 className="font-heading font-bold text-lg text-text-primary mb-1">
                Módulos adicionales
              </h4>
              <p className="text-text-primary/40 text-xs mb-6">
                Selecciona los que necesites
              </p>

              <div className="space-y-3">
                {pricingData.modules.map((mod) => {
                  const Icon = ICON_MAP[mod.icon];
                  const isSelected = selectedModules.includes(mod.id);

                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={[
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 text-left",
                        isSelected
                          ? "border-brand/40 bg-brand/5"
                          : "border-border/50 bg-surface hover:border-brand/20",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                          isSelected ? "bg-brand/15" : "bg-surface",
                        ].join(" ")}
                      >
                        {Icon && (
                          <Icon
                            className={`w-4 h-4 transition-colors duration-300 ${isSelected ? "text-brand" : "text-text-primary/30"
                              }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {mod.name}
                        </p>
                        <p className="text-xs text-text-primary/40 truncate mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-sm font-bold text-text-primary">
                          +{pricingData.currency}{mod.price}
                        </span>
                        <div
                          className={[
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                            isSelected
                              ? "bg-brand text-white"
                              : "bg-border/60 text-text-primary/30",
                          ].join(" ")}
                        >
                          {isSelected ? (
                            <Minus className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-accent rounded-[2rem] p-6 sm:p-7 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-sm font-medium">Tu plan mensual</span>
                <span className="text-xs text-white/30">
                  {selectedModules.length} módulo{selectedModules.length !== 1 ? "s" : ""} extra
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-extrabold text-4xl sm:text-5xl">
                  {pricingData.currency}{totalPrice}
                </span>
                <span className="text-white/40 text-base font-medium">
                  /{pricingData.base.period}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
