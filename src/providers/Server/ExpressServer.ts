import express from "express"
import "express-async-errors"
import { engine } from "express-handlebars"
import cors from "cors"
import logger from "#/providers/Logger"
import pinoHttp from 'pino-http'
import { ClientErrorHandler } from "#/providers/Middlewares/ClientErrorHandler"
import * as path from "node:path"
const port = process.env.PORT ?? 3002

class ExpressServer {
  public app: express.Application

  constructor () {
    this.app = express()
    // this.injectTemplateEngine(this.app)
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
  }

  private injectTemplateEngine (
    app: express.Application
  ): void {
    app.engine("handlebars", engine())
    app.set("view engine", "handlebars")
    app.set("views", path.join(__dirname, "../../", "emails"))
  }

  private injectErrorHandlers (
    app: express.Application
  ) {
    new ClientErrorHandler().inject(app)
  }

  private injectRoutes (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app: express.Application
  ) {
    // TODO: Inject routes
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
