import { Appointment } from "./Appointment.js";
import { AppointmentService } from "./AppointmentService.js";
import * as googleService from "../integrations/google/google.service.js";

export async function listAppointments(req, res) {
  const { from, to } = req.query;

  const appointments = from && to
    ? await Appointment.findInRange(new Date(from), new Date(to))
    : await Appointment.findAll({}, { orderBy: "start_at asc" });

  const ids = appointments.map((a) => a.id);
  const allServices = await AppointmentService.findByAppointments(ids);

  const servicesByAppt = {};
  for (const s of allServices) {
    if (!servicesByAppt[s.appointment_id]) servicesByAppt[s.appointment_id] = [];
    servicesByAppt[s.appointment_id].push({
      id:           s.id,
      service_id:   s.service_id,
      service_name: s.service_name,
      price:        Number(s.price),
    });
  }

  res.json(appointments.map((a) => serialize(a, servicesByAppt[a.id] || [])));
}

export async function createAppointment(req, res) {
  const { title, services, start, end, color, status, notes } = req.body;

  const appt = await Appointment.create({
    title,
    start_at: new Date(start),
    end_at:   new Date(end),
    color,
    status:   status ?? "requested",
    notes:    notes ?? null,
  });

  await AppointmentService.replaceForAppointment(appt.id, services);
  const apptServices = await AppointmentService.findByAppointment(appt.id);

  res.status(201).json(serialize(appt, serializeServices(apptServices)));

  googleService.syncCreate(req.tenant.id, appt)
    .then((googleEventId) => {
      if (googleEventId) Appointment.update(appt.id, { google_event_id: googleEventId });
    })
    .catch(() => {});
}

export async function updateAppointment(req, res) {
  const existing = await Appointment.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: "Cita no encontrada" });

  const { title, services, start, end, color, status, notes } = req.body;
  const payload = {};
  if (title   !== undefined) payload.title    = title;
  if (start   !== undefined) payload.start_at = new Date(start);
  if (end     !== undefined) payload.end_at   = new Date(end);
  if (color   !== undefined) payload.color    = color;
  if (status  !== undefined) payload.status   = status;
  if (notes   !== undefined) payload.notes    = notes ?? null;

  const updated = Object.keys(payload).length
    ? await Appointment.update(existing.id, payload)
    : existing;

  if (services !== undefined) {
    await AppointmentService.replaceForAppointment(updated.id, services);
  }

  const apptServices = await AppointmentService.findByAppointment(updated.id);
  res.json(serialize(updated, serializeServices(apptServices)));

  googleService.syncUpdate(req.tenant.id, existing.google_event_id, {
    ...existing,
    ...payload,
  }).catch(() => {});
}

export async function deleteAppointment(req, res) {
  const existing = await Appointment.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: "Cita no encontrada" });

  await Appointment.delete(existing.id);
  res.status(204).end();

  googleService.syncDelete(req.tenant.id, existing.google_event_id).catch(() => {});
}

function serializeServices(rows) {
  return rows.map((s) => ({
    id:           s.id,
    service_id:   s.service_id,
    service_name: s.service_name,
    price:        Number(s.price),
  }));
}

function serialize(row, services = []) {
  return {
    id:       row.id,
    title:    row.title,
    services,
    start:    row.start_at,
    end:      row.end_at,
    color:    row.color,
    status:   row.status ?? "requested",
    notes:    row.notes ?? null,
  };
}
