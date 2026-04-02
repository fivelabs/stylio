import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { validate } from "../../core/validate.js";
import { createServiceSchema, updateServiceSchema } from "@stylio/shared/schemas/services.schema.js";
import { listServices, getService, createService, updateService, deleteService } from "./services.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.get("/",    listServices);
router.get("/:id", getService);
router.post("/",    validate(createServiceSchema), createService);
router.put("/:id",  validate(updateServiceSchema), updateService);
router.delete("/:id", deleteService);

export default router;
