/* eslint-disable no-console */
import { Logger } from "#/types/Logger"

export class ConsoleLogger implements Logger {
  private getTimestamp (): string {
    const today = new Date()
    const dateString =
      `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    const timeString =
      `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
    return `${dateString} ${timeString}`
  }

  public info = (
    message: string
  ): void => {
    console.log(
      `[${this.getTimestamp()}] [INFO] ${message}`
    )
  }

  public warn = (
    message: string
  ): void => {
    console.log(
      `[${this.getTimestamp()}] [WARN] ${message}`
    )
  }

  public error = (
    message: string
  ): void => {
    console.log(
      `[${this.getTimestamp()}] [ERROR] ${message}`
    )
  }
}
