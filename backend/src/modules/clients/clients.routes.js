import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { validate } from "../../core/validate.js";
import { createClientSchema, updateClientSchema } from "@stylio/shared/schemas/clients.schema.js";
import { listClients, getClient, createClient, updateClient, deleteClient } from "./clients.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.get("/", listClients);
router.get("/:id", getClient);
router.post("/", validate(createClientSchema), createClient);
router.put("/:id", validate(updateClientSchema), updateClient);
router.delete("/:id", deleteClient);

export default router;
