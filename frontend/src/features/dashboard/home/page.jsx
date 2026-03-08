import { useAuth } from "@/app/providers/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-bold text-accent">
        Bienvenido, {user?.first_name}
      </h1>
      <p className="text-text-primary/50 mt-2">
        Panel de administración de tu salón. Próximamente: citas, clientes y más.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        {[
          { label: "Citas hoy", value: "—" },
          { label: "Clientes activos", value: "—" },
          { label: "Ingresos del mes", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <p className="text-sm text-text-primary/50">{card.label}</p>
            <p className="text-3xl font-bold text-accent mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
