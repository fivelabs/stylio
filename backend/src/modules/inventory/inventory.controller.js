import { db } from "../../config/database.js";
import { getCurrentTenant } from "../../core/tenantContext.js";
import { InventoryItem } from "./InventoryItem.js";
import { InventoryMovement } from "./InventoryMovement.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

const SORTABLE_COLUMNS = new Set(["name", "stock", "unit", "created_at"]);
const SORT_DIRECTIONS  = new Set(["asc", "desc"]);

function parseOrder(sortBy, sortDir) {
  const col = SORTABLE_COLUMNS.has(sortBy) ? sortBy : "name";
  const dir = SORT_DIRECTIONS.has(sortDir) ? sortDir : "asc";
  return `${col} ${dir}`;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function listItems(req, res) {
  const { q, sort_by, sort_dir } = req.query;
  const page    = Math.max(1, parseInt(req.query.page) || 1);
  const limit   = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const offset  = (page - 1) * limit;
  const term    = q?.trim();
  const orderBy = parseOrder(sort_by, sort_dir);

  const [rows, total] = await Promise.all([
    term
      ? InventoryItem.search(term, { limit, offset, orderBy })
      : InventoryItem.findAll({}, { orderBy, limit, offset }),
    term
      ? InventoryItem.countSearch(term)
      : InventoryItem.count(),
  ]);

  res.json({
    data: rows.map(serializeItem),
    meta: {
      total,
      page,
      limit,
      pages:    Math.ceil(total / limit),
      sort_by:  orderBy.split(" ")[0],
      sort_dir: orderBy.split(" ")[1],
    },
  });
}

export async function getItem(req, res) {
  const item = await InventoryItem.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(serializeItem(item));
}

export async function createItem(req, res) {
  const { name, description, unit, stock, low_stock_threshold, cost } = req.body;

  const item = await InventoryItem.create({
    name,
    description:         description ?? "",
    unit:                unit ?? "unidades",
    stock:               stock ?? 0,
    low_stock_threshold: low_stock_threshold ?? null,
    cost:                cost ?? 0,
  });

  // Si el stock inicial es > 0, registrar como movimiento de entrada
  if (Number(stock) > 0) {
    const tenant = getCurrentTenant();
    await db("inventory_movements").insert({
      tenant_id:   tenant.id,
      item_id:     item.id,
      type:        "in",
      quantity:    Number(stock),
      stock_after: Number(stock),
      note:        "Stock inicial",
      created_at:  db.fn.now(),
    });
  }

  res.status(201).json(serializeItem(item));
}

export async function updateItem(req, res) {
  const item = await InventoryItem.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Producto no encontrado" });

  const { name, description, unit, low_stock_threshold, cost } = req.body;

  const payload = {};
  if (name                !== undefined) payload.name                = name;
  if (description         !== undefined) payload.description         = description;
  if (unit                !== undefined) payload.unit                = unit;
  if (low_stock_threshold !== undefined) payload.low_stock_threshold = low_stock_threshold;
  if (cost                !== undefined) payload.cost                = cost;

  const updated = await InventoryItem.update(item.id, payload);
  res.json(serializeItem(updated));
}

export async function deleteItem(req, res) {
  const item = await InventoryItem.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Producto no encontrado" });

  await InventoryItem.delete(item.id);
  res.status(204).end();
}

// ─── Movements ────────────────────────────────────────────────────────────────

export async function listMovements(req, res) {
  const item = await InventoryItem.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Producto no encontrado" });

  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    InventoryMovement.listForItem(item.id, { limit, offset }),
    InventoryMovement.countForItem(item.id),
  ]);

  res.json({
    data: rows.map(serializeMovement),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function addMovement(req, res) {
  const item = await InventoryItem.findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: "Producto no encontrado" });

  const { type, quantity, note, cost } = req.body;

  const currentStock = Number(item.stock);
  const qty          = Number(quantity);
  const newStock     = type === "in" ? currentStock + qty : currentStock - qty;

  if (newStock < 0) {
    return res.status(400).json({ error: `Stock insuficiente. Stock actual: ${currentStock} ${item.unit}` });
  }

  const tenant = getCurrentTenant();

  const batchCost = (type === "in" && cost != null) ? Number(cost) : 0;

  // Transacción: insertar movimiento + actualizar stock (y sumar costo si es entrada)
  await db.transaction(async (trx) => {
    await trx("inventory_movements").insert({
      tenant_id:   tenant.id,
      item_id:     item.id,
      type,
      quantity:    qty,
      cost:        batchCost,
      stock_after: newStock,
      note:        note?.trim() || null,
      created_at:  trx.fn.now(),
    });

    const itemUpdate = { stock: newStock, updated_at: trx.fn.now() };
    if (type === "in" && batchCost > 0) {
      // Acumula el costo del lote al costo total del ítem
      itemUpdate.cost = db.raw("cost + ?", [batchCost]);
    }

    await trx("inventory_items")
      .where({ id: item.id })
      .update(itemUpdate);
  });

  const updated = await InventoryItem.findOne({ id: item.id });
  res.status(201).json(serializeItem(updated));
}

// ─── Serializers ──────────────────────────────────────────────────────────────

function serializeItem(row) {
  const stock     = Number(row.stock);
  const threshold = row.low_stock_threshold != null ? Number(row.low_stock_threshold) : null;

  let stockStatus = "ok";
  if (stock === 0) stockStatus = "empty";
  else if (threshold != null && stock <= threshold) stockStatus = "low";

  return {
    id:                  row.id,
    name:                row.name,
    description:         row.description,
    unit:                row.unit,
    stock,
    cost:                Number(row.cost ?? 0),
    low_stock_threshold: threshold,
    stock_status:        stockStatus,
    created_at:          row.created_at,
    updated_at:          row.updated_at,
  };
}

function serializeMovement(row) {
  return {
    id:          row.id,
    type:        row.type,
    quantity:    Number(row.quantity),
    cost:        Number(row.cost ?? 0),
    stock_after: Number(row.stock_after),
    note:        row.note,
    created_at:  row.created_at,
  };
}
