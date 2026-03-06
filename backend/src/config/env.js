export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),

  DB_HOST: process.env.DB_HOST || "127.0.0.1",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "stylio",

  TENANT_BASE_DOMAIN: process.env.TENANT_BASE_DOMAIN || "localhost",

  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};
