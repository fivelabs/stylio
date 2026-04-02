import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireActiveSubscription } from "../../middleware/subscription.js";
import { listSales, getSummary, getChart } from "./sales.controller.js";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.get("/summary", getSummary);
router.get("/chart",   getChart);
router.get("/",        listSales);

export default router;
