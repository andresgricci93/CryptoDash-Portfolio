import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoDBTransport from './mongodbTransport.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'crypto-dashboard' },
  transports: [
    // Errors to separate file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // All logs to general file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // ChromaDB specific logs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/chromadb.log'),
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5
    }),
    // MongoDB transport - only errors and warnings
    mongoDBTransport({
        level: 'warn'
      })
  ]
});

// In development, also show in console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// In production, show info level in console for Render
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    level: 'info',
    format: consoleFormat
  }));
}

export default logger;