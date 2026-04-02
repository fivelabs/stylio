import { TenantModel } from "../../core/Model.js";

export class InventoryMovement extends TenantModel {
  static table = "inventory_movements";

  /**
   * Movements are immutable — no update or delete exposed.
   * Returns movements for a given item, newest first.
   */
  static listForItem(itemId, { limit, offset } = {}) {
    const q = this.query()
      .where({ item_id: itemId })
      .orderBy("created_at", "desc");
    if (limit != null) q.limit(limit);
    if (offset != null) q.offset(offset);
    return q;
  }

  static async countForItem(itemId) {
    const result = await this.query()
      .where({ item_id: itemId })
      .count("* as total")
      .first();
    return Number(result.total);
  }
}
