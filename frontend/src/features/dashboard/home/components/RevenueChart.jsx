import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { salesService } from "@/api/sales.service";

const CLP = (v) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(v);

// Tooltip personalizado
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  // label viene como "YYYY-MM-DD", mostramos "DD MMM"
  const date = new Date(label + "T12:00:00");
  const formatted = date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });

  return (
    <div className="bg-canvas border border-border rounded-xl shadow-lg px-4 py-3 text-[13px]">
      <p className="font-semibold text-text-primary/70 mb-2">{formatted}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-text-primary/60">{entry.name}:</span>
          <span className="font-semibold text-text-primary">{CLP(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Formateador del eje X: solo mostramos algunos días para no saturar
function xTickFormatter(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

// Formateador del eje Y abreviado
function yTickFormatter(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

export default function RevenueChart({ onMonth }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    salesService.chart()
      .then((res) => {
        setData(res.data);
        onMonth?.(res.month);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[260px] flex items-center justify-center text-text-primary/30 text-[13px]">
        Cargando gráfico…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[260px] flex items-center justify-center text-red-400 text-[13px]">
        Error al cargar el gráfico.
      </div>
    );
  }

  // Si todos los valores son 0 mostramos un estado vacío
  const hasData = data.some((d) => d.sales > 0 || d.purchases > 0);

  return (
    <div className="w-full">
      {!hasData && (
        <p className="text-center text-[13px] text-text-primary/30 mb-4">
          Sin datos aún. Las ventas e ingresos de inventario aparecerán aquí.
        </p>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />

          <XAxis
            dataKey="day"
            tickFormatter={xTickFormatter}
            tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }}
            tickLine={false}
            axisLine={false}
            // Solo mostrar cada 5 días aprox para no saturar
            interval={4}
          />

          <YAxis
            tickFormatter={yTickFormatter}
            tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }}
            tickLine={false}
            axisLine={false}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => (
              <span style={{ color: "rgba(0,0,0,0.5)" }}>{value}</span>
            )}
          />

          <Line
            type="monotone"
            dataKey="sales"
            name="Ventas"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />

          <Line
            type="monotone"
            dataKey="purchases"
            name="Compras"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
