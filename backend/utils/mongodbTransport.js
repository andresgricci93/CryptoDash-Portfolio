import winston from 'winston';
import { Log } from '../models/log.model.js';

const mongoDBTransport = (options = {}) => {
  return new winston.Transport({
    level: options.level || 'warn',
    
    log(info, callback) {
      setImmediate(() => {
        this.emit('logged', info);
      });

      if (info.level === 'error' || info.level === 'warn') {
        const logEntry = new Log({
          level: info.level,
          message: info.message,
          service: info.service || 'crypto-dashboard',
          metadata: {
            ...info,
            timestamp: info.timestamp
          },
          stack: info.stack,
          timestamp: new Date(info.timestamp || Date.now())
        });

        logEntry.save().catch(err => {
          console.error('Failed to save log to MongoDB:', err.message);
        });
      }

      callback();
    }
  });
};

export default mongoDBTransport;