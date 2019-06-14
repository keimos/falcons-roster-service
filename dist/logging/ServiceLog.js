"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpContext = require("express-http-context");
const morgan = require("morgan");
const uuid = require("uuid");
const Log_1 = require("../logging/Log");
const http_status_1 = require("http-status");
const error_codes_enum_1 = require("../utils/error-codes-enum");
const SystemError_1 = require("../error/SystemError");
const InvalidRequestError_1 = require("../error/InvalidRequestError");
class ServiceLog {
    init(app, initRoutes) {
        app.use(httpContext.middleware);
        morgan.token('tid', (req, res) => {
            return res.get('transactionId');
        });
        app.use(morgan(':date[iso] [TID-:tid] :method :url :status :res[content-length] - :response-time ms'));
        app.use((req, res, next) => {
            console.log('NODE_ENV ' + process.env.NODE_ENV + ' REQ.SECURE : ' + req.get('X-FORWARDED-PROTO'));
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'local') {
                next();
            }
            else if (req.get('X-FORWARDED-PROTO') === "https") {
                next();
            }
            else {
                res.status(403).send('Please use HTTPS when submitting data to this server');
            }
        });
        app.use((req, res, next) => {
            httpContext.set('TransactionId', uuid.v1());
            Log_1.default.info(`INCOMMING REQUEST: ${JSON.stringify(req.body)}`);
            res.set('TransactionId', httpContext.get('TransactionId'));
            next();
        });
        initRoutes();
        app.use((req, res, next) => {
            const responseBody = httpContext.get('responseBody');
            Log_1.default.info(`OUTGOING RESPONSE: ${JSON.stringify(responseBody)}`);
            if (!responseBody) {
                res.status(501);
                res.json({
                    message: 'request path does not exist',
                    status: '501',
                }).end();
            }
        });
        app.use((err, req, res, next) => {
            let code;
            Log_1.default.error(err);
            if (err instanceof InvalidRequestError_1.InvalidRequestError) {
                code = http_status_1.BAD_REQUEST;
            }
            else if (err instanceof SystemError_1.SystemError) {
                if (err.code = error_codes_enum_1.ErrorCode.VALIDATION_ERROR) {
                    code = http_status_1.BAD_REQUEST;
                }
                else {
                    code = http_status_1.INTERNAL_SERVER_ERROR;
                }
            }
            else {
                code = http_status_1.INTERNAL_SERVER_ERROR;
            }
            res.status(code);
            const responseBody = {
                code: code,
                property: err.name,
                message: err.message,
            };
            console.error(err.message);
            res.status(code).send(responseBody);
        });
    }
    setResponseBody(responseBody) {
        httpContext.set('responseBody', responseBody);
    }
}
exports.default = new ServiceLog();