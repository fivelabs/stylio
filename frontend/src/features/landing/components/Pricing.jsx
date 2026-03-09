import { useState } from "react";
import {
  CheckIcon,
  MegaphoneIcon,
  PackageIcon,
  TrendUpIcon,
  UsersIcon,
  PlusIcon,
  MinusIcon,
} from "@phosphor-icons/react";
import pricingData from "../data/pricing.json";

const ICON_MAP = {
  Megaphone: MegaphoneIcon,
  Package: PackageIcon,
  TrendingUp: TrendUpIcon,
  Users: UsersIcon,
};

export default function Pricing() {
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

  return (
    <section
      id="pricing"
      className="relative py-32 sm:py-40 px-6 sm:px-10 lg:px-16 bg-surface"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-24">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-[3.5rem] text-text-primary tracking-tight leading-[1.1] mb-5">
            Simple y transparente.
          </h2>
          <p className="text-text-primary/40 text-lg leading-relaxed">
            Una base sólida con módulos que añades solo si los necesitas.
            Sin sorpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 bg-canvas rounded-2xl p-8 sm:p-10">
            <h3 className="font-heading font-bold text-xl text-text-primary mb-1.5">
              {pricingData.base.name}
            </h3>
            <p className="text-text-primary/40 text-sm mb-8 max-w-md leading-relaxed">
              {pricingData.base.description}
            </p>

            <div className="flex items-baseline gap-1.5 mb-8">
              <span className="font-heading font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight">
                {pricingData.currency} {pricingData.base.price.toLocaleString()}
              </span>
              <span className="text-text-primary/40 text-base font-medium">
                /{pricingData.base.period}
              </span>
            </div>

            <ul className="space-y-3 mb-10">
              {pricingData.base.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon size={16} weight="bold" className="text-success mt-0.5 shrink-0" />
                  <span className="text-text-primary/60 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button className="w-full bg-brand text-white font-semibold py-3.5 rounded-full text-[15px] hover:bg-brand-light transition-colors duration-300 ease-apple active:scale-[0.98]">
              Empieza ahora
            </button>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-canvas rounded-2xl p-6 sm:p-7">
              <h4 className="font-heading font-bold text-lg text-text-primary mb-1">
                Módulos adicionales
              </h4>
              <p className="text-text-primary/40 text-xs mb-5">
                Selecciona los que necesites
              </p>

              <div className="space-y-2.5">
                {pricingData.modules.map((mod) => {
                  const Icon = ICON_MAP[mod.icon];
                  const isSelected = selectedModules.includes(mod.id);

                  return (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={[
                        "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ease-apple text-left",
                        isSelected
                          ? "bg-brand/10 ring-1 ring-brand/25"
                          : "bg-surface hover:bg-surface/80",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ease-apple",
                          isSelected ? "bg-brand/10" : "bg-canvas",
                        ].join(" ")}
                      >
                        {Icon && (
                          <Icon
                            size={16}
                            className={`transition-colors duration-300 ease-apple ${isSelected ? "text-brand" : "text-text-primary/25"}`}
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
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-text-primary/60">
                          +{pricingData.currency}{mod.price}
                        </span>
                        <div
                          className={[
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ease-apple",
                            isSelected
                              ? "bg-brand text-white"
                              : "bg-black/10 text-text-primary/25",
                          ].join(" ")}
                        >
                          {isSelected ? (
                            <MinusIcon size={11} weight="bold" />
                          ) : (
                            <PlusIcon size={11} weight="bold" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-accent rounded-2xl p-6 sm:p-7 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-medium">Tu plan mensual</span>
                <span className="text-xs text-white/25">
                  {selectedModules.length} módulo{selectedModules.length !== 1 ? "s" : ""} extra
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight">
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
