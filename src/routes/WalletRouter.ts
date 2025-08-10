import { Router } from "express";
import { WalletController } from "#/controllers/WalletController";
import { WalletValidator } from "#/validators/WalletValidator";
import { ApiKeyMiddleware } from "#/providers/Middlewares/ApiKeyMiddleware";
import { BaseRouter } from "#/routes/BaseRouter";
import { ApiKeyScope } from "#/types/ApiKey/ApiKeyTypes";
import { ApiKeyValidator } from "#/validators/ApiKeyValidator";
import { InputSanitizerMiddleware } from "#/providers/Middlewares/InputSanitizerMiddleware";
import { rateLimitMiddleware } from "#/providers/Middlewares/RateLimitMiddleware";
import { rateLimitConfigs } from "#/config/rateLimits";

export class WalletRouter extends BaseRouter {
  private readonly walletController = new WalletController();
  private readonly apiKeyMiddleware = new ApiKeyMiddleware();
  private readonly walletValidator = new WalletValidator();
  private readonly apiKeyValidator = new ApiKeyValidator();
  private readonly inputSanitizerMiddleware = new InputSanitizerMiddleware();

  constructor() {
    super("/wallets", Router());
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    // POST /wallets - Create new wallet
    this.router.post(
      "/",
      rateLimitMiddleware.middleware('wallet-creation', rateLimitConfigs.walletCreation),
      this.inputSanitizerMiddleware.sanitizeAll(),
      this.apiKeyValidator.getValidators(),
      this.apiKeyMiddleware.auth([ApiKeyScope.WALLET_CREATE]),
      this.walletValidator.getValidators("createWallet"),
      this.walletController.createWallet
    );
  }
}
