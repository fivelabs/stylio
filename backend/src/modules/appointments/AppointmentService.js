import { db } from "../../config/database.js";

/**
 * AppointmentService — manages rows in the appointment_services junction table.
 * Not tenant-scoped directly; scoping comes through the appointment FK.
 */
export class AppointmentService {
  static table = "appointment_services";

  static query() {
    return db(this.table);
  }

  static async findByAppointment(appointmentId) {
    return this.query()
      .where({ appointment_id: appointmentId })
      .select(
        "appointment_services.id",
        "appointment_services.service_id",
        "appointment_services.price",
        "services.name as service_name",
      )
      .leftJoin("services", "services.id", "appointment_services.service_id");
  }

  static async findByAppointments(appointmentIds) {
    if (!appointmentIds.length) return [];
    return db(this.table)
      .whereIn("appointment_id", appointmentIds)
      .select(
        "appointment_services.id",
        "appointment_services.appointment_id",
        "appointment_services.service_id",
        "appointment_services.price",
        "services.name as service_name",
      )
      .leftJoin("services", "services.id", "appointment_services.service_id");
  }

  /** Replace all services for an appointment in a single transaction. */
  static async replaceForAppointment(appointmentId, services, trx = null) {
    const qb = trx || db;
    await qb(this.table).where({ appointment_id: appointmentId }).del();
    if (services.length) {
      const rows = services.map((s) => ({
        appointment_id: appointmentId,
        service_id:     s.service_id,
        price:          s.price,
      }));
      await qb(this.table).insert(rows);
    }
  }

  static async deleteByAppointment(appointmentId) {
    return this.query().where({ appointment_id: appointmentId }).del();
  }
}
