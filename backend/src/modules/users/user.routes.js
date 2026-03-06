import { Router } from "express";
import { requireAuth, requireOwner } from "../../middleware/auth.js";
import { validate } from "../../core/validate.js";
import { createUserSchema, updateUserSchema } from "@stylio/shared/schemas/user.schema.js";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "./user.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireOwner);

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;
