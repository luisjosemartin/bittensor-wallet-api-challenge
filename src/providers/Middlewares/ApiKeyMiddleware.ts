import { NextFunction } from "express";
import { Request } from "#/types/Request";
import { Response } from "#/types/Response";
import { ApiKeyService } from "#/services/ApiKeyService";
import { ApiKeyRepository } from "#/repositories/ApiKeyRepository";
import { ApiKeyScope } from "#/types/ApiKey/ApiKeyTypes";
import { RequestWithApiKey } from "#/types/Request/RequestWithApiKey";

export class ApiKeyMiddleware {
  private readonly apiKeyService: ApiKeyService;

  constructor(apiKeyService?: ApiKeyService) {
    this.apiKeyService = apiKeyService || new ApiKeyService(new ApiKeyRepository());
  }

  public auth(requiredScopes?: ApiKeyScope[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const apiKey = req.headers["x-api-key"];
        
        if (!apiKey)
          return res.status(401).json({
            error: "Authentication failed",
            message: "API key is required"
          });

        const validatedApiKey = await this.apiKeyService.validateApiKey(apiKey.toString());
        
        if (!validatedApiKey)
          return res.status(401).json({
            error: "Authentication failed",
            message: "Could not validate API key"
          });

        if (requiredScopes && requiredScopes.length > 0) {
          const hasRequiredScopes = requiredScopes.every(scope => 
            validatedApiKey.scopes.includes(scope)
          );

          if (!hasRequiredScopes)
            return res.status(403).json({
              error: "Insufficient permissions",
              message: `This API key does not have the required scopes: ${requiredScopes.join(', ')}`,
            });
        }

        (req as RequestWithApiKey).apiKey = validatedApiKey;
        next();
      } catch (error) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Authentication service unavailable"
        });
      }
    };
  }
}

export const apiKeyMiddleware = new ApiKeyMiddleware();
