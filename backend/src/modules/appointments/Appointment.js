import { TenantModel } from "../../core/Model.js";

export class Appointment extends TenantModel {
  static table = "appointments";

  static findInRange(startAt, endAt) {
    return this.query()
      .where("start_at", ">=", startAt)
      .where("start_at", "<", endAt)
      .orderBy("start_at", "asc");
  }
}
