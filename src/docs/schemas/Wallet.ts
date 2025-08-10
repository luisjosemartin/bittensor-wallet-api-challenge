export const walletSchemas = {
  CreateWalletRequest: {
    type: 'object',
    required: ['password'],
    properties: {
      password: {
        type: 'string',
        minLength: 8,
        description: 'Password for encrypting the wallet private key',
        example: 'SecurePassword123!'
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Optional nickname for the wallet',
        example: 'My Main Wallet'
      }
    },
    additionalProperties: false
  },

  WalletResponse: {
    type: 'object',
    properties: {
      wallet_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the wallet',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      public_address: {
        type: 'string',
        pattern: '^5[A-Za-z0-9]{47}$',
        description: 'Bittensor public address in SS58 format',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      },
      name: {
        type: 'string',
        nullable: true,
        description: 'Wallet nickname if provided',
        example: 'My Main Wallet'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the wallet was created',
        example: '2024-01-01T00:00:00Z'
      }
    },
    required: ['wallet_id', 'public_address', 'created_at']
  },

  CreateWalletResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
        description: 'Indicates if the operation was successful'
      },
      data: {
        $ref: '#/components/schemas/WalletResponse'
      }
    },
    required: ['success', 'data']
  },

  BalanceResponse: {
    type: 'object',
    properties: {
      wallet_id: {
        type: 'string',
        format: 'uuid',
        description: 'Wallet identifier',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      balance: {
        type: 'string',
        pattern: '^\\d+\\.\\d{9}$',
        description: 'TAO balance as a string with 9 decimal places',
        example: '1000.500000000'
      },
      currency: {
        type: 'string',
        enum: ['TAO'],
        description: 'Currency type',
        example: 'TAO'
      },
      last_updated: {
        type: 'string',
        format: 'date-time',
        description: 'When the balance was last fetched',
        example: '2024-01-01T00:00:00Z'
      }
    },
    required: ['wallet_id', 'balance', 'currency', 'last_updated']
  },

  GetBalanceResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
        description: 'Indicates if the operation was successful'
      },
      data: {
        $ref: '#/components/schemas/BalanceResponse'
      }
    },
    required: ['success', 'data']
  },

  TransferRequest: {
    type: 'object',
    required: ['recipient_address', 'amount', 'password'],
    properties: {
      recipient_address: {
        type: 'string',
        pattern: '^5[A-Za-z0-9]{47}$',
        description: 'Recipient Bittensor address in SS58 format',
        example: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
      },
      amount: {
        type: 'string',
        pattern: '^\\d+\\.\\d{9}$',
        description: 'Amount to transfer in TAO (9 decimal places)',
        example: '100.000000000'
      },
      password: {
        type: 'string',
        description: 'Wallet password for transaction signing',
        example: 'SecurePassword123!'
      }
    },
    additionalProperties: false
  },

  TransactionResponse: {
    type: 'object',
    properties: {
      transaction_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique transaction identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      from_address: {
        type: 'string',
        pattern: '^5[A-Za-z0-9]{47}$',
        description: 'Sender address',
        example: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
      },
      to_address: {
        type: 'string',
        pattern: '^5[A-Za-z0-9]{47}$',
        description: 'Recipient address',
        example: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
      },
      amount: {
        type: 'string',
        pattern: '^\\d+\\.\\d{9}$',
        description: 'Transfer amount in TAO',
        example: '100.000000000'
      },
      fee: {
        type: 'string',
        pattern: '^\\d+\\.\\d{9}$',
        description: 'Transaction fee in TAO',
        example: '0.001000000'
      },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'failed'],
        description: 'Transaction status',
        example: 'pending'
      },
      block_hash: {
        type: 'string',
        nullable: true,
        description: 'Block hash when confirmed',
        example: '0x1234567890abcdef...'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Transaction creation timestamp',
        example: '2024-01-01T00:00:00Z'
      }
    },
    required: ['transaction_id', 'from_address', 'to_address', 'amount', 'fee', 'status', 'created_at']
  },

  TransferResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
        description: 'Indicates if the operation was successful'
      },
      data: {
        $ref: '#/components/schemas/TransactionResponse'
      }
    },
    required: ['success', 'data']
  },

  TransactionHistoryResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
        description: 'Indicates if the operation was successful'
      },
      data: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              allOf: [
                { $ref: '#/components/schemas/TransactionResponse' },
                {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['sent', 'received'],
                      description: 'Transaction type from wallet perspective',
                      example: 'sent'
                    }
                  },
                  required: ['type']
                }
              ]
            }
          },
          pagination: {
            type: 'object',
            properties: {
              current_page: {
                type: 'integer',
                minimum: 1,
                example: 1
              },
              total_pages: {
                type: 'integer',
                minimum: 0,
                example: 5
              },
              total_items: {
                type: 'integer',
                minimum: 0,
                example: 94
              },
              items_per_page: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                example: 20
              }
            },
            required: ['current_page', 'total_pages', 'total_items', 'items_per_page']
          }
        },
        required: ['transactions', 'pagination']
      }
    },
    required: ['success', 'data']
  }
};
