import { db } from "../../config/database.js";
import { getCurrentTenant } from "../../core/tenantContext.js";
import { Client } from "../clients/Client.js";
import { Appointment } from "../appointments/Appointment.js";

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getStats(req, res) {
  const tenant = getCurrentTenant();
  const now    = new Date();

  // Rango del mes actual
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthStart   = localDateStr(firstOfMonth);
  const monthEnd     = localDateStr(lastOfMonth);
  const today        = localDateStr(now);

  const [appointmentsTodayResult, earningsResult, clientsResult] = await Promise.all([
    // Citas de hoy (no canceladas)
    db("appointments")
      .where("tenant_id", tenant.id)
      .whereNot("status", "cancelled")
      .whereRaw("DATE(start_at) = ?", [today])
      .count("* as total")
      .first(),

    // Ingresos del mes: citas completadas con JOIN a services para obtener precio
    db("appointments as a")
      .leftJoin("services as s", function () {
        this.on("s.name", "=", "a.service").andOn("s.tenant_id", "=", "a.tenant_id");
      })
      .where("a.tenant_id", tenant.id)
      .where("a.status", "completed")
      .whereRaw("DATE(a.start_at) >= ?", [monthStart])
      .whereRaw("DATE(a.start_at) <= ?", [monthEnd])
      .select(db.raw("COALESCE(SUM(s.price), 0) as earnings"))
      .first(),

    // Total de clientes registrados del tenant
    Client.query().count("* as total").first(),
  ]);

  res.json({
    appointments_today: Number(appointmentsTodayResult.total),
    earnings_month:     Number(earningsResult.earnings),
    clients_total:      Number(clientsResult.total),
    month_label:        firstOfMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
  });
}

export async function getUpcoming(req, res) {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 8));

  const rows = await Appointment.query()
    .where("start_at", ">=", new Date())
    .whereNot("status", "cancelled")
    .orderBy("start_at", "asc")
    .limit(limit);

  res.json(rows.map((r) => ({
    id:      r.id,
    title:   r.title,
    service: r.service,
    start:   r.start_at,
    end:     r.end_at,
    color:   r.color,
    status:  r.status ?? "requested",
    notes:   r.notes ?? null,
  })));
}
