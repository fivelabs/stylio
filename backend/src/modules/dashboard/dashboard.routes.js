import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { getStats, getUpcoming } from "./dashboard.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.get("/stats",    getStats);
router.get("/upcoming", getUpcoming);

export default router;
