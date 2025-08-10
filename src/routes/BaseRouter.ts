import express from "express"
import logger from "#/providers/Logger"
import { Injectable } from "#/types/Injectable"

export abstract class BaseRouter implements Injectable {
  protected prefix: string

  protected router: express.Router

  constructor (prefix: string, router: express.Router) {
    this.prefix = prefix
    this.router = router
  }

  public inject (
    app: express.Application
  ): void {
    logger.info(
      `[Routes] :: Injecting "${this.prefix}" API routes`
    )
    app.use(this.prefix, this.router)
  }

  /**
   * Set your "this.router" routes here.
   */
  abstract initializeRoutes (): void
}
