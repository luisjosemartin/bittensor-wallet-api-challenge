import { db } from "#/providers/Database/PrismaClient";

import { CreateAuditLogRequest, AuditLogResponse } from '#/types/Audit/AuditTypes';

export class AuditRepository {
  /**
   * Create a new audit log entry
   */
  public async create(data: CreateAuditLogRequest): Promise<AuditLogResponse> {
    const auditLog = await db.auditLog.create({
      data: {
        eventType: data.eventType,
        apiKeyId: data.apiKeyId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success,
        metadata: data.metadata || {},
      },
    });

    return { id: auditLog.id };
  }
}
