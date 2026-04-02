import { Appointment } from "./Appointment.js";
import * as googleService from "../integrations/google/google.service.js";

export async function listAppointments(req, res) {
  const { from, to } = req.query;

  const appointments = from && to
    ? await Appointment.findInRange(new Date(from), new Date(to))
    : await Appointment.findAll({}, { orderBy: "start_at asc" });

  res.json(appointments.map(serialize));
}

export async function createAppointment(req, res) {
  const { title, service, start, end, color, status, notes } = req.body;

  const appt = await Appointment.create({
    title,
    service,
    start_at: new Date(start),
    end_at:   new Date(end),
    color,
    status:   status ?? "requested",
    notes:    notes ?? null,
  });

  res.status(201).json(serialize(appt));

  googleService.syncCreate(req.tenant.id, appt)
    .then((googleEventId) => {
      if (googleEventId) Appointment.update(appt.id, { google_event_id: googleEventId });
    })
    .catch(() => {});
}

export async function updateAppointment(req, res) {
  const existing = await Appointment.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: "Cita no encontrada" });

  const { title, service, start, end, color, status, notes } = req.body;
  const payload = {};
  if (title   !== undefined) payload.title    = title;
  if (service !== undefined) payload.service  = service;
  if (start   !== undefined) payload.start_at = new Date(start);
  if (end     !== undefined) payload.end_at   = new Date(end);
  if (color   !== undefined) payload.color    = color;
  if (status  !== undefined) payload.status   = status;
  if (notes   !== undefined) payload.notes    = notes ?? null;

  const updated = await Appointment.update(existing.id, payload);
  res.json(serialize(updated));

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

function serialize(row) {
  return {
    id:      row.id,
    title:   row.title,
    service: row.service,
    start:   row.start_at,
    end:     row.end_at,
    color:   row.color,
    status:  row.status ?? "requested",
    notes:   row.notes ?? null,
  };
}
