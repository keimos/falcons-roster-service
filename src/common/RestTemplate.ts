import { IncomingMessage } from 'http';
import * as request from 'request';
// const syncrequest = require('sync-request');
// import {Config } from '../../config/config-file';
import { HttpError } from './http-error';
import { ErrorCode } from './error-codes-enum';

import log from '../logging/Log';

// const timeout: number = 50000;
const defaultTimeout: number = 50000;
// const appConfig: Config = Config.getInstance(); // TODO: doesn't work
export class RestTemplate {

    public static getDataFromSource(uri: string, qs?: any, headers?: any): Promise<string> {
        log.debug('timeout: ' + process.env.restTimeout);
        log.info(`OUTGOING REQUEST [GET] ${uri}`);
        let buffer: string = '';
        let response: IncomingMessage;
        const promise = new Promise<string>((resolve, reject) => {
            request.get({
                headers,
                method: 'GET',
                qs,
                timeout: this.getTimeout(),
                uri,
            }).on('error', (err: any) => {
                let message = '';
                if (err.code === 'ESOCKETTIMEDOUT') {
                    message = `HTTP Timeout Error.  Call exceeded timeout value of ${this.getTimeout()}`;
                } else {
                    message = `Unknown Http connection Error.  Call to ${uri} failed to connect.  ${JSON.stringify(err)}`;
                }
                log.error(message);
                const httpErr: HttpError = new HttpError(ErrorCode.CONNECTION_ERROR, 'External Service Error',
                    message, '');
                reject(httpErr);
            }).on('response', (res: IncomingMessage) => {
                response = res;
            }).on('data', (data: string | Buffer) => buffer += data).on('end', () => {
                if (response.statusCode > 399) {
                    const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                        `error posting to ${uri}`, buffer, response.statusCode, response.headers['content-type']);
                    log.info(`INCOMING RESPONSE - http status: ${response.statusCode}`);
                    log.debug(`BODY: ${buffer}`);
                    reject(httpErr);
                } else {
                    log.info(`INCOMING RESPONSE - http status: ${response.statusCode}`);
                    log.debug(`BODY: ${buffer}`);
                    resolve(buffer);
                }
            });
        });

        return promise;
    }

    // public static getBinaryFromSource(uri: string) {

    //     const res = syncrequest('GET', uri, { headers: { Accept: 'application/octet-stream' } });

    //     return res;
    // }

    public static postToExternalSource(uri: string, body: any, headers?: any): Promise<any> {
        log.debug(`OUTGOING REQUEST [POST] ${uri} -BODY: ${body}`);
        headers = this.setContentType(headers);
        let buffer = '';
        let statusCodeFromResponse: number = 0;
        const promise: Promise<any> = new Promise<void>((resolve: any, reject: any) => {
            request({
                body,
                headers,
                method: 'POST',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response: IncomingMessage) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err: Error) => {
                // log.error('HTTP Call Failed');
                const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                    `error posting to ${uri}: ${err.message}`, '');
                reject(httpErr);
            }).on('data', (data: string | Buffer) => buffer += data).on('end', () => {
                if (statusCodeFromResponse > 399) {
                    const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                        `error posting to ${uri}`, buffer, statusCodeFromResponse);
                    // log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                    reject(httpErr);
                } else {
                    // log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                    resolve(buffer);
                }
            });
        });
        return promise;
    }

    public static putToExternalSource(uri: string, body: string, headers?: any): Promise<any> {
        log.debug(`OUTGOING REQUEST [PUT] ${uri} -BODY: ${body}`);
        headers = this.setContentType(headers);
        let buffer = '';
        let statusCodeFromResponse: number = 0;
        const promise = new Promise<any>((resolve: any, reject: any) => {
            request({
                body,
                headers,
                method: 'PUT',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response: IncomingMessage) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err: Error) => {
                // log.error('HTTP Call Failed');
                const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                    `error posting to ${uri}: ${err.message}`, '');
                reject(httpErr);
            }).on('data', (data: string | Buffer) => buffer += data)
                .on('end', () => {
                    if (statusCodeFromResponse > 399) {
                        const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                            `error posting to ${uri}`, buffer, statusCodeFromResponse);
                        // log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                        reject(httpErr);
                    } else {
                        // log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                        resolve(buffer);
                    }

                });
        });

        return promise;
    }

    public static deleteToExternalSource(uri: string, headers?: any): Promise<any> {
        log.debug(`OUTGOING REQUEST [DELETE] ${uri}`);
        let buffer = '';
        let statusCodeFromResponse: number = 0;
        const promise = new Promise<any>((resolve: any, reject: any) => {
            request({
                headers,
                method: 'DELETE',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response: IncomingMessage) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err: Error) => {
                    log.error('HTTP Call Failed');
                    const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                        `error posting to ${uri}: ${err.message}`, '');
                    reject(httpErr);
            }).on('data', (data: string | Buffer) => buffer += data)
                .on('end', () => {
                    if (statusCodeFromResponse > 399) {
                        const httpErr: HttpError = new HttpError(ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error',
                            `error posting to ${uri}`, buffer, statusCodeFromResponse);
                        log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                        reject(httpErr);
                    } else {
                        log.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                        resolve(buffer);
                    }
                });
        });

        return promise;
    }

    public static getBinaryFromSource(uri: string, headers: any) {

        let buffer: Buffer = new Buffer('base64');
        let response: IncomingMessage;
        const promise = new Promise<Buffer>((resolve, reject) => {
            request.get({
                encoding: null,
                headers,
                method: 'GET',
                timeout: this.getTimeout(),
                uri,
            }).on('error', (err: Error) => reject(err.message)).on('response', (res: IncomingMessage) => {
                response = res;
            }).on('data', (data: Buffer) => {
                buffer = Buffer.concat([buffer, data]);
            }).on('end', () => {
                if (response.statusCode > 399) {
                    reject({ message: `error posting to ${uri}`, statusCode: response.statusCode, response: buffer });
                } else {
                    resolve(buffer);
                }
            });
        });

        return promise;

    }

    private static setContentType(headers: any) {
        if (headers) {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
         } else {
             headers = {
                 'Content-Type': 'application/json',
             };
         }
        return headers;
    }

    private static getTimeout(): number {
        const timeout =  process.env.timeout;
        if (timeout) {
            log.silly(`timeout to use: ${timeout}`);
            return Number.parseInt(timeout, 10);
        }
        log.silly(`timeout to use: ${defaultTimeout}`);
        return defaultTimeout;
    }

}