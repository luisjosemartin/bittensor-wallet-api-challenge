export const apiKeySchemas = {
  ApiKeyInfo: {
    type: 'object',
    properties: {
      key_id: {
        type: 'string',
        format: 'uuid',
        description: 'API key identifier',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      name: {
        type: 'string',
        description: 'API key name or description',
        example: 'Production API Key'
      },
      scopes: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'WALLET_CREATE',
            'WALLET_READ',
            'WALLET_TRANSFER'
          ]
        },
        description: 'Permissions granted to this API key',
        example: ['WALLET_CREATE', 'WALLET_READ']
      },
      is_active: {
        type: 'boolean',
        description: 'Whether the API key is currently active',
        example: true
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'When the API key was created',
        example: '2024-01-01T00:00:00Z'
      },
      last_used: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'When the API key was last used',
        example: '2024-01-01T12:00:00Z'
      },
      expires_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'API key expiration date',
        example: '2024-12-31T23:59:59Z'
      }
    },
    required: ['key_id', 'name', 'scopes', 'is_active', 'created_at']
  },

  ApiKeyScope: {
    type: 'string',
    enum: [
      'WALLET_CREATE',
      'WALLET_READ', 
      'WALLET_TRANSFER'
    ],
    description: 'Available API key scopes/permissions'
  }
};
