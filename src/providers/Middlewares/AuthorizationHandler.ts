import { NextFunction } from "express"
import { Role } from "@prisma/client"
import { Request } from "#/types/Request"
import { Response } from "#/types/Response"
import { verifyGoogleIdToken } from "#/utils/verifyJwt";
import { UsersService } from "#/services/UsersService"
import { RequestWithUser } from "#/types/Request/RequestWithUser"

export class AuthorizationHandler {
  userService: UsersService

  constructor (userService = new UsersService()) {
    this.userService = userService
  }

  public authorize (role: Role) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const idToken = req.headers.authorization?.split("Bearer ")[1] ?? ""
      const { email } = await verifyGoogleIdToken(idToken) ?? {}
      if (!email)
        res.status(401).json({ error: "User not authenticated" });
       else {
        const user = await this.userService.getByEmail(email)
        if (user.role === role || user.role === Role.ADMIN) {
          (req as RequestWithUser).user = user
          next()
        }
        else
          res.status(403).json({ error: "User not authorized", })
      }
    }
  }
}

export const authorizationHandler = new AuthorizationHandler()
