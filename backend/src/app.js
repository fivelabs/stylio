import express from "express";
import cors from "cors";
import { swaggerServe, swaggerSetup } from "./core/swagger.js";
import { tenantMiddleware } from "./middleware/tenant.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { registerModules } from "./modules/index.js";

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));

app.use("/api/docs", swaggerServe, swaggerSetup);

app.use(tenantMiddleware);

registerModules(app);

app.use(errorHandler);

export { app };
