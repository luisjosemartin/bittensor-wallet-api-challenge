import { Router } from "express";
import { BaseRouter } from "./BaseRouter";
import { HealthController } from "#/controllers/HealthController";

export class HealthRouter extends BaseRouter {
  private readonly healthController = new HealthController();
  
  constructor() {
    super("/health", Router());
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/",
      this.healthController.get
    );
  }
}
