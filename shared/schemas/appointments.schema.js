import { z } from "zod";

const COLOR_VALUES  = ["brand", "rose", "indigo", "emerald", "amber"];
const STATUS_VALUES = ["requested", "verified", "completed", "cancelled"];

const appointmentServiceSchema = z.object({
  service_id: z.number({ error: "El servicio es requerido" }).int().positive(),
  price:      z.number({ error: "El precio debe ser un número" }).min(0, { error: "El precio no puede ser negativo" }),
});

export const createAppointmentSchema = z
  .object({
    title:    z.string().min(1, { error: "El nombre del cliente es requerido" }).max(150),
    services: z.array(appointmentServiceSchema).min(1, { error: "Debes agregar al menos un servicio" }),
    start:    z.iso.datetime({ error: "Fecha de inicio inválida" }),
    end:      z.iso.datetime({ error: "Fecha de fin inválida" }),
    color:    z.enum(COLOR_VALUES).default("brand"),
    status:   z.enum(STATUS_VALUES).default("requested"),
    notes:    z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => new Date(data.end) > new Date(data.start),
    { error: "La fecha de fin debe ser posterior a la de inicio", path: ["end"] },
  );

export const updateAppointmentSchema = z
  .object({
    title:    z.string().min(1).max(150).optional(),
    services: z.array(appointmentServiceSchema).min(1, { error: "Debes agregar al menos un servicio" }).optional(),
    start:    z.iso.datetime({ error: "Fecha de inicio inválida" }).optional(),
    end:      z.iso.datetime({ error: "Fecha de fin inválida" }).optional(),
    color:    z.enum(COLOR_VALUES).optional(),
    status:   z.enum(STATUS_VALUES).optional(),
    notes:    z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) return new Date(data.end) > new Date(data.start);
      return true;
    },
    { error: "La fecha de fin debe ser posterior a la de inicio", path: ["end"] },
  );
