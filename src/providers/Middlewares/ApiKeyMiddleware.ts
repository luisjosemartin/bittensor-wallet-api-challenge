import { NextFunction } from "express";
import { Request } from "#/types/Request";
import { Response } from "#/types/Response";
import { ApiKeyService } from "#/services/ApiKeyService";
import { ApiKeyScope } from "#/types/ApiKey/ApiKeyTypes";
import { RequestWithApiKey } from "#/types/Request/RequestWithApiKey";
import { auditLogger } from "#/providers/Logger/AuditLogger";

export class ApiKeyMiddleware {
  private readonly apiKeyService: ApiKeyService;

  constructor() {
    this.apiKeyService = new ApiKeyService();
  }

  public auth(requiredScopes?: ApiKeyScope[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const apiKey = req.headers["x-api-key"];

        if (!apiKey) {
          // Log authentication failure - missing API key
          await auditLogger.logAuthenticationFailure(req, 'Missing API key');
          
          return res.status(401).json({
            success: false,
            error: { code: "UNAUTHENTICATED", message: "Authentication failed" },
            timestamp: new Date().toISOString()
          });
        }

        const validatedApiKey = await this.apiKeyService.validateApiKey(apiKey.toString());
        
        if (!validatedApiKey) {
          // Log authentication failure - invalid API key
          const apiKeyPartial = apiKey.toString().substring(0, 8) + '...';
          await auditLogger.logAuthenticationFailure(req, 'Invalid API key', apiKeyPartial);
          
          return res.status(401).json({
            success: false,
            error: { code: "UNAUTHENTICATED", message: "Authentication failed" },
            timestamp: new Date().toISOString()
          });
        }

        if (requiredScopes && requiredScopes.length > 0) {
          const hasRequiredScopes = requiredScopes.every(scope =>
            validatedApiKey.scopes.includes(scope)
          );

          if (!hasRequiredScopes)
            await auditLogger.logApiKeyUsage(req, false, validatedApiKey.id, validatedApiKey.scopes, req.path);

            return res.status(403).json({
              success: false,
              error: { code: "UNAUTHORIZED", message: `This API key does not have the required scopes: ${requiredScopes.join(', ')}` },
              timestamp: new Date().toISOString()
            });
        }

        (req as RequestWithApiKey).apiKey = validatedApiKey;
        
        // Log successful API key usage
        await auditLogger.logApiKeyUsage(
          req,
          true,
          validatedApiKey.id,
          validatedApiKey.scopes,
          req.path
        );
        
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: { code: "INTERNAL_SERVER_ERROR", message: "Authentication service unavailable" },
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

export const apiKeyMiddleware = new ApiKeyMiddleware();
