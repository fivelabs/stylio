export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "stylio",

  TENANT_BASE_DOMAIN: process.env.TENANT_BASE_DOMAIN || "localhost",

  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "change-refresh-in-production",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/integrations/google/callback",
  GOOGLE_WEBHOOK_URL: process.env.GOOGLE_WEBHOOK_URL || "",

  APP_FRONTEND_PORT: process.env.APP_FRONTEND_PORT || "5173",
  APP_FRONTEND_PROTOCOL: process.env.APP_FRONTEND_PROTOCOL || "http",

  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN || "",
  POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET || "",
  POLAR_PRODUCT_ID: process.env.POLAR_PRODUCT_ID || "",
  POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL || "http://localhost:5173/app?billing=success",
  POLAR_SANDBOX: process.env.POLAR_SANDBOX || "true",
};
