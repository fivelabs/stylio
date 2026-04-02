import { billingService } from "./billing.service.js";

export function getStatus(req, res) {
  const { tenant } = req;
  res.json({
    subscription_status: tenant.subscription_status ?? null,
    polar_customer_id: tenant.polar_customer_id ?? null,
    polar_subscription_id: tenant.polar_subscription_id ?? null,
    has_subscription: !!tenant.polar_subscription_id,
  });
}

export async function getSubscriptionDetails(req, res, next) {
  try {
    const details = await billingService.getSubscriptionDetails(req.tenant);
    res.json(details ?? { has_subscription: false });
  } catch (err) {
    next(err);
  }
}

export async function checkout(req, res, next) {
  try {
    const { url, checkoutId } = await billingService.createCheckoutUrl(req.tenant);
    await billingService.updateTenantBilling(req.tenant.subdomain, {
      polar_checkout_id: checkoutId,
    });
    res.json({ url });
  } catch (err) {
    next(err);
  }
}

export async function portal(req, res, next) {
  try {
    const { polar_customer_id } = req.tenant;
    if (!polar_customer_id) {
      return res.status(400).json({ error: "No active subscription to manage" });
    }
    const path = req.query.path ?? "";
    const url  = await billingService.createPortalUrl(polar_customer_id, path);
    res.json({ url });
  } catch (err) {
    next(err);
  }
}
