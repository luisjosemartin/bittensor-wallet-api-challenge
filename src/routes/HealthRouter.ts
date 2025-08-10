import { Router } from "express";
import { BaseRouter } from "./BaseRouter";
import { HealthController } from "#/controllers/HealthController";
import { ApiKeyMiddleware } from "#/providers/Middlewares/ApiKeyMiddleware";
import { ApiKeyValidator } from "#/validators/ApiKeyValidator";

export class HealthRouter extends BaseRouter {
  private healthController: HealthController;
  private apiKeyMiddleware: ApiKeyMiddleware;
  private apiKeyValidator: ApiKeyValidator;
  
  constructor(healthController = new HealthController()) {
    super("/health", Router());
    this.healthController = healthController;
    this.apiKeyMiddleware = new ApiKeyMiddleware();
    this.apiKeyValidator = new ApiKeyValidator();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/",
      this.apiKeyValidator.validate(),
      this.apiKeyMiddleware.auth(),
      this.healthController.get
    );
  }
}
