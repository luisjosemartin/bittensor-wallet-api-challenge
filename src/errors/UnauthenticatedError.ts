export class UnauthenticatedError extends Error {
  constructor (message: string = "Authentication failed") {
    super(
      message
    )
    this.name = "UnauthenticatedError"
  }
}
