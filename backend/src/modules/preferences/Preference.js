import { TenantModel } from "../../core/Model.js";

export class Preference extends TenantModel {
  static table = "preferences";

  static async findByTenantId(tenantId) {
    return this.query().where({ tenant_id: tenantId }).first();
  }

  static async getOrCreateForCurrentTenant() {
    const tenant = this._requireTenant();
    let pref = await this.findByTenantId(tenant.id);
    if (!pref) {
      pref = await this.create({
        visible_name: tenant.name,
        colors: null,
        logo_url: null,
        banner_horizontal_url: null,
        banner_vertical_url: null,
      });
    }
    return pref;
  }

  static async upsertForCurrentTenant(data) {
    const tenant = this._requireTenant();
    let pref = await this.findByTenantId(tenant.id);
    const payload = {
      visible_name: data.visible_name,
      colors: data.colors != null ? JSON.stringify(data.colors) : null,
      logo_url: data.logo_url,
      banner_horizontal_url: data.banner_horizontal_url,
      banner_vertical_url: data.banner_vertical_url,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    if (pref) {
      await this.update(pref.id, payload);
      return this.findById(pref.id);
    }
    return this.create(payload);
  }
}
