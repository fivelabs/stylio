import { Service } from "./Service.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SORTABLE_COLUMNS = new Set(["name", "price", "created_at"]);
const SORT_DIRECTIONS  = new Set(["asc", "desc"]);

function parseOrder(sortBy, sortDir) {
  const col = SORTABLE_COLUMNS.has(sortBy) ? sortBy : "name";
  const dir = SORT_DIRECTIONS.has(sortDir) ? sortDir : "asc";
  return `${col} ${dir}`;
}

export async function listServices(req, res) {
  const { q, sort_by, sort_dir } = req.query;
  const page    = Math.max(1, parseInt(req.query.page) || 1);
  const limit   = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const offset  = (page - 1) * limit;
  const term    = q?.trim();
  const orderBy = parseOrder(sort_by, sort_dir);

  const [rows, total] = await Promise.all([
    term
      ? Service.search(term, { limit, offset, orderBy })
      : Service.findAll({}, { orderBy, limit, offset }),
    term
      ? Service.countSearch(term)
      : Service.count(),
  ]);

  res.json({
    data: rows.map(serialize),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      sort_by:  orderBy.split(" ")[0],
      sort_dir: orderBy.split(" ")[1],
    },
  });
}

export async function getService(req, res) {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) return res.status(404).json({ error: "Servicio no encontrado" });
  res.json(serialize(service));
}

export async function createService(req, res) {
  const { name, description, price } = req.body;
  const service = await Service.create({ name, description: description ?? "", price });
  res.status(201).json(serialize(service));
}

export async function updateService(req, res) {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) return res.status(404).json({ error: "Servicio no encontrado" });

  const { name, description, price } = req.body;

  const payload = {};
  if (name        !== undefined) payload.name        = name;
  if (description !== undefined) payload.description = description;
  if (price       !== undefined) payload.price       = price;

  const updated = await Service.update(service.id, payload);
  res.json(serialize(updated));
}

export async function deleteService(req, res) {
  const service = await Service.findOne({ id: req.params.id });
  if (!service) return res.status(404).json({ error: "Servicio no encontrado" });

  await Service.delete(service.id);
  res.status(204).end();
}

function serialize(row) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    price:       Number(row.price),
    created_at:  row.created_at,
    updated_at:  row.updated_at,
  };
}
