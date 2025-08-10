export const healthSchemas = {
  HealthStatus: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['ok', 'degraded', 'down'],
        description: 'Overall health status of the service',
        example: 'ok'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Current server timestamp',
        example: '2024-01-01T00:00:00Z'
      },
      uptime: {
        type: 'number',
        description: 'Server uptime in seconds',
        example: 3600.5
      },
      environment: {
        type: 'string',
        enum: ['development', 'staging', 'production'],
        description: 'Current environment',
        example: 'development'
      },
      version: {
        type: 'string',
        description: 'API version',
        example: '1.0.0'
      }
    },
    required: ['status', 'timestamp', 'uptime', 'environment']
  },

  HealthResponse: {
    type: 'object',
    properties: {
      data: {
        $ref: '#/components/schemas/HealthStatus'
      }
    },
    required: ['data']
  }
};
