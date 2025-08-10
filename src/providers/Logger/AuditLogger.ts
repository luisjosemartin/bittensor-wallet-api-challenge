/* eslint-disable @typescript-eslint/max-params */
import { Request } from '#/types/Request';
import { AuditService } from '#/services/AuditService';
import { ApiKeyScope, AuditLogEventType } from '@prisma/client';
import { Logger } from '#/types/Logger';
import defaultLogger from '#/providers/Logger';

export class AuditLogger {
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor(auditService = new AuditService(), logger?: Logger) {
    this.auditService = auditService;
    this.logger = logger || defaultLogger;
  }

  public async logWalletCreation(
    req: Request,
    success: boolean,
    walletId?: string,
    error?: string
  ): Promise<void> {
    await this.logSecurityEvent(req, AuditLogEventType.WALLET_CREATION, success, {
      wallet_id: walletId || null,
      error: error || null,
    });
  }

  public async logAuthenticationFailure(
    req: Request,
    reason?: string,
    apiKeyPartial?: string
  ): Promise<void> {
    await this.logSecurityEvent(req, AuditLogEventType.API_KEY_USAGE, false, {
      reason: reason || null,
      api_key_partial: apiKeyPartial || null,
    });
  }

  public async logApiKeyUsage(
    req: Request,
    success: boolean,
    apiKeyId?: string,
    scopes?: ApiKeyScope[],
    endpoint?: string
  ): Promise<void> {
    await this.logSecurityEvent(req, AuditLogEventType.API_KEY_USAGE, success, {
      api_key_id: apiKeyId || null,
      scopes: scopes?.join(',') || null,
      endpoint: endpoint || null,
    });
  }

  public async logRateLimitExceeded(
    req: Request,
    metadata?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    await this.logSecurityEvent(req, AuditLogEventType.RATE_LIMIT_EXCEEDED, false, metadata);
  }

  public async logBalanceQuery(
    req: Request,
    success: boolean,
    walletId?: string,
    error?: string
  ): Promise<void> {
    await this.logSecurityEvent(req, AuditLogEventType.WALLET_READ, success, {
      wallet_id: walletId || null,
      operation: 'balance_query',
      error: error || null,
    });
  }

  private async logSecurityEvent(
    req: Request,
    eventType: AuditLogEventType,
    success: boolean,
    metadata?: Record<string, string | number | boolean | null>
  ): Promise<void> {
    try {
      switch (eventType) {
        case AuditLogEventType.WALLET_CREATION:
          await this.auditService.logWalletCreation(req, success, metadata);
          break;
        case AuditLogEventType.API_KEY_USAGE:
          await this.auditService.logApiKeyUsage(req, success, metadata);
          break;
        case AuditLogEventType.RATE_LIMIT_EXCEEDED:
          await this.auditService.logRateLimitExceeded(req, metadata);
          break;
        case AuditLogEventType.WALLET_READ:
          await this.auditService.logWalletRead(req, success, metadata);
          break;
        case AuditLogEventType.WALLET_TRANSFER:
        default:
          throw new Error(`Unknown event type: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to log security event`);
      this.logger.error(error as string);
    }
  }
}

export const auditLogger = new AuditLogger();
