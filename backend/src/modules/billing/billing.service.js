import { Polar } from "@polar-sh/sdk";
import { env } from "../../config/env.js";
import { Tenant } from "../tenants/Tenant.js";
import { db } from "../../config/database.js";

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_SANDBOX === "true" ? "sandbox" : "production",
});

export const billingService = {
  polar,

  async createCheckoutUrl(tenant) {
    const port = env.APP_FRONTEND_PORT ? `:${env.APP_FRONTEND_PORT}` : "";
    const successUrl = `${env.APP_FRONTEND_PROTOCOL}://${tenant.subdomain}.${env.TENANT_BASE_DOMAIN}${port}/login?billing=success`;

    const checkout = await polar.checkouts.create({
      products: [env.POLAR_PRODUCT_ID],
      externalCustomerId: tenant.subdomain,
      successUrl,
    });
    return { url: checkout.url, checkoutId: checkout.id };
  },

  async createPortalUrl(polarCustomerId, path = "") {
    const session = await polar.customerSessions.create({
      customerId: polarCustomerId,
    });
    if (!path) return session.customerPortalUrl;
    const url = new URL(session.customerPortalUrl);
    url.pathname = url.pathname.replace(/\/$/, "") + path;
    return url.toString();
  },

  async updateTenantBilling(subdomain, data) {
    await db("tenants").where({ subdomain }).update(data);
  },

  async findTenantByCheckoutId(checkoutId) {
    return Tenant.findOne({ polar_checkout_id: checkoutId });
  },

  /**
   * Verifica el estado actual de la suscripción directamente en Polar.
   * Llamar fire-and-forget en login para cubrir webhooks perdidos.
   */
  async getSubscriptionDetails(tenant) {
    if (!tenant.polar_subscription_id) return null;

    const sub = await polar.subscriptions.get({ id: tenant.polar_subscription_id });

    return {
      id: sub.id,
      status: sub.status,
      plan_name: sub.product?.name ?? "Plan mensual",
      interval: sub.recurringInterval ?? sub.recurring_interval ?? "month",
      current_period_end: sub.currentPeriodEnd ?? sub.current_period_end ?? null,
      cancel_at_period_end: sub.cancelAtPeriodEnd ?? sub.cancel_at_period_end ?? false,
    };
  },

  async syncSubscriptionStatus(tenant) {
    if (!tenant.polar_subscription_id) return;

    const subscription = await polar.subscriptions.get({
      id: tenant.polar_subscription_id,
    });

    if (subscription.status !== tenant.subscription_status) {
      await this.updateTenantBilling(tenant.subdomain, {
        subscription_status: subscription.status,
      });
    }
  },

  /**
   * Processes a verified Polar subscription webhook event.
   * Identifies the tenant by externalId or checkout_id fallback,
   * then updates billing columns accordingly.
   * Returns true if the tenant was found and updated, false otherwise.
   */
  async processSubscriptionEvent(event) {
    const sub = event.data;
    const externalId = sub?.customer?.external_id ?? sub?.customer?.externalId ?? null;
    const checkoutId = sub?.checkout_id ?? null;
    const customerId = sub?.customer_id ?? sub?.customer?.id ?? null;

    let subdomain = externalId;

    if (!subdomain && checkoutId) {
      const tenant = await this.findTenantByCheckoutId(checkoutId);
      subdomain = tenant?.subdomain ?? null;
    }

    if (!subdomain) return false;

    await this.updateTenantBilling(subdomain, {
      polar_customer_id: customerId,
      polar_subscription_id: sub.id,
      subscription_status: sub.status,
    });

    return true;
  },
};
