import swaggerJsdoc from 'swagger-jsdoc';
import { walletPaths } from './paths/wallets';
import { healthPaths } from './paths/health';
import { walletSchemas } from './schemas/Wallet';
import { healthSchemas } from './schemas/Health';
import { errorSchemas } from './schemas/Error';
import { apiKeySchemas } from './schemas/ApiKey';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Challenge - Bittensor (TAO) Wallet API',
      version: '1.0.0',
      description: `
        A secure REST API for managing Bittensor (TAO) wallets.

        Features
        - Secure wallet creation with encrypted private key storage
        - Balance checking from Bittensor network (planned)
        - Transaction management and history (planned)
        - API key-based authentication
        - Comprehensive audit logging

        Security
        - All endpoints require API key authentication
        - Private keys are encrypted at rest
        - Input validation and sanitization
        - Rate limiting and audit logging
      `
    },
    servers: [
      {
        url: 'http://localhost:3002/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        ...walletSchemas,
        ...healthSchemas,
        ...errorSchemas,
        ...apiKeySchemas
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'API key is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Invalid or missing API key',
                  details: {}
                },
                timestamp: '2024-01-01T00:00:00Z'
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Invalid request parameters',
                  details: {
                    field: 'password',
                    reason: 'Password must be at least 8 characters long'
                  }
                },
                timestamp: '2024-01-01T00:00:00Z'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Wallet not found',
                  details: {}
                },
                timestamp: '2024-01-01T00:00:00Z'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'INTERNAL_ERROR',
                  message: 'An unexpected error occurred',
                  details: {}
                },
                timestamp: '2024-01-01T00:00:00Z'
              }
            }
          }
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    paths: {
      ...healthPaths,
      ...walletPaths
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Wallets',
        description: 'Wallet management operations'
      }
    ]
  },
  apis: [], // We're using definition-based approach, so no need to scan files
};

export const swaggerSpec = swaggerJsdoc(options);
