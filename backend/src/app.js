import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { swaggerServe, swaggerSetup } from "./core/swagger.js";
import { tenantMiddleware } from "./middleware/tenant.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { registerModules } from "./modules/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// En producción el frontend está en frontend/dist (relativo a la raíz del repo)
// backend/src/app.js → ../../frontend/dist
const FRONTEND_DIST = path.join(__dirname, "../../frontend/dist");

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

app.use("/api/docs", swaggerServe, swaggerSetup);

app.use(tenantMiddleware);

registerModules(app);

app.use(errorHandler);

// ─── Serve frontend SPA (solo en producción) ──────────────────────────────────
// Debe ir DESPUÉS de todas las rutas /api para no interferir
if (process.env.NODE_ENV === "production") {
  app.use(express.static(FRONTEND_DIST));

  // Fallback: cualquier ruta que no sea /api devuelve index.html (React Router)
  app.get("*", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

export { app };
