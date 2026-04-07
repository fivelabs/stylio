import { TenantModel } from "../../core/Model.js";
import { db } from "../../config/database.js";
import { getCurrentTenant } from "../../core/tenantContext.js";

export class Service extends TenantModel {
  static table = "services";

  /** Override base query to exclude soft-deleted rows by default. */
  static query() {
    const tenant = this._requireTenant();
    return db(this.table)
      .where({ tenant_id: tenant.id })
      .whereNull("deleted_at");
  }

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

  /** Soft-delete: sets deleted_at instead of removing the row. */
  static async softDelete(id) {
    await db(this.table).where({ id }).update({ deleted_at: new Date() });
    return true;
  }
}
