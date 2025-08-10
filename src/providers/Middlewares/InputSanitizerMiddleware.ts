/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as sanitizer from 'perfect-express-sanitizer';
import { RequestHandler } from 'express';

export class InputSanitizerMiddleware {
  public sanitizeAll(): RequestHandler {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return sanitizer.clean({
      xss: true,
      sql: true,
      level: 5
    }) as RequestHandler;
  }

  /*
  * IMPROVEMENT: Implement detection logic and log the results as a security event
  */
  private detectThreats(): {
    hasXss: boolean;
    hasSqlInjection: boolean;
    hasNoSqlInjection: boolean;
  } {
    const hasXss = false; // Placeholder - implement detection logic with `await sanitizer.detectXss(req.body)`
    const hasSqlInjection = false; // Placeholder - implement detection logic with `await sanitizer.detectSqlInjection(req.body)`
    const hasNoSqlInjection = false; // Placeholder - implement detection logic with `await sanitizer.detectNoSqlInjection(req.body)`

    return { hasXss, hasSqlInjection, hasNoSqlInjection };
  }
}
