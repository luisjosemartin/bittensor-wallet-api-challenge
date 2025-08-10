import express, { ErrorRequestHandler } from "express"
import logger from "#/providers/Logger"
import { Middleware } from "#/types/Middleware"
import { NotFoundError } from "#/errors/NotFoundError"
import { PrismaClientError } from "#/providers/Database/PrismaClientError"
import { EntityConstraintError } from "#/errors/EntityConstraintError"
import { Injectable } from "#/types/Injectable"
import { UnauthenticatedError } from "#/errors/UnauthenticatedError"
import { UnauthorizedError } from "#/errors/UnauthorizedError"
import { SessionExpiredError } from "#/errors/SessionExpiredError"

export class ClientErrorHandler implements Middleware, Injectable {
  // eslint-disable-next-line @typescript-eslint/max-params
  public handler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err) {
      logger.error(`${err}`)

      if (err instanceof NotFoundError)
        res.status(404).json({ error: err.message, })

      else if (
        err instanceof UnauthenticatedError ||
        err instanceof SessionExpiredError
      )
        res.status(401).json({ error: err.message, })

      else if (err instanceof UnauthorizedError)
        res.status(403).json({ error: err.message })

      else if (err instanceof EntityConstraintError)
        res.status(400).json({ error: err.message, })

      else if (PrismaClientError.isPrismaClientKnownRequestError(
        err
      ))
        res.status(400).json({
          error: PrismaClientError.getErrorMessage(err),
        })

      else
        res.status(500).json({ error: "Unknown error", })
    }
    else
      next()
  }

  public inject (app: express.Application): void {
    logger.info("[ClientErrorHandler] :: Injecting middleware")
    app.use(this.handler)
  }
}
