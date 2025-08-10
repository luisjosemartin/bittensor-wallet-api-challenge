import { RequestHandler, ErrorRequestHandler } from "express"

export interface Middleware {
  handler: ErrorRequestHandler | RequestHandler;
}
