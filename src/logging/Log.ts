import httpContext = require('express-http-context');
import * as winston from 'winston';

const { combine, timestamp, label, printf } = winston.format;

/**
 * This class provides for application logging.
 */
export class Log {

    // Main logger instance
    public log: winston.Logger;

    /**
     * Create and initialize a new (winston) logger.
     */
    constructor() {
        this.log = winston.createLogger({
            format: combine(
                timestamp(),
                myFormat,
            ),
            transports: [
                new winston.transports.Console({ handleExceptions: true }),
            ],
        });
    }
}

const myFormat = printf((info) => {
    const reqId = httpContext.get('TransactionId');

    return `${info.timestamp} [TID-${reqId}] ${info.level}: ${info.message}`;
});

// Export the Winston log object
export default new Log().log;
