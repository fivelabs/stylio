import { z } from "zod";

const COLOR_VALUES  = ["brand", "rose", "indigo", "emerald", "amber"];
const STATUS_VALUES = ["requested", "verified", "completed", "cancelled"];

export const createAppointmentSchema = z
  .object({
    title:   z.string().min(1, { error: "El nombre del cliente es requerido" }).max(150),
    service: z.string().min(1, { error: "El servicio es requerido" }).max(150),
    start:   z.iso.datetime({ error: "Fecha de inicio inválida" }),
    end:     z.iso.datetime({ error: "Fecha de fin inválida" }),
    color:   z.enum(COLOR_VALUES).default("brand"),
    status:  z.enum(STATUS_VALUES).default("requested"),
    notes:   z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => new Date(data.end) > new Date(data.start),
    { error: "La fecha de fin debe ser posterior a la de inicio", path: ["end"] },
  );

export const updateAppointmentSchema = z
  .object({
    title:   z.string().min(1).max(150).optional(),
    service: z.string().min(1).max(150).optional(),
    start:   z.iso.datetime({ error: "Fecha de inicio inválida" }).optional(),
    end:     z.iso.datetime({ error: "Fecha de fin inválida" }).optional(),
    color:   z.enum(COLOR_VALUES).optional(),
    status:  z.enum(STATUS_VALUES).optional(),
    notes:   z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) return new Date(data.end) > new Date(data.start);
      return true;
    },
    { error: "La fecha de fin debe ser posterior a la de inicio", path: ["end"] },
  );
