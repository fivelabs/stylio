import { Router } from "express";
import { requireAuth, requireOwner } from "../../../middleware/auth.js";
import {
  getAuthUrl,
  handleCallback,
  getStatus,
  disconnectGoogle,
  handleWebhook,
} from "./google.controller.js";

const router = Router();

router.get("/auth",       requireAuth, requireOwner, getAuthUrl);
router.get("/callback",   handleCallback);
router.get("/status",     requireAuth, getStatus);
router.delete("/",        requireAuth, requireOwner, disconnectGoogle);
router.post("/webhook",   handleWebhook);

export default router;
