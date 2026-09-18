import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.ts";
import logger from "./utils/logger.js";
import { requestId } from "./middleware/requestId.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import v1Routes from "./routes/v1/index.js";
import healthRoutes from "./routes/v1/health.js";
import legacyAuth from "../routes/jwtAuth.js";
import legacyApi from "../routes/userRoutes.js";
import legacyDashboard from "../routes/dashboard.js";
import { openApiSpec } from "./docs/openapi.js";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(requestId);

  if (env.NODE_ENV !== "test") {
    app.use(
      pinoHttp({
        logger,
        genReqId: (req) => req.requestId,
        customProps: (req) => ({ requestId: req.requestId }),
      })
    );
  }

  app.use("/health", healthRoutes);
  app.use("/api/v1", v1Routes);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use("/auth", legacyAuth);
  app.use("/api", legacyApi);
  app.use("/dashboard", legacyDashboard);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
