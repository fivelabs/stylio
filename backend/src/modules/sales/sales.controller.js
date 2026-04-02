import { db } from "../../config/database.js";
import { Appointment } from "../appointments/Appointment.js";
import { getCurrentTenant } from "../../core/tenantContext.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

const SORTABLE_COLUMNS = new Set(["start_at", "title", "service"]);
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
        b.whereRaw("title LIKE ?", [like]).orWhereRaw("service LIKE ?", [like])
      );
    }
    return q;
  }

  const [rows, countResult] = await Promise.all([
    baseQuery().orderBy(col, dir).limit(limit).offset(offset),
    baseQuery().count("* as total").first(),
  ]);

  const total = Number(countResult.total);

  res.json({
    data: rows.map(serialize),
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

  // Ventas diarias — DATE_FORMAT devuelve string YYYY-MM-DD directamente
  const salesRows = await db("appointments as a")
    .leftJoin("services as s", function () {
      this.on("s.name", "=", "a.service").andOn("s.tenant_id", "=", "a.tenant_id");
    })
    .where("a.tenant_id", tenant.id)
    .where("a.status", "completed")
    .whereRaw("DATE(a.start_at) >= ?", [sinceStr])
    .whereRaw("DATE(a.start_at) <= ?", [untilStr])
    .groupByRaw("DATE(a.start_at)")
    .select(
      db.raw("DATE_FORMAT(a.start_at, '%Y-%m-%d') as day"),
      db.raw("COALESCE(SUM(s.price), 0) as sales"),
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
      db.raw("DATE_FORMAT(created_at, '%Y-%m-%d') as day"),
      db.raw("SUM(cost) as purchases"),
    );

  // Los keys ahora son strings YYYY-MM-DD — coinciden exactamente con el loop
  const salesMap    = Object.fromEntries(salesRows.map((r) => [r.day, Number(r.sales)]));
  const purchaseMap = Object.fromEntries(purchaseRows.map((r) => [r.day, Number(r.purchases)]));

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

  // JOIN appointments con services por nombre para sumar el precio.
  // Si no hay coincidencia en services, la cita igual cuenta pero no aporta al total.
  const result = await db("appointments as a")
    .leftJoin("services as s", function () {
      this.on("s.name", "=", "a.service").andOn("s.tenant_id", "=", "a.tenant_id");
    })
    .where("a.tenant_id", tenant.id)
    .where("a.status", "completed")
    .where("a.start_at", ">=", since)
    .select(
      db.raw("COUNT(*) as count"),
      db.raw("COALESCE(SUM(s.price), 0) as earnings"),
    )
    .first();

  res.json({
    earnings_30d: Number(result.earnings),
    count_30d:    Number(result.count),
    since:        since.toISOString(),
  });
}

function serialize(row) {
  return {
    id:      row.id,
    title:   row.title,
    service: row.service,
    date:    row.start_at,
    color:   row.color,
    notes:   row.notes ?? null,
  };
}
