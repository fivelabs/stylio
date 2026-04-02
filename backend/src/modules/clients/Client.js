import { TenantModel } from "../../core/Model.js";

export class Client extends TenantModel {
  static table = "clients";

  static findByRut(rut) {
    return this.findOne({ rut: rut.toUpperCase() });
  }

  static _searchBase(term) {
    const like = `%${term}%`;
    return this.query().where((b) =>
      b
        .whereRaw("first_name LIKE ?", [like])
        .orWhereRaw("last_name LIKE ?", [like])
        .orWhereRaw("alias LIKE ?", [like])
        .orWhereRaw("rut LIKE ?", [like])
    );
  }

  static search(term, { limit, offset, orderBy = "first_name asc" } = {}) {
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
