import express from "express";
import cors from "cors";
import { swaggerServe, swaggerSetup } from "./core/swagger.js";
import { tenantMiddleware } from "./middleware/tenant.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { registerModules } from "./modules/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/docs", swaggerServe, swaggerSetup);

app.use(tenantMiddleware);

registerModules(app);

app.use(errorHandler);

export { app };
