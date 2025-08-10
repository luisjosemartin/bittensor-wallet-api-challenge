import express from "express"
import "express-async-errors"
import cors from "cors"
import logger from "#/providers/Logger"
import pinoHttp from 'pino-http'
import { ClientErrorHandler } from "#/providers/Middlewares/ClientErrorHandler"
import { HealthRouter } from "#/routes/HealthRouter"
import { WalletRouter } from "#/routes/WalletRouter"
const port = process.env.PORT ?? 3002

class ExpressServer {
  public app: express.Application

  constructor () {
    this.app = express()
    this.injectMiddlewares(this.app)
    this.injectRoutes(this.app)
    this.injectErrorHandlers(this.app)
  }

  private injectMiddlewares (
    app: express.Application
  ) {
    app.use(pinoHttp({
      logger: logger.logger,
      autoLogging: true,
      customProps: () => ({
        environment: process.env.NODE_ENV || 'development'
      }),
    }))
    app.use(express.json())
    app.use(cors())
  }


  private injectErrorHandlers (
    app: express.Application
  ) {
    new ClientErrorHandler().inject(app)
  }

  private injectRoutes (
    app: express.Application
  ) {
    new HealthRouter().inject(app)
    new WalletRouter().inject(app)
  }

  public init () {
    this.app.listen(port, () => {
      logger.info(
        `⚡️[server]: Server is running at localhost:${port}`
      )
    }).on("error", err => {
      logger.error(err.message)
    })
  }
}

export default ExpressServer
