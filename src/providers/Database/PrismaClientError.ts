import { Prisma } from "@prisma/client"

type WithModelName = Record<"modelName", string>
type WithTarget = Record<"target", string[]>
type WithCause = Record<"cause", "string">

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PrismaClientError {
  public static getErrorMessage (
    {
      code, meta,
    }: Prisma.PrismaClientKnownRequestError
  ): string {
    switch (code) {
      case "P2002":
        return PrismaClientError
          .formatUniqueConstraintError(
            meta as WithModelName & WithTarget
          )
      case "P2025":
        return PrismaClientError
          .formatNotFoundError(
            meta as WithModelName & WithCause
          )
      default:
        return "Unknown database error"
    }
  }

  public static isPrismaClientKnownRequestError (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any
  )
    : err is Prisma.PrismaClientKnownRequestError {
    return "code" in err && "clientVersion" in err
  }

  private static formatUniqueConstraintError (
    {
      modelName, target,
    }: { modelName: string; target: string[] }
  ): string {
    if (modelName === "Wallet") {
      if (target.includes("email") && target.includes("companyId"))
        return "Ya existe una Wallet con este email";

      if (target.includes("dni") && target.includes("companyId"))
        return "Ya existe una Wallet con este DNI";
    }

    return `${modelName} already exists with provided ${target.join(
      ", "
    )}`;
  }

  private static formatNotFoundError (
    {
      modelName,
    }: { modelName: string }
  ): string {
    return `${modelName} not found`
  }
}
