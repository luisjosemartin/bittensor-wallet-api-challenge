export const walletPaths = {
  '/wallets': {
    post: {
      tags: ['Wallets'],
      summary: 'Create New Wallet',
      description: `
        Creates a new Bittensor (TAO) wallet with secure key generation and storage.
        
        ## Security Features
        - Generates cryptographically secure keypair using Polkadot/Substrate libraries
        - Private key is encrypted using AES-256-GCM with password-derived key
        - Public address is returned in SS58 format (Bittensor standard)
        - All operations are logged for audit purposes
        
        ## Requirements
        - Valid API key with WALLET_CREATE scope
        - Strong password (minimum 8 characters)
        - Optional wallet name for identification
        
        ## Rate Limiting
        - 5 requests per hour per IP address
        - Additional rate limiting may apply based on API key tier
      `,
      operationId: 'createWallet',
      security: [
        {
          ApiKeyAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateWalletRequest'
            },
            examples: {
              basic: {
                summary: 'Basic wallet creation',
                value: {
                  password: 'SecurePassword123!'
                }
              },
              withName: {
                summary: 'Wallet with custom name',
                value: {
                  password: 'SecurePassword123!',
                  name: 'My Trading Wallet'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Wallet created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateWalletResponse'
              },
              examples: {
                success: {
                  summary: 'Successful wallet creation',
                  value: {
                    success: true,
                    data: {
                      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
                      public_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                      name: 'My Trading Wallet',
                      created_at: '2024-01-01T12:00:00Z'
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/ValidationError'
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '429': {
          description: 'Rate limit exceeded',
          headers: {
            'X-RateLimit-Limit': {
              description: 'Request limit per time window',
              schema: { type: 'integer', example: 5 }
            },
            'X-RateLimit-Remaining': {
              description: 'Remaining requests in current window',
              schema: { type: 'integer', example: 0 }
            },
            'X-RateLimit-Reset': {
              description: 'Time when rate limit resets',
              schema: { type: 'string', format: 'date-time' }
            },
            'X-RateLimit-Window': {
              description: 'Rate limit window in seconds',
              schema: { type: 'integer', example: 3600 }
            },
            'Retry-After': {
              description: 'Seconds to wait before retrying',
              schema: { type: 'integer', example: 1800 }
            }
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMITED',
                  message: 'Too many requests',
                  details: {
                    limit: 5,
                    window: '3600 seconds',
                    reset_time: '2024-01-01T13:00:00Z',
                    retry_after: 1800
                  }
                },
                timestamp: '2024-01-01T12:30:00Z'
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  }
};
