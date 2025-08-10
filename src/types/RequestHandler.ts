import { NextFunction } from "express"
import { Response } from "#/types/Response"
import { Request } from "#/types/Request"

export type RequestHandler<T = Request> = (
  req: T,
  res: Response,
  next?: NextFunction
) => Promise<void>
