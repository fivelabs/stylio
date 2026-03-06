import { Router } from "express";
import { getCurrent } from "./tenant.controller.js";

const router = Router();

router.get("/current", getCurrent);

export default router;