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
        res.status(404).json(
        { success: false, error: { code: "NOT_FOUND", message: err.message }, timestamp: new Date().toISOString() })

      else if (
        err instanceof UnauthenticatedError ||
        err instanceof SessionExpiredError
      )
        res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: err.message }, timestamp: new Date().toISOString() })

      else if (err instanceof UnauthorizedError)
        res.status(403).json({ success: false, error: { code: "UNAUTHORIZED", message: err.message }, timestamp: new Date().toISOString() })

      else if (err instanceof EntityConstraintError)
        res.status(400).json({ success: false, error: { code: "ENTITY_CONSTRAINT_ERROR", message: err.message }, timestamp: new Date().toISOString() })

      else if (PrismaClientError.isPrismaClientKnownRequestError(
        err
      ))
        res.status(400).json({
          success: false,
          error: { code: "PRISMA_CLIENT_KNOWN_REQUEST_ERROR", message: PrismaClientError.getErrorMessage(err) },
          timestamp: new Date().toISOString()
        })

      else
        res.status(500).json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Unknown error" }, timestamp: new Date().toISOString() })
    }
    else
      next()
  }

  public inject (app: express.Application): void {
    logger.info("[ClientErrorHandler] :: Injecting middleware")
    app.use(this.handler)
  }
}
