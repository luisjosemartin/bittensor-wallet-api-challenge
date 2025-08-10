import { Router } from "express";
import swaggerUi from 'swagger-ui-express';
import { BaseRouter } from "#/routes/BaseRouter";
import { swaggerSpec } from "#/docs/swagger.config";

export class SwaggerRouter extends BaseRouter {
  constructor() {
    super("/docs", Router());
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    // Swagger JSON endpoint - serves the raw OpenAPI specification
    this.router.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Swagger UI setup with custom configuration
    const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
      explorer: true,
      swaggerOptions: {
        url: '/api/v1/docs/swagger.json',
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
        requestInterceptor: (request: unknown) => {
          // Add custom headers or modify requests if needed
          return request;
        },
        responseInterceptor: (response: unknown) => {
          // Handle responses if needed
          return response;
        }
      },
      customCss: `
        .swagger-ui .topbar { 
          background-color: #1f2937; 
        }
        .swagger-ui .topbar .download-url-wrapper { 
          display: none; 
        }
        .swagger-ui .info .title {
          color: #1f2937;
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
      `,
      customSiteTitle: 'Bittensor Wallet API Documentation',
      customfavIcon: '/favicon.ico'
    };

    // Serve Swagger UI
    this.router.use(
      '/',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    // Redirect root docs path to swagger UI
    this.router.get('/', (req, res) => {
      res.redirect('/api/v1/docs/');
    });
  }
}
