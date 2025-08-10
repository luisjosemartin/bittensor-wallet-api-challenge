import { RateLimitConfig } from '#/providers/Middlewares/RateLimitMiddleware';

/**
 * Rate limiting configurations for different endpoints and scenarios
 */
export const rateLimitConfigs = {
  // Health check: Very low for testing purposes
  healthCheck: {
    points: 5,
    duration: 60,
    blockDuration: 60,
    execEvenly: false
  } as RateLimitConfig,

  // Wallet creation: 5 requests per hour per IP (as specified in requirements)
  walletCreation: {
    points: 5,
    duration: 3600,
    blockDuration: 3600,
    execEvenly: true
  } as RateLimitConfig,

  // Balance checks: 100 requests per minute per user
  balanceCheck: {
    points: 100,
    duration: 60,
    blockDuration: 60,
    execEvenly: false
  } as RateLimitConfig,

  // Transfers: 10 requests per minute per wallet
  transfer: {
    points: 10,
    duration: 60,
    blockDuration: 300,
    execEvenly: true
  } as RateLimitConfig,

  // Transaction history: 50 requests per minute per user
  transactionHistory: {
    points: 50,
    duration: 60,
    blockDuration: 60,
    execEvenly: false
  } as RateLimitConfig,

  // IMPROVEMENT: Add a global rate limit for all endpoints as a fallback
  global: {
    points: 20,
    duration: 60,
    blockDuration: 60,
    execEvenly: false
  } as RateLimitConfig,
};
