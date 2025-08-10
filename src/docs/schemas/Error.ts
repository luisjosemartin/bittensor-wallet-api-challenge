export const errorSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false,
        description: 'Always false for error responses'
      },
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Error code for programmatic handling',
            enum: [
              'VALIDATION_ERROR',
              'UNAUTHORIZED',
              'FORBIDDEN',
              'NOT_FOUND',
              'CONFLICT',
              'RATE_LIMITED',
              'INTERNAL_ERROR',
              'SERVICE_UNAVAILABLE',
              'NETWORK_ERROR',
              'INSUFFICIENT_BALANCE',
              'INVALID_ADDRESS',
              'ENCRYPTION_ERROR',
              'SIGNING_ERROR'
            ],
            example: 'VALIDATION_ERROR'
          },
          message: {
            type: 'string',
            description: 'Human-readable error message',
            example: 'Invalid request parameters'
          },
          details: {
            type: 'object',
            description: 'Additional error details',
            properties: {
              field: {
                type: 'string',
                description: 'Field that caused the validation error',
                example: 'password'
              },
              reason: {
                type: 'string',
                description: 'Specific reason for the error',
                example: 'Password must be at least 8 characters long'
              },
              code: {
                type: 'string',
                description: 'Specific error code for the field',
                example: 'MIN_LENGTH'
              }
            },
            additionalProperties: true
          }
        },
        required: ['code', 'message', 'details']
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Error occurrence timestamp',
        example: '2024-01-01T00:00:00Z'
      },
      request_id: {
        type: 'string',
        description: 'Unique request identifier for tracking',
        example: 'req_123456789'
      }
    },
    required: ['success', 'error', 'timestamp']
  },

  ValidationErrorDetails: {
    type: 'object',
    properties: {
      field: {
        type: 'string',
        description: 'The field that failed validation',
        example: 'password'
      },
      value: {
        type: 'string',
        description: 'The invalid value (sanitized)',
        example: '***'
      },
      reason: {
        type: 'string',
        description: 'Why the validation failed',
        example: 'Password must be at least 8 characters long'
      },
      code: {
        type: 'string',
        description: 'Validation error code',
        example: 'MIN_LENGTH'
      }
    },
    required: ['field', 'reason', 'code']
  },

  RateLimitErrorDetails: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Rate limit threshold',
        example: 10
      },
      window: {
        type: 'string',
        description: 'Rate limit time window',
        example: '1 minute'
      },
      reset_time: {
        type: 'string',
        format: 'date-time',
        description: 'When the rate limit resets',
        example: '2024-01-01T00:01:00Z'
      }
    },
    required: ['limit', 'window', 'reset_time']
  }
};
