import { RequestHandler } from "express"
import { Middleware } from "#/types/Middleware"
import { ValidationChain, validationResult } from "express-validator"

export abstract class BaseValidator implements Middleware {
  abstract validate (methodName: string): ValidationChain[]

  public handler: RequestHandler = (req, res, next) => {
    const results = validationResult(
      req
    )

    if (!results.isEmpty())
      res.status(
        400
      ).send(
        {
          errors: results.array(
            { onlyFirstError: true, }
          )
            .map(
              (
                { msg, }
              ) => `${msg ?? "Invalid request data"}`
            ),
        }
      )
    else
      next()
  }

  public getValidators (
    methodName: string = ""
  ) {
    return [...this.validate(
      methodName
    ), this.handler]
  }
}
