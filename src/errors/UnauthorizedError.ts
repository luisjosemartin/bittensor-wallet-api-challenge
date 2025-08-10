export class UnauthorizedError extends Error {
  constructor () {
    super(
      "Authorization failed"
    )
    this.name = "UnauthorizedError"
  }
}
