import { AuditLogEventType } from '@prisma/client';

export interface CreateAuditLogRequest {
  eventType: AuditLogEventType;
  apiKeyId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AuditLogResponse {
  id: string;
}
