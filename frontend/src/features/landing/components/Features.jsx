import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  Users,
  BarChart3,
  Bell,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    id: "agenda",
    title: "Agenda Inteligente",
    description:
      "Vista diaria, semanal y mensual con arrastrar y soltar. Sin dobles reservas.",
    icon: CalendarDays,
    color: "#8D7B68",
    ui: AgendaCard,
  },
  {
    id: "clients",
    title: "Fichas de Clientes",
    description:
      "Historial completo, preferencias, notas y fotos de cada servicio realizado.",
    icon: Users,
    color: "#A3B18A",
    ui: ClientsCard,
  },
  {
    id: "metrics",
    title: "Métricas en Tiempo Real",
    description:
      "Dashboard con ingresos, citas y retención. Datos que impulsan decisiones.",
    icon: BarChart3,
    color: "#8D7B68",
    ui: MetricsCard,
  },
  {
    id: "automation",
    title: "Automatización Total",
    description:
      "Recordatorios por WhatsApp, confirmaciones y seguimiento post-servicio.",
    icon: Bell,
    color: "#A3B18A",
    ui: AutomationCard,
  },
];

function AgendaCard() {
  const slots = [
    { time: "09:00", name: "María López", service: "Corte + Tinte", status: "confirmed" },
    { time: "10:30", name: "Ana García", service: "Manicura Gel", status: "confirmed" },
    { time: "11:45", name: "Carlos Ruiz", service: "Barba Clásica", status: "pending" },
    { time: "13:00", name: "Laura Díaz", service: "Mechas Balayage", status: "confirmed" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary/50 uppercase tracking-wider">
          Hoy — Mar 4
        </span>
        <span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
          4 citas
        </span>
      </div>
      {slots.map((slot) => (
        <div
          key={slot.time}
          className="flex items-center gap-3 bg-canvas rounded-xl px-3.5 py-2.5 border border-border/60"
        >
          <span className="text-xs font-mono font-semibold text-text-primary/40 w-11 shrink-0">
            {slot.time}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{slot.name}</p>
            <p className="text-xs text-text-primary/40 mt-0.5">{slot.service}</p>
          </div>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${slot.status === "confirmed" ? "bg-success" : "bg-amber-400"
              }`}
          />
        </div>
      ))}
    </div>
  );
}

function ClientsCard() {
  const clients = [
    { name: "María López", visits: 24, rating: 5, avatar: "ML", lastVisit: "Hace 3 días" },
    { name: "Ana García", visits: 18, rating: 4, avatar: "AG", lastVisit: "Hace 1 semana" },
    { name: "Laura Díaz", visits: 31, rating: 5, avatar: "LD", lastVisit: "Hoy" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary/50 uppercase tracking-wider">
          Top clientes
        </span>
        <span className="text-xs text-text-primary/40">Este mes</span>
      </div>
      {clients.map((client) => (
        <div
          key={client.name}
          className="flex items-center gap-3 bg-canvas rounded-xl px-3.5 py-2.5 border border-border/60"
        >
          <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center text-xs font-bold text-brand shrink-0">
            {client.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{client.name}</p>
            <p className="text-xs text-text-primary/40 mt-0.5">
              {client.visits} visitas · {client.lastVisit}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: client.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsCard() {
  const metrics = [
    { label: "Ingresos", value: "€4,280", change: "+12%", icon: TrendingUp },
    { label: "Citas", value: "142", change: "+8%", icon: Clock },
    { label: "Retención", value: "87%", change: "+3%", icon: CheckCircle },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-text-primary/50 uppercase tracking-wider">
          Dashboard
        </span>
        <span className="text-xs text-text-primary/40">Este mes</span>
      </div>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center gap-3 bg-canvas rounded-xl px-3.5 py-3 border border-border/60"
        >
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <metric.icon className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-text-primary/40">{metric.label}</p>
            <p className="text-base font-bold text-text-primary">{metric.value}</p>
          </div>
          <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
            {metric.change}
          </span>
        </div>
      ))}
    </div>
  );
}

function AutomationCard() {
  const automations = [
    { title: "Recordatorio 24h antes", status: "active", sent: "1,204 enviados" },
    { title: "Confirmación de cita", status: "active", sent: "980 enviados" },
    { title: "Seguimiento post-servicio", status: "active", sent: "756 enviados" },
    { title: "Oferta de cumpleaños", status: "paused", sent: "128 enviados" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-primary/50 uppercase tracking-wider">
          Automatizaciones
        </span>
        <span className="text-xs font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full">
          3 activas
        </span>
      </div>
      {automations.map((auto) => (
        <div
          key={auto.title}
          className="flex items-center gap-3 bg-canvas rounded-xl px-3.5 py-2.5 border border-border/60"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${auto.status === "active" ? "bg-success" : "bg-text-primary/20"
              }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{auto.title}</p>
            <p className="text-xs text-text-primary/40 mt-0.5">{auto.sent}</p>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${auto.status === "active"
              ? "text-success bg-success/10"
              : "text-text-primary/40 bg-text-primary/5"
              }`}
          >
            {auto.status === "active" ? "Activa" : "Pausada"}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;
  const UiComponent = feature.ui;

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
        delay: index * 0.1,
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "group relative bg-surface rounded-[2rem] p-7 sm:p-9 border transition-all duration-500 cursor-default",
        hovered
          ? "border-brand/30 shadow-xl shadow-brand/[0.06] -translate-y-1"
          : "border-border/50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${feature.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: feature.color }} />
        </div>
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${hovered ? "bg-success" : "bg-border"
            }`}
        />
      </div>

      <h3 className="font-heading font-bold text-xl text-text-primary mb-2">
        {feature.title}
      </h3>
      <p className="text-text-primary/50 text-sm leading-relaxed mb-7">
        {feature.description}
      </p>

      <div className="bg-canvas rounded-[1.5rem] p-4 border border-border/40">
        <UiComponent />
      </div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-features-title]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-features-title]",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-28 sm:py-36 px-6 sm:px-10 lg:px-16 bg-canvas"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16 sm:mb-20" data-features-title>
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-wider mb-4">
            Características
          </span>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-text-primary tracking-tight leading-tight mb-6">
            Todo lo que necesitas,
            <br />
            <span className="text-brand">nada que te sobre.</span>
          </h2>
          <p className="text-text-primary/50 text-lg leading-relaxed">
            Herramientas diseñadas con precisión quirúrgica para el día a día de
            profesionales de la estética.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
