import { Router } from "express";
import { requireAuth, requireOwner } from "../../middleware/auth.js";
import { validate } from "../../core/validate.js";
import { updatePreferencesSchema } from "@stylio/shared/schemas/preferences.schema.js";
import { getPreferences, updatePreferences } from "./preferences.controller.js";

const router = Router();

router.get("/", getPreferences);

router.put("/", requireAuth, requireOwner, validate(updatePreferencesSchema), updatePreferences);

export default router;
