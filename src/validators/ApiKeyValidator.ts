import { header, ValidationChain } from "express-validator"
import { BaseValidator } from "./BaseValidator"

export class ApiKeyValidator extends BaseValidator {
  validate (): ValidationChain[] {
    return [
      header("x-api-key", "x-api-key header is required").isString()
    ]
  }
}
