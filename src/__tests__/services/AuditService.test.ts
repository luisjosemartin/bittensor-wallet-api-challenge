/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach
} from 'vitest';
import { AuditService } from '#/services/AuditService';
import { Request } from '#/types/Request';
import { RequestWithApiKey } from '#/types/Request/RequestWithApiKey';
import { AuditLogEventType } from '@prisma/client';

const mockCreate = vi.fn().mockResolvedValue({
  id: 'audit-log-123',
  timestamp: new Date('2024-01-01T12:00:00Z'),
  eventType: AuditLogEventType.WALLET_CREATION,
  apiKeyId: 'api-key-123',
  ipAddress: '192.168.1.1',
  userAgent: 'test-agent',
  success: true,
  metadata: null,
  createdAt: new Date('2024-01-01T12:00:00Z'),
});

vi.mock('#/repositories/AuditRepository', () => {
  return {
    AuditRepository: vi.fn().mockImplementation(() => {
      return {
        create: mockCreate
      };
    })
  };
});

describe('AuditService', () => {
  let auditService: AuditService;
  let mockRequest: Request;
  let mockRequestWithApiKey: RequestWithApiKey;

  beforeEach(() => {
    auditService = new AuditService();

    // Mock basic request
    mockRequest = {
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1',
      },
      path: '/test',
    } as unknown as Request;

    // Mock request with API key
    mockRequestWithApiKey = {
      ...mockRequest,
      apiKey: {
        id: 'api-key-123',
        keyHash: 'hash123',
        name: 'Test Key',
        scopes: ['WALLET_CREATE'],
        isActive: true,
        createdAt: new Date(),
      },
    } as RequestWithApiKey;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('logWalletCreation', () => {
    it('should log successful wallet creation', async () => {
      const metadata = { wallet_id: 'wallet-123' };
      
      await auditService.logWalletCreation(mockRequestWithApiKey, true, metadata);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.WALLET_CREATION,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: true,
        metadata,
      });
    });

    it('should log failed wallet creation', async () => {
      const metadata = { error: 'Invalid password' };
      
      await auditService.logWalletCreation(mockRequestWithApiKey, false, metadata);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.WALLET_CREATION,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: false,
        metadata,
      });
    });
  });

  // TODO: Implement this test
  // describe('logAuthenticationFailure', () => {
  // });

  describe('logApiKeyUsage', () => {
    it('should log successful API key usage', async () => {
      const metadata = { endpoint: '/wallets' };
      
      await auditService.logApiKeyUsage(mockRequestWithApiKey, metadata);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.API_KEY_USAGE,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: true,
        metadata,
      });
    });

    it('should log API key usage without metadata', async () => {
      await auditService.logApiKeyUsage(mockRequestWithApiKey);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.API_KEY_USAGE,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: true,
        metadata: undefined,
      });
    });
  });

  describe('logRateLimitExceeded', () => {
    it('should log rate limit exceeded', async () => {
      const metadata = { error: 'Rate limit exceeded' };
      await auditService.logRateLimitExceeded(mockRequestWithApiKey, metadata);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.RATE_LIMIT_EXCEEDED,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: false,
        metadata,
      });
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log with correct data', async () => {
      const params = {
        eventType: AuditLogEventType.WALLET_CREATION,
        success: true,
        metadata: { test: 'data' },
      };

      await auditService.createAuditLog(mockRequestWithApiKey, params);

      expect(mockCreate).toHaveBeenCalledWith({
        eventType: AuditLogEventType.WALLET_CREATION,
        apiKeyId: 'api-key-123',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        success: true,
        metadata: { test: 'data' },
      });
    });
  });

  describe('Request data extraction', () => {
    it('should extract correct data from request headers', async () => {
      const params = {
        eventType: AuditLogEventType.API_KEY_USAGE,
        success: true,
        metadata: { test: 'data' },
      };

      await auditService.createAuditLog(mockRequestWithApiKey, params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'test-agent',
        })
      );
    });
  });

  describe('API Key ID extraction', () => {
    it('should extract API key ID from authenticated request', async () => {
      const params = {
        eventType: AuditLogEventType.API_KEY_USAGE,
        success: true,
        metadata: {},
      };

      await auditService.createAuditLog(mockRequestWithApiKey, params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKeyId: 'api-key-123',
        })
      );
    });
  });
});
