import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import {
Request,
Response,
NextFunction
} from 'express';
import logger from '#/providers/Logger';
import { auditLogger } from '../Logger/AuditLogger';

export interface RateLimitConfig {
  keyGenerator?: (req: Request) => string;
  points: number;
  duration: number;
  blockDuration?: number;
  execEvenly?: boolean;
}

export class RateLimitMiddleware {
  private limiters: Map<string, RateLimiterMemory> = new Map();

  /**
   * Middleware function for rate limiting
   */
  public middleware(name: string, config: RateLimitConfig) {
    logger.debug(`[RateLimit] Creating limiter for ${name}`);
    const limiter = this.createLimiter(name, config);
    logger.debug(`[RateLimit] Created limiter for ${name}`);
    
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = config.keyGenerator ? config.keyGenerator(req) : this.getClientKey(req);
        
        // Add timeout to prevent hanging
        const consumePromise = limiter.consume(key);
        const timeoutPromise = new Promise((_resolve, reject) => {
          setTimeout(() => { reject(new Error('Rate limiter timeout')); }, 5000);
        });

        // Ugly. For some reason, with the second try of a request with no api key, it hangs.
        // This is a workaround to prevent the second request from hanging.
        Promise.race([consumePromise, timeoutPromise])
          .then((rateLimiterRes: RateLimiterRes) => {
            this.addRateLimitHeaders(res, rateLimiterRes, config);
            logger.debug(`[RateLimit] ${name}: ${key} - ${rateLimiterRes.remainingPoints} remaining`);
            next();
          })
          .catch((rateLimiterRes) => {
            if (rateLimiterRes instanceof Error) {
              logger.error(`[RateLimit] ${name}: Rate limiter error for ${key}: ${rateLimiterRes.message}`);
              next();
              return;
            }

            const secs = Math.round((rateLimiterRes as RateLimiterRes).msBeforeNext / 1000) || 1;
            this.addRateLimitHeaders(res, rateLimiterRes as RateLimiterRes, config);
            res.set('Retry-After', String(secs));
            logger.warn(`[RateLimit] ${name}: Rate limit exceeded for ${this.getClientKey(req)}, retry after ${secs}s`);

            const details = {
              limit: config.points,
              window: `${config.duration} seconds`,
              reset_time: new Date(Date.now() + (rateLimiterRes as RateLimiterRes).msBeforeNext).toISOString(),
              retry_after: secs
            }

        auditLogger.logRateLimitExceeded(req, {
          error: 'Rate limit exceeded',
          ...details
        }).catch(err => { logger.error('Failed to log rate limit exceeded: ' + err); });

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
            details
          },
          timestamp: new Date().toISOString()
        });
          });
      } catch (error) {
        logger.error(`[RateLimit] ${name}: Unexpected error: ${error}`);
        next();
      }
    };
  }

  private createLimiter(name: string, config: RateLimitConfig): RateLimiterMemory {
    // Improvement: Use Redis for rate limiting when scaling to multiple instances
    const limiter = new RateLimiterMemory({
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration || config.duration,
      execEvenly: config.execEvenly || false,
    });

    this.limiters.set(name, limiter);
    logger.debug(`[RateLimit] Created limiter "${name}": ${config.points} requests per ${config.duration}s`);
    
    return limiter;
  }

  private getClientKey(req: Request): string {
    // Try to get real IP from various headers
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
    const ip = cfConnectingIp || realIp || (forwarded && forwarded.split(',')[0]) || req.socket.remoteAddress || req.ip;

    return `ip:${ip}`;
  }

  /**
   * Add standard rate limit headers to response
   */
  private addRateLimitHeaders(res: Response, rateLimiterRes: RateLimiterRes, config: RateLimitConfig): void {
    res.set({
      'X-RateLimit-Limit': String(config.points),
      'X-RateLimit-Remaining': String(rateLimiterRes.remainingPoints || 0),
      'X-RateLimit-Reset': String(new Date(Date.now() + rateLimiterRes.msBeforeNext)),
      'X-RateLimit-Window': String(config.duration)
    });
  }

  // Not used for now
  public createUserLimiter(name: string, config: RateLimitConfig) {
    const userConfig = {
      ...config,
      keyGenerator: (req: Request) => {
        // Use API key for user-specific limiting
        const apiKey = req.headers['x-api-key'] as string;
        return apiKey ? `user:${apiKey}` : this.getClientKey(req);
      }
    };

    return this.middleware(name, userConfig);
  }
}

export const rateLimitMiddleware = new RateLimitMiddleware();
