import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";

export default function Hero() {
  const videoRef = useRef(null);
  const [videoVisible, setVideoVisible] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVideoVisible(true); },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-accent overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10 pt-40 sm:pt-48 pb-20 sm:pb-28 text-center">
        <h1 className="tracking-tight leading-[1.08] mb-6">
          <span className="block font-heading font-extrabold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            La plataforma todo en uno
          </span>
          <span className="block font-display italic text-brand-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-1">
            para tu negocio.
          </span>
        </h1>

        <p className="text-white/60 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
          Organiza tu agenda, automatiza tus citas, fideliza a tus clientes
          y proyecta la imagen profesional que mereces.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <a
            href="#pricing"
            className="bg-brand text-white font-semibold px-8 py-3.5 rounded-full text-base inline-flex items-center gap-2.5 hover:bg-brand-light transition-colors duration-300 ease-apple active:scale-[0.97]"
          >
            Comenzar ahora
            <ArrowRightIcon size={16} weight="bold" />
          </a>
          <a
            href="#features"
            className="text-white/60 font-medium text-base hover:text-white transition-colors duration-300 ease-apple"
          >
            Conoce más
          </a>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10 pb-20 sm:pb-28">
        <div
          ref={videoRef}
          className="w-full rounded-2xl overflow-hidden border border-white/25 bg-black aspect-video relative shadow-2xl shadow-black/40"
        >
          {videoVisible && (
            <iframe
              src="https://www.youtube-nocookie.com/embed/wsaLjBy0T1c?autoplay=1&mute=1&loop=1&playlist=wsaLjBy0T1c&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
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
