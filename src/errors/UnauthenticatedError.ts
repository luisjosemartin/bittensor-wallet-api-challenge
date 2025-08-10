export class UnauthenticatedError extends Error {
  constructor () {
    super(
      "Authentication failed"
    )
    this.name = "UnauthenticatedError"
  }
}
