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
          $ref: '#/components/responses/RateLimitError'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/wallets/{id}/balance': {
    get: {
      tags: ['Wallets'],
      summary: 'Get Wallet Balance',
      description: `
        Retrieves the current TAO balance for a specific wallet from the Bittensor network.
        
        Features
        - Network health checking before queries
        - Comprehensive error handling for network issues
        
        Requirements
        - Valid API key with WALLET_READ scope
        - Valid wallet UUID in path parameter

        Network Dependencies
        - Returns 503 if all network endpoints are unavailable
      `,
      operationId: 'getWalletBalance',
      security: [
        {
          ApiKeyAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Wallet UUID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440000'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Balance retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WalletBalanceResponse'
              },
              examples: {
                success: {
                  summary: 'Successful balance query',
                  value: {
                    success: true,
                    data: {
                      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
                      balance: '1000.500000000',
                      currency: 'TAO',
                      last_updated: '2024-01-01T12:00:00Z'
                    }
                  }
                },
                zeroBalance: {
                  summary: 'Wallet with zero balance',
                  value: {
                    success: true,
                    data: {
                      wallet_id: '550e8400-e29b-41d4-a716-446655440000',
                      balance: '0.000000000',
                      currency: 'TAO',
                      last_updated: '2024-01-01T12:00:00Z'
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError'
        },
        '404': {
          description: 'Wallet not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'WALLET_NOT_FOUND',
                  message: 'Wallet with ID 550e8400-e29b-41d4-a716-446655440000 not found',
                  details: {
                    wallet_id: '550e8400-e29b-41d4-a716-446655440000'
                  }
                },
                timestamp: '2024-01-01T12:00:00Z'
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/RateLimitError'
        },
        '503': {
          description: 'Bittensor network unavailable',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: {
                  code: 'NETWORK_UNAVAILABLE',
                  message: 'Bittensor network is currently unavailable',
                  details: {
                    service: 'bittensor_rpc',
                    status: 'unhealthy',
                    last_check: '2024-01-01T12:00:00Z'
                  }
                },
                timestamp: '2024-01-01T12:00:00Z'
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
