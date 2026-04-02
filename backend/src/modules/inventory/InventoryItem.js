import { TenantModel } from "../../core/Model.js";

export class InventoryItem extends TenantModel {
  static table = "inventory_items";

  static _searchBase(term) {
    const like = `%${term}%`;
    return this.query().where((b) =>
      b
        .whereRaw("name LIKE ?", [like])
        .orWhereRaw("description LIKE ?", [like])
    );
  }

  static search(term, { limit, offset, orderBy = "name asc" } = {}) {
    const [col, dir = "asc"] = orderBy.split(" ");
    const q = this._searchBase(term).orderBy(col, dir);
    if (limit != null) q.limit(limit);
    if (offset != null) q.offset(offset);
    return q;
  }

  static async countSearch(term) {
    const result = await this._searchBase(term).count("* as total").first();
    return Number(result.total);
  }
}
