import { db } from "../../config/database.js";
import { Appointment } from "../appointments/Appointment.js";
import { AppointmentService } from "../appointments/AppointmentService.js";
import { getCurrentTenant } from "../../core/tenantContext.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

const SORTABLE_COLUMNS = new Set(["start_at", "title"]);
const SORT_DIRECTIONS  = new Set(["asc", "desc"]);

function parseOrder(sortBy, sortDir) {
  const col = SORTABLE_COLUMNS.has(sortBy) ? sortBy : "start_at";
  const dir = SORT_DIRECTIONS.has(sortDir) ? sortDir : "desc";
  return { col, dir };
}

export async function listSales(req, res) {
  const { q, sort_by, sort_dir, from, to } = req.query;
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const term   = q?.trim();
  const { col, dir } = parseOrder(sort_by, sort_dir);

  function baseQuery() {
    const q = Appointment.query().where("status", "completed");
    if (from) q.where("start_at", ">=", new Date(from));
    if (to)   q.where("start_at", "<=", new Date(to));
    if (term) {
      const like = `%${term}%`;
      q.where((b) =>
        b.whereRaw("title LIKE ?", [like])
      );
    }
    return q;
  }

  const [rows, countResult] = await Promise.all([
    baseQuery().orderBy(col, dir).limit(limit).offset(offset),
    baseQuery().count("* as total").first(),
  ]);

  const total = Number(countResult.total);

  // Fetch services for each appointment
  const ids = rows.map((r) => r.id);
  const allServices = await AppointmentService.findByAppointments(ids);
  const servicesByAppt = {};
  for (const s of allServices) {
    if (!servicesByAppt[s.appointment_id]) servicesByAppt[s.appointment_id] = [];
    servicesByAppt[s.appointment_id].push({
      id:           s.id,
      service_id:   s.service_id,
      service_name: s.service_name,
      price:        Number(s.price),
    });
  }

  res.json({
    data: rows.map((row) => serialize(row, servicesByAppt[row.id] || [])),
    meta: {
      total,
      page,
      limit,
      pages:    Math.ceil(total / limit),
      sort_by:  col,
      sort_dir: dir,
    },
  });
}

// Formatea un Date local como "YYYY-MM-DD" sin tocar UTC
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getChart(req, res) {
  const tenant = getCurrentTenant();

  // Primer y último día del mes actual en hora local del servidor
  const now      = new Date();
  const year     = now.getFullYear();
  const month    = now.getMonth(); // 0-indexed
  const since    = new Date(year, month, 1);
  const until    = new Date(year, month + 1, 0); // último día del mes

  const sinceStr = localDateStr(since);
  const untilStr = localDateStr(until);

  // Ventas diarias — suma precios desde appointment_services
  const salesRows = await db("appointments as a")
    .leftJoin("appointment_services as aps", "aps.appointment_id", "a.id")
    .where("a.tenant_id", tenant.id)
    .where("a.status", "completed")
    .whereRaw("DATE(a.start_at) >= ?", [sinceStr])
    .whereRaw("DATE(a.start_at) <= ?", [untilStr])
    .groupByRaw("DATE(a.start_at)")
    .select(
      db.raw("DATE(a.start_at) as day"),
      db.raw("COALESCE(SUM(aps.price), 0) as sales"),
    );

  // Compras diarias
  const purchaseRows = await db("inventory_movements")
    .where("tenant_id", tenant.id)
    .where("type", "in")
    .where("cost", ">", 0)
    .whereRaw("DATE(created_at) >= ?", [sinceStr])
    .whereRaw("DATE(created_at) <= ?", [untilStr])
    .groupByRaw("DATE(created_at)")
    .select(
      db.raw("DATE(created_at) as day"),
      db.raw("SUM(cost) as purchases"),
    );

  // DATE() puede devolver un objeto Date en algunos drivers — normalizamos a string YYYY-MM-DD
  const toKey = (v) => (v instanceof Date ? localDateStr(v) : String(v));
  const salesMap    = Object.fromEntries(salesRows.map((r) => [toKey(r.day), Number(r.sales)]));
  const purchaseMap = Object.fromEntries(purchaseRows.map((r) => [toKey(r.day), Number(r.purchases)]));

  const days      = [];
  const totalDays = until.getDate();
  for (let i = 1; i <= totalDays; i++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    days.push({
      day:       key,
      sales:     salesMap[key]    ?? 0,
      purchases: purchaseMap[key] ?? 0,
    });
  }

  res.json({
    data:  days,
    month: since.toLocaleDateString("es-CL", { month: "long", year: "numeric" }),
  });
}

export async function getSummary(req, res) {
  const tenant  = getCurrentTenant();
  const since   = new Date();
  since.setDate(since.getDate() - 30);

  // Suma precios desde appointment_services para citas completadas
  const result = await db("appointments as a")
    .leftJoin("appointment_services as aps", "aps.appointment_id", "a.id")
    .where("a.tenant_id", tenant.id)
    .where("a.status", "completed")
    .where("a.start_at", ">=", since)
    .select(
      db.raw("COUNT(DISTINCT a.id) as count"),
      db.raw("COALESCE(SUM(aps.price), 0) as earnings"),
    )
    .first();

  res.json({
    earnings_30d: Number(result.earnings),
    count_30d:    Number(result.count),
    since:        since.toISOString(),
  });
}

function serialize(row, services = []) {
  return {
    id:       row.id,
    title:    row.title,
    services,
    date:     row.start_at,
    color:    row.color,
    notes:    row.notes ?? null,
  };
}
