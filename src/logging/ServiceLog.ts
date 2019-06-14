import * as express from 'express';
import * as httpContext from 'express-http-context';
import * as morgan from 'morgan';
import * as uuid from 'uuid';

import log from '../logging/Log';

import {BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR} from 'http-status';
import { ErrorCode } from '../utils/error-codes-enum';
import { SystemError } from '../error/SystemError';
import { InvalidRequestError } from '../error/InvalidRequestError';


class ServiceLog {

    /**
     * Initializes service request/response logging by registering handlers with the given Express application.
     *
     * @param app The Express application.
     * @param initRoutes A function that will initialize all routes for this application.
     */
    public init(app: express.Application, initRoutes: () => any) {

        // Register capturing thread-based http context
        app.use(httpContext.middleware);

        // Add the transaction ID from the request so morgan can add it to logs
        morgan.token('tid', (req: any, res: any) => {
            return res.get('transactionId');
        });

        // Register morgan and logging format
        app.use(morgan(':date[iso] [TID-:tid] :method :url :status :res[content-length] - :response-time ms'));

        app.use((req : express.Request, res : express.Response, next : Function) => {
            console.log('NODE_ENV ' + process.env.NODE_ENV + ' REQ.SECURE : ' + req.get('X-FORWARDED-PROTO'));
            if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'local') {
                next();
            }
            else if (req.get('X-FORWARDED-PROTO') === "https") {
                next();
            } else {
                res.status(403).send('Please use HTTPS when submitting data to this server');
            }
        });

        // Register request logging
        app.use((req, res, next) => {

            // Add a transaction ID to the context
            httpContext.set('TransactionId', uuid.v1());

            // Log the request
            log.info(`INCOMMING REQUEST: ${JSON.stringify(req.body)}`);

            // Set the transaction ID in the response
            res.set('TransactionId', httpContext.get('TransactionId'));
            next();
        });

        // Intialize application routes
        initRoutes();

        // Register response logging
        app.use((req, res, next) => {

            const responseBody = httpContext.get('responseBody');

            // Log the response
            log.info(`OUTGOING RESPONSE: ${JSON.stringify(responseBody)}`);
            if (!responseBody) {
                res.status(501);
                res.json({
                    message: 'request path does not exist',
                    status: '501',
                }).end();
            }
        });
         // catch any errors!
         app.use((err: Error, req: any, res: any, next: any) => {

            // Return a 500 - INTERNAL_SERVER_ERROR
            let code;
            log.error(err);
            if (err instanceof InvalidRequestError) {
                code = BAD_REQUEST;
            } else if (err instanceof SystemError) {
                if (err.code = ErrorCode.VALIDATION_ERROR) {
                    code = BAD_REQUEST
                } else {
                    code = INTERNAL_SERVER_ERROR;
                }
            } else {
                code = INTERNAL_SERVER_ERROR;
            }
            res.status(code);
            const responseBody = {
                code: code,
                property: err.name,
                message: err.message,
            };
            
            console.error(err.message); // Log error message in our server's console
            res.status(code).send(responseBody); // All HTTP requests must have a response, so let's send back an error with its status code and message
        });
    }

    /**
     * Set the response body that will be logged by the service logger.
     *
     * @param responseBody The response body to log
     */
    public setResponseBody(responseBody: any) {
        httpContext.set('responseBody', responseBody);
    }

}

export default new ServiceLog();
