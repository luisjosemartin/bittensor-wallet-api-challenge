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
    app: express.Application | express.Router
  ): void {
    logger.info(
      `[Routes] :: Injecting "${this.prefix}" API routes`
    )
    // Both Application and Router have the use method with the same signature
    ;(app as express.Application).use(this.prefix, this.router)
  }

  /**
   * Set your "this.router" routes here.
   */
  abstract initializeRoutes (): void
}
