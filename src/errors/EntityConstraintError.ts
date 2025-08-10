export class EntityConstraintError extends Error {
  constructor (entityName: string, message: string) {
    super(message)

    this.name = `${entityName}EntityConstraintError`
  }
}
