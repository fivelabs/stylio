// Solo estos statuses permiten acceso
const ALLOWED_STATUSES = new Set(["trialing", "active", "canceled"]);

export function requireActiveSubscription(req, res, next) {
  const status = req.tenant?.subscription_status;

  if (!status || !ALLOWED_STATUSES.has(status)) {
    return res.status(402).json({
      error: "subscription_required",
      subscription_status: status ?? null,
    });
  }

  next();
}
