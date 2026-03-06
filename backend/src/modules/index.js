import healthRoutes from "./health/health.routes.js";
import tenantRoutes from "./tenants/tenant.routes.js";
import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./users/user.routes.js";
import preferencesRoutes from "./preferences/preferences.routes.js";

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
}
