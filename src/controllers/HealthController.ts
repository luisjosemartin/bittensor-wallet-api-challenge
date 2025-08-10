import { Response } from "#/types/Response";
import { Request } from "#/types/Request";

export class HealthController {
  public get = (req: Request, res: Response) => {
    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    res.json({ data: healthStatus });
  };
}
