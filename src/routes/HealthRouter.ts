import { Router } from "express";
import { BaseRouter } from "./BaseRouter";
import { HealthController } from "#/controllers/HealthController";
import { rateLimitMiddleware } from "#/providers/Middlewares/RateLimitMiddleware";
import { rateLimitConfigs } from "#/config/rateLimits";

export class HealthRouter extends BaseRouter {
  private readonly healthController = new HealthController();
  
  constructor() {
    super("/health", Router());
    this.initializeRoutes();
  }

  initializeRoutes() {
    // GET /health - Health check with generous rate limits
    this.router.get(
      "/",
      rateLimitMiddleware.middleware('health-check', rateLimitConfigs.healthCheck),
      this.healthController.get
    );
  }
}
