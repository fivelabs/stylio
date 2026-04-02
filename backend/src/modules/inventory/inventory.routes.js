import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { validate } from "../../core/validate.js";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createMovementSchema,
} from "@stylio/shared/schemas/inventory.schema.js";
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  listMovements,
  addMovement,
} from "./inventory.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

// Items
router.get("/",    listItems);
router.get("/:id", getItem);
router.post("/",    validate(createInventoryItemSchema), createItem);
router.put("/:id",  validate(updateInventoryItemSchema), updateItem);
router.delete("/:id", deleteItem);

// Movements
router.get("/:id/movements",  listMovements);
router.post("/:id/movements", validate(createMovementSchema), addMovement);

export default router;
