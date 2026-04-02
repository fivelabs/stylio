import { Router } from "express";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { requireAuth, requireOwner } from "../../middleware/auth.js";
import { env } from "../../config/env.js";
import { billingService } from "./billing.service.js";
import { getStatus, getSubscriptionDetails, checkout, portal } from "./billing.controller.js";

const router = Router();

router.get("/status", requireAuth, getStatus);
router.get("/subscription", requireAuth, getSubscriptionDetails);
router.get("/checkout", requireAuth, requireOwner, checkout);
router.get("/portal", requireAuth, requireOwner, portal);

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.revoked",
  "subscription.canceled",
  "subscription.uncanceled",
]);

router.post("/webhook", async (req, res) => {
  if (!req.rawBody) return res.status(400).json({ error: "Missing raw body" });

  const webhookHeaders = {
    "webhook-id": req.headers["webhook-id"],
    "webhook-timestamp": req.headers["webhook-timestamp"],
    "webhook-signature": req.headers["webhook-signature"],
  };

  let event;
  try {
    event = validateEvent(req.rawBody, webhookHeaders, env.POLAR_WEBHOOK_SECRET);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return res.status(403).json({ received: false });
    }
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    if (SUBSCRIPTION_EVENTS.has(event.type)) {
      await billingService.processSubscriptionEvent(event);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.json({ received: true });
});

export default router;
