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
}
