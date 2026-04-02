import { Client } from "./Client.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SORTABLE_COLUMNS = new Set(["first_name", "last_name", "alias", "rut", "created_at"]);
const SORT_DIRECTIONS = new Set(["asc", "desc"]);

function parseOrder(sortBy, sortDir) {
  const col = SORTABLE_COLUMNS.has(sortBy) ? sortBy : "first_name";
  const dir = SORT_DIRECTIONS.has(sortDir) ? sortDir : "asc";
  return `${col} ${dir}`;
}

export async function listClients(req, res) {
  const { q, sort_by, sort_dir } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const term = q?.trim();
  const orderBy = parseOrder(sort_by, sort_dir);

  const [rows, total] = await Promise.all([
    term
      ? Client.search(term, { limit, offset, orderBy })
      : Client.findAll({}, { orderBy, limit, offset }),
    term
      ? Client.countSearch(term)
      : Client.count(),
  ]);

  res.json({
    data: rows.map(serialize),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      sort_by: orderBy.split(" ")[0],
      sort_dir: orderBy.split(" ")[1],
    },
  });
}

export async function getClient(req, res) {
  const client = await Client.findOne({ id: req.params.id });
  if (!client) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(serialize(client));
}

export async function createClient(req, res) {
  const { rut, first_name, last_name, alias } = req.body;

  // Verificar RUT duplicado solo si viene
  if (rut) {
    const existing = await Client.findByRut(rut);
    if (existing) return res.status(409).json({ error: "Ya existe un cliente con ese RUT" });
  }

  const client = await Client.create({
    rut:        rut ?? null,
    first_name: first_name ?? null,
    last_name:  last_name ?? "",
    alias:      alias ?? null,
  });
  res.status(201).json(serialize(client));
}

export async function updateClient(req, res) {
  const client = await Client.findOne({ id: req.params.id });
  if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

  const { rut, first_name, last_name, alias } = req.body;

  if (rut && rut !== client.rut) {
    const duplicate = await Client.findByRut(rut);
    if (duplicate) return res.status(409).json({ error: "Ya existe un cliente con ese RUT" });
  }

  const payload = {};
  if (rut        !== undefined) payload.rut        = rut ?? null;
  if (first_name !== undefined) payload.first_name = first_name ?? null;
  if (last_name  !== undefined) payload.last_name  = last_name;
  if (alias      !== undefined) payload.alias      = alias ?? null;

  const updated = await Client.update(client.id, payload);
  res.json(serialize(updated));
}

export async function deleteClient(req, res) {
  const client = await Client.findOne({ id: req.params.id });
  if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

  await Client.delete(client.id);
  res.status(204).end();
}

function serialize(row) {
  return {
    id:         row.id,
    rut:        row.rut ?? null,
    first_name: row.first_name ?? null,
    last_name:  row.last_name ?? null,
    alias:      row.alias ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
