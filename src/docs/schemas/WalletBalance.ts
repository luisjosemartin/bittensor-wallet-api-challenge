export const walletBalanceResponseSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true
    },
    data: {
      type: 'object',
      properties: {
        wallet_id: {
          type: 'string',
          format: 'uuid',
          example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
        },
        balance: {
          type: 'string',
          example: '1000.500000001',
          description: 'TAO balance as string with 9 decimal places precision'
        },
        currency: {
          type: 'string',
          example: 'TAO'
        },
        last_updated: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T12:00:00Z'
        }
      },
      required: ['wallet_id', 'balance', 'currency', 'last_updated']
    }
  },
  required: ['success', 'data']
};
