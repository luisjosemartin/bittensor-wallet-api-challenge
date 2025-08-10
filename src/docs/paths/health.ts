export const healthPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health Check',
      description: `
        Returns the current health status of the API service.
        
        This endpoint provides information about:
        - Overall service status
        - Server uptime and environment
        
        This endpoint does not require authentication and can be used for monitoring and health checks.
      `,
      operationId: 'getHealth',
      security: [], // No authentication required for health checks
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HealthResponse'
              },
              examples: {
                healthy: {
                  summary: 'Healthy service',
                  value: {
                    data: {
                      status: 'ok',
                      timestamp: '2024-01-01T12:00:00Z',
                      uptime: 3600.5,
                      environment: 'development',
                      version: '1.0.0',
                    }
                  }
                },
                degraded: {
                  summary: 'Service with issues',
                  value: {
                    data: {
                      status: 'degraded',
                      timestamp: '2024-01-01T12:00:00Z',
                      uptime: 3600.5,
                      environment: 'production',
                      version: '1.0.0',
                    }
                  }
                }
              }
            }
          }
        },
        '429': {
          $ref: '#/components/responses/RateLimitError'
        },
        '503': {
          description: 'Service is unavailable',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/HealthResponse'
              },
              example: {
                data: {
                  status: 'down',
                  timestamp: '2024-01-01T12:00:00Z',
                  uptime: 3600.5,
                  environment: 'production',
                }
              }
            }
          }
        }
      }
    }
  }
};
