import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, Clock, Zap, ShieldCheck } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-tag]", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
      })
        .from(
          "[data-hero-title] span",
          { y: 60, opacity: 0, duration: 1, stagger: 0.12 },
          "-=0.4"
        )
        .from(
          "[data-hero-desc]",
          { y: 40, opacity: 0, duration: 0.9 },
          "-=0.5"
        )
        .from(
          "[data-hero-cta] > *",
          { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 },
          "-=0.4"
        )
        .from(
          "[data-hero-visual]",
          { x: 60, opacity: 0, duration: 1.1 },
          "-=1.2"
        )
        .from(
          "[data-hero-float]",
          { y: 30, opacity: 0, duration: 0.7, stagger: 0.15 },
          "-=0.6"
        )
        .from(
          "[data-hero-preview]",
          { y: 60, opacity: 0, scale: 0.96, duration: 1.2 },
          "-=0.6"
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVideoVisible(true); },
      { rootMargin: "200px" }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-dvh bg-accent overflow-hidden flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-accent/90 pointer-events-none" />
      <div className="hidden sm:block absolute top-0 right-0 w-[500px] h-[500px] bg-brand/6 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-[350px] h-[350px] bg-brand/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16 pb-16 pt-28 sm:pt-32">
        {/* Two-column: text + visual */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: content */}
          <div>

            <h1
              data-hero-title
              className="font-heading font-extrabold tracking-tight leading-[1.05] mb-8"
            >
              <span className="block text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] xl:text-6xl">
                La plataforma todo en uno para emprendedores
              </span>
            </h1>

            <p
              data-hero-desc
              className="text-white/55 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl font-light"
            >
              Organiza tu agenda, automatiza tus citas, fideliza a tus clientes
              y proyecta la imagen profesional que mereces.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-10" data-hero-cta>
              <a
                href="#pricing"
                className="btn-magnetic bg-brand text-white font-semibold px-8 py-4 rounded-full text-base inline-flex items-center gap-2"
              >
                <span className="inline-flex items-center gap-2">
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
              <button className="btn-magnetic bg-white/10 border border-white/15 text-white font-medium px-8 py-4 rounded-full text-base inline-flex items-center gap-2 hover:bg-white/15 transition-colors">
                <span className="inline-flex items-center gap-2">
                  Ver demo
                </span>
              </button>
            </div>
          </div>

          {/* Right: visual composition */}
          <div data-hero-visual className="relative hidden lg:block">
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl shadow-black/30">
              <img
                src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=1000&fit=crop&q=80"
                alt="Profesional de estética"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/60 via-transparent to-transparent" />
            </div>

            {/* Floating cards */}
            <div
              data-hero-float
              className="absolute -left-8 top-16 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-black/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">1h/diaria</p>
                <p className="text-xs text-text-primary/50">Tiempo ahorrado en gestión</p>
              </div>
            </div>

            <div
              data-hero-float
              className="absolute -left-4 bottom-28 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-black/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Cero fricción</p>
                <p className="text-xs text-text-primary/50">Directo a atender</p>
              </div>
            </div>

            <div
              data-hero-float
              className="absolute -right-4 bottom-12 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-black/10 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Automático</p>
                <p className="text-xs text-text-primary/50">Citas y recordatorios sin esfuerzo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video preview */}
        <div
          ref={videoRef}
          data-hero-preview
          className="mt-12 w-full rounded-[2rem] overflow-hidden border border-white/10 bg-black aspect-video relative"
        >
          {videoVisible && (
            <iframe
              src="https://www.youtube-nocookie.com/embed/UhWvaK5YUNY?autoplay=1&mute=1&loop=1&playlist=UhWvaK5YUNY&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
              title="Stylio demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </section>
  );
}
