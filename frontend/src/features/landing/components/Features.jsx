import {
  CalendarBlankIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon,
  StarIcon,
  ClockIcon,
  TrendUpIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

const FEATURES = [
  {
    id: "agenda",
    title: "Agenda Inteligente",
    description:
      "Vista diaria, semanal y mensual con arrastrar y soltar. Sin dobles reservas.",
    icon: CalendarBlankIcon,
    color: "#8D7B68",
    ui: AgendaCard,
  },
  {
    id: "clients",
    title: "Fichas de Clientes",
    description:
      "Historial completo, preferencias, notas y fotos de cada servicio realizado.",
    icon: UsersIcon,
    color: "#A3B18A",
    ui: ClientsCard,
  },
  {
    id: "metrics",
    title: "Métricas en Tiempo Real",
    description:
      "Dashboard con ingresos, citas y retención. Datos que impulsan decisiones.",
    icon: ChartBarIcon,
    color: "#8D7B68",
    ui: MetricsCard,
  },
  {
    id: "automation",
    title: "Automatización Total",
    description:
      "Recordatorios por WhatsApp, confirmaciones y seguimiento post-servicio.",
    icon: BellIcon,
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-primary/40 tracking-wide">
          Hoy — Mar 4
        </span>
        <span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
          4 citas
        </span>
      </div>
      {slots.map((slot) => (
        <div
          key={slot.time}
          className="flex items-center gap-3 bg-canvas/80 rounded-xl px-3.5 py-2.5"
        >
          <span className="text-xs font-mono font-medium text-text-primary/40 w-11 shrink-0">
            {slot.time}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{slot.name}</p>
            <p className="text-xs text-text-primary/40 mt-0.5">{slot.service}</p>
          </div>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${slot.status === "confirmed" ? "bg-success" : "bg-amber-400"}`}
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-primary/40 tracking-wide">
          Top clientes
        </span>
        <span className="text-xs text-text-primary/40">Este mes</span>
      </div>
      {clients.map((client) => (
        <div
          key={client.name}
          className="flex items-center gap-3 bg-canvas/80 rounded-xl px-3.5 py-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-[11px] font-bold text-brand shrink-0">
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
              <StarIcon key={i} size={11} weight="fill" className="text-amber-400" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsCard() {
  const metrics = [
    { label: "Ingresos", value: "€4,280", change: "+12%", icon: TrendUpIcon },
    { label: "Citas", value: "142", change: "+8%", icon: ClockIcon },
    { label: "Retención", value: "87%", change: "+3%", icon: CheckCircleIcon },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-primary/40 tracking-wide">
          Dashboard
        </span>
        <span className="text-xs text-text-primary/40">Este mes</span>
      </div>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center gap-3 bg-canvas/80 rounded-xl px-3.5 py-3"
        >
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <metric.icon size={15} className="text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-text-primary/40">{metric.label}</p>
            <p className="text-[15px] font-bold text-text-primary">{metric.value}</p>
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-primary/40 tracking-wide">
          Automatizaciones
        </span>
        <span className="text-xs font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full">
          3 activas
        </span>
      </div>
      {automations.map((auto) => (
        <div
          key={auto.title}
          className="flex items-center gap-3 bg-canvas/80 rounded-xl px-3.5 py-2.5"
        >
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${auto.status === "active" ? "bg-success" : "bg-text-primary/25"}`}
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

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  const UiComponent = feature.ui;

  return (
    <div className="group bg-surface rounded-2xl p-7 sm:p-8 transition-shadow duration-300 ease-apple hover:shadow-lg hover:shadow-black/5">
      <div className="mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${feature.color}12` }}
        >
          <Icon size={20} style={{ color: feature.color }} />
        </div>
      </div>

      <h3 className="font-heading font-bold text-lg text-text-primary mb-1.5">
        {feature.title}
      </h3>
      <p className="text-text-primary/40 text-sm leading-relaxed mb-6">
        {feature.description}
      </p>

      <div className="bg-surface rounded-xl p-4">
        <UiComponent />
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative pt-0 pb-32 sm:pb-40 px-6 sm:px-10 lg:px-16 bg-canvas overflow-hidden"
    >
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none z-0"
        style={{
          height: "clamp(16rem, 24vh, 20rem)",
          background: [
            "linear-gradient(to bottom,",
            "#1A1A1A 0%,",
            "#222 8%,",
            "#2A2A2A 16%,",
            "#383838 24%,",
            "#484848 32%,",
            "#5C5C5C 40%,",
            "#727272 48%,",
            "#8E8E8E 56%,",
            "#ACACAA 64%,",
            "#C4C4C2 72%,",
            "#D8D8D6 80%,",
            "#ECECEA 88%,",
            "#F8F8F6 94%,",
            "#FDFDFD 100%)",
          ].join(" "),
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto pt-[clamp(18rem,26vh,22rem)]">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-[3.5rem] text-text-primary tracking-tight leading-[1.1] mb-5">
            Todo lo que necesitas.
            <br />
            <span className="font-display italic text-brand">Nada que te sobre.</span>
          </h2>
          <p className="text-text-primary/40 text-lg leading-relaxed">
            Herramientas diseñadas para el día a día de
            profesionales de la estética.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
