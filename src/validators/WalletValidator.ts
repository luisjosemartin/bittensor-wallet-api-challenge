import { 
  body, 
  param, 
  ValidationChain
} from "express-validator";
import { BaseValidator } from "#/validators/BaseValidator";

export class WalletValidator extends BaseValidator {
  validate(methodName: string): ValidationChain[] {
    switch (methodName) {
      case "createWallet":
        return this.createWallet();
      case "walletIdParam":
        return this.walletIdParam();
      default:
        return [];
    }
  }

  private createWallet(): ValidationChain[] {
    return [
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) // TODO: Document this requirements in the README or Docs
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      
      body('name')
        .optional()
        .isLength({ min: 1, max: 60 })
        .withMessage('Wallet name must be between 1 and 60 characters')
        .trim()
        .escape()
    ];
  }

  private walletIdParam(): ValidationChain[] {
    return [
      param('id')
        .isUUID()
        .withMessage('Wallet ID must be a valid UUID')
        .notEmpty()
        .withMessage('Wallet ID is required')
    ];
  }
}
