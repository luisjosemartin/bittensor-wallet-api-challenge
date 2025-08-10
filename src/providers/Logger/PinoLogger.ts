import pino from 'pino'
import { Logger } from '#/types/Logger'

export class PinoLogger implements Logger {
  public logger: pino.Logger

  constructor() {
    this.logger = pino({
      enabled: process.env.NODE_ENV !== 'test',
      transport: process.env.NODE_ENV === 'development' 
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              levelFirst: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
      level: process.env.LOG_LEVEL || 'info',
    })
  }

  public info = (message: string): void => {
    this.logger.info(message)
  }

  public warn = (message: string): void => {
    this.logger.warn(message)
  }

  public error = (message: string): void => {
    this.logger.error(message)
  }
} 