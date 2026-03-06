import { db } from "../config/database.js";
import { getCurrentTenant } from "./tenantContext.js";

/**
 * Base model — thin wrapper over Knex query builder.
 * Extend this for tables that are NOT tenant-scoped.
 */
export class Model {
  static table = "";

  static query() {
    return db(this.table);
  }

  static async findById(id) {
    return this.query().where({ id }).first();
  }

  static async findOne(where = {}) {
    return this.query().where(where).first();
  }

  static async findAll(where = {}, { orderBy, limit, offset } = {}) {
    const q = this.query().where(where);
    if (orderBy) q.orderByRaw(orderBy);
    if (limit != null) q.limit(limit);
    if (offset != null) q.offset(offset);
    return q;
  }

  static async create(data) {
    const [id] = await this.query().insert(data);
    return { id, ...data };
  }

  static async update(id, data) {
    await this.query().where({ id }).update(data);
    return this.findById(id);
  }

  static async delete(id) {
    const count = await this.query().where({ id }).del();
    return count > 0;
  }

  static async count(where = {}) {
    const result = await this.query().where(where).count("* as total").first();
    return result.total;
  }
}

/**
 * Tenant-scoped model — every query is automatically filtered by the
 * current tenant from AsyncLocalStorage context.
 */
export class TenantModel extends Model {
  static _requireTenant() {
    const tenant = getCurrentTenant();
    if (!tenant) throw new Error("No tenant in context");
    return tenant;
  }

  static query() {
    const tenant = this._requireTenant();
    return db(this.table).where({ tenant_id: tenant.id });
  }

  static async create(data) {
    const tenant = this._requireTenant();
    return super.create({ tenant_id: tenant.id, ...data });
  }
}
