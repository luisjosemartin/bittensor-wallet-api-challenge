import { NextFunction } from "express";
import { Request } from "#/types/Request";
import { Response } from "#/types/Response";
import { db } from "#/providers/Database/PrismaClient";
import { RequestWithApiKey } from "#/types/Request/RequestWithApiKey";

export class ApiKeyMiddleware {
  public auth() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers["x-api-key"];
      if (!apiKey) res.status(401).json({ error: "Authentication failed" });
      else {
        const apiKeyFromDb = await db.apiKey.findUnique({
          where: { id: apiKey.toString() },
        });
        if (apiKeyFromDb) {
          (req as RequestWithApiKey).apiKey = apiKeyFromDb;
          next();
        } else res.status(401).json({ error: "Authentication failed" });
      }
    };
  }
}

export const apiKeyMiddleware = new ApiKeyMiddleware();
