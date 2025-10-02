/**
 * Sistema de logging para o projeto Soropel
 * Substitui console.log por um sistema mais estruturado
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  service: string
  message: string
  data?: any
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = import.meta.env.DEV || false
    // Em desenvolvimento, mostrar mais logs
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(service: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${service}] ${message}${dataStr}`
  }

  public debug(service: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`🔍 ${this.formatMessage(service, message, data)}`)
    }
  }

  public info(service: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`ℹ️ ${this.formatMessage(service, message, data)}`)
    }
  }

  public warn(service: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`⚠️ ${this.formatMessage(service, message, data)}`)
    }
  }

  public error(service: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`❌ ${this.formatMessage(service, message, data)}`)
    }
  }

  public success(service: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`✅ ${this.formatMessage(service, message, data)}`)
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }
}

// Instância singleton do logger
export const logger = Logger.getInstance()

// Funções de conveniência para uso direto
export const logDebug = (service: string, message: string, data?: any) => 
  logger.debug(service, message, data)

export const logInfo = (service: string, message: string, data?: any) => 
  logger.info(service, message, data)

export const logWarn = (service: string, message: string, data?: any) => 
  logger.warn(service, message, data)

export const logError = (service: string, message: string, data?: any) => 
  logger.error(service, message, data)

export const logSuccess = (service: string, message: string, data?: any) => 
  logger.success(service, message, data)