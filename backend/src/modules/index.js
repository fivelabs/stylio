import healthRoutes from "./health/health.routes.js";
import tenantRoutes from "./tenants/tenant.routes.js";
import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./users/user.routes.js";
import preferencesRoutes from "./preferences/preferences.routes.js";
import appointmentsRoutes from "./appointments/appointments.routes.js";
import clientsRoutes from "./clients/clients.routes.js";
import servicesRoutes from "./services/services.routes.js";
import inventoryRoutes from "./inventory/inventory.routes.js";
import salesRoutes from "./sales/sales.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import googleRoutes from "./integrations/google/google.routes.js";
import billingRoutes from "./billing/billing.routes.js";

/**
 * Register all API modules.
 * To add a new module: create its folder, routes file, and add one line here.
 */
export function registerModules(app) {
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/tenants", tenantRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/preferences", preferencesRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/clients", clientsRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/integrations/google", googleRoutes);
  app.use("/api/billing", billingRoutes);
}
