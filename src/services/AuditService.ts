import { Request } from '#/types/Request';
import { RequestWithApiKey } from '#/types/Request/RequestWithApiKey';
import { AuditRepository } from '#/repositories/AuditRepository';
import { CreateAuditLogRequest, AuditLogResponse } from '#/types/Audit/AuditTypes';
import { AuditLogEventType } from '@prisma/client';

export class AuditService {
  private readonly auditRepository: AuditRepository;

  constructor(auditRepository = new AuditRepository()) {
    this.auditRepository = auditRepository;
  }

  public async logWalletCreation(
    req: Request,
    success: boolean,
    metadata?: { wallet_id?: string; error?: string }
  ): Promise<AuditLogResponse> {
    return await this.createAuditLog(req, {
      eventType: AuditLogEventType.WALLET_CREATION,
      success,
      metadata,
    });
  }

  public async logAuthenticationFailure(
    req: Request,
    metadata?: { reason?: string; api_key_partial?: string }
  ): Promise<AuditLogResponse> {
    return await this.createAuditLog(req, {
      eventType: AuditLogEventType.API_KEY_USAGE,
      success: false,
      metadata,
    });
  }

  public async logApiKeyUsage(
    req: Request,
    success: boolean,
    metadata?: Record<string, string | number | boolean | null>
  ): Promise<AuditLogResponse> {
    return await this.createAuditLog(req, {
      eventType: AuditLogEventType.API_KEY_USAGE,
      success,
      metadata,
    });
  }

  public async logRateLimitExceeded(
    req: Request,
    metadata?: Record<string, string | number | boolean | null>
  ): Promise<AuditLogResponse> {
    return await this.createAuditLog(req, {
      eventType: AuditLogEventType.RATE_LIMIT_EXCEEDED,
      success: false,
      metadata,
    });
  }

  public async logWalletRead(
    req: Request,
    success: boolean,
    metadata?: Record<string, string | number | boolean | null>
  ): Promise<AuditLogResponse> {
    return await this.createAuditLog(req, {
      eventType: AuditLogEventType.WALLET_READ,
      success,
      metadata,
    });
  }

  /**
   * Generic method to create audit log entries
   * 
   * IMPROVEMENT: Have a way to not log while testing (with an environment variable)
   * as it significantly slows down the tests
   */
  public async createAuditLog(
    req: Request,
    params: {
      eventType: AuditLogEventType;
      success: boolean;
      metadata?: Record<string, string | number | boolean | null>;
      error?: string;
    }
  ): Promise<AuditLogResponse> {
    const auditData: CreateAuditLogRequest = {
      eventType: params.eventType,
      apiKeyId: this.extractApiKeyId(req),
      ipAddress: this.extractIpAddress(req),
      userAgent: this.extractUserAgent(req),
      success: params.success,
      metadata: params.metadata,
    };

    return await this.auditRepository.create(auditData);
  }

  private extractApiKeyId(req: RequestWithApiKey): string {
    return req.apiKey?.id || (req.headers['x-api-key'] as string);
  }

  private extractIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for']; // TODO: Check if this is the correct header
    if (forwarded && typeof forwarded === 'string') 
      return forwarded.split(',')[0].trim();
    
    const realIp = req.headers['x-real-ip']; // TODO: Check if this is the correct header
    if (realIp && typeof realIp === 'string') 
      return realIp;

    // Fall back to connection remote address
    try {
      const socket = (req as unknown as { socket: { remoteAddress: string } }).socket;
      const connection = (req as unknown as { connection: { remoteAddress: string } }).connection;
      return socket.remoteAddress || connection.remoteAddress || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private extractUserAgent(req: Request): string {
    return (req.headers['user-agent'] as string) || 'unknown';
  }
}
