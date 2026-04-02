import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { validate } from "../../core/validate.js";
import { createAppointmentSchema, updateAppointmentSchema } from "@stylio/shared/schemas/appointments.schema.js";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "./appointments.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.get("/", listAppointments);
router.post("/", validate(createAppointmentSchema), createAppointment);
router.put("/:id", validate(updateAppointmentSchema), updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
