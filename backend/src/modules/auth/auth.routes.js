import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../core/validate.js";
import { loginSchema, registerSchema } from "@stylio/shared/schemas/auth.schema.js";
import { login, register, refresh, me } from "./auth.controller.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);

export default router;
