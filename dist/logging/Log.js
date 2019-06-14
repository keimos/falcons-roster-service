"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpContext = require("express-http-context");
const winston = require("winston");
const { combine, timestamp, label, printf } = winston.format;
class Log {
    constructor() {
        this.log = winston.createLogger({
            format: combine(timestamp(), myFormat),
            transports: [
                new winston.transports.Console({ handleExceptions: true }),
            ],
        });
    }
}
exports.Log = Log;
const myFormat = printf((info) => {
    const reqId = httpContext.get('TransactionId');
    return `${info.timestamp} [TID-${reqId}] ${info.level}: ${info.message}`;
});
exports.default = new Log().log;