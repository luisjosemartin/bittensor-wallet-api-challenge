import { RequestHandler } from "express"
import { Middleware } from "#/types/Middleware"
import { ValidationChain, validationResult } from "express-validator"

export abstract class BaseValidator implements Middleware {
  abstract validate (methodName: string): ValidationChain[]

  public handler: RequestHandler = (req, res, next) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
      const firstError = results.array({ onlyFirstError: true })[0];
      let fieldName = "unknown";
      if ('path' in firstError) 
        fieldName = firstError.path;
       else if ('param' in firstError) 
        fieldName = firstError.param as string;

       res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          details: {
            field: fieldName,
            reason: (firstError.msg as string) || "Invalid value"
          }
        },
        timestamp: new Date().toISOString()
      });
    } else
      next();
  }

  public getValidators (
    methodName: string = ""
  ) {
    return [...this.validate(
      methodName
    ), this.handler]
  }
}
