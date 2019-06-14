"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const http_error_1 = require("./http-error");
const error_codes_enum_1 = require("./error-codes-enum");
const Log_1 = require("../logging/Log");
const defaultTimeout = 50000;
class RestTemplate {
    static getDataFromSource(uri, qs, headers) {
        Log_1.default.debug('timeout: ' + process.env.restTimeout);
        Log_1.default.info(`OUTGOING REQUEST [GET] ${uri}`);
        let buffer = '';
        let response;
        const promise = new Promise((resolve, reject) => {
            request.get({
                headers,
                method: 'GET',
                qs,
                timeout: this.getTimeout(),
                uri,
            }).on('error', (err) => {
                let message = '';
                if (err.code === 'ESOCKETTIMEDOUT') {
                    message = `HTTP Timeout Error.  Call exceeded timeout value of ${this.getTimeout()}`;
                }
                else {
                    message = `Unknown Http connection Error.  Call to ${uri} failed to connect.  ${JSON.stringify(err)}`;
                }
                Log_1.default.error(message);
                const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.CONNECTION_ERROR, 'External Service Error', message, '');
                reject(httpErr);
            }).on('response', (res) => {
                response = res;
            }).on('data', (data) => buffer += data).on('end', () => {
                if (response.statusCode > 399) {
                    const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}`, buffer, response.statusCode, response.headers['content-type']);
                    Log_1.default.info(`INCOMING RESPONSE - http status: ${response.statusCode}`);
                    Log_1.default.debug(`BODY: ${buffer}`);
                    reject(httpErr);
                }
                else {
                    Log_1.default.info(`INCOMING RESPONSE - http status: ${response.statusCode}`);
                    Log_1.default.debug(`BODY: ${buffer}`);
                    resolve(buffer);
                }
            });
        });
        return promise;
    }
    static postToExternalSource(uri, body, headers) {
        Log_1.default.debug(`OUTGOING REQUEST [POST] ${uri} -BODY: ${body}`);
        headers = this.setContentType(headers);
        let buffer = '';
        let statusCodeFromResponse = 0;
        const promise = new Promise((resolve, reject) => {
            request({
                body,
                headers,
                method: 'POST',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err) => {
                const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}: ${err.message}`, '');
                reject(httpErr);
            }).on('data', (data) => buffer += data).on('end', () => {
                if (statusCodeFromResponse > 399) {
                    const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}`, buffer, statusCodeFromResponse);
                    reject(httpErr);
                }
                else {
                    resolve(buffer);
                }
            });
        });
        return promise;
    }
    static putToExternalSource(uri, body, headers) {
        Log_1.default.debug(`OUTGOING REQUEST [PUT] ${uri} -BODY: ${body}`);
        headers = this.setContentType(headers);
        let buffer = '';
        let statusCodeFromResponse = 0;
        const promise = new Promise((resolve, reject) => {
            request({
                body,
                headers,
                method: 'PUT',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err) => {
                const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}: ${err.message}`, '');
                reject(httpErr);
            }).on('data', (data) => buffer += data)
                .on('end', () => {
                if (statusCodeFromResponse > 399) {
                    const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}`, buffer, statusCodeFromResponse);
                    reject(httpErr);
                }
                else {
                    resolve(buffer);
                }
            });
        });
        return promise;
    }
    static deleteToExternalSource(uri, headers) {
        Log_1.default.debug(`OUTGOING REQUEST [DELETE] ${uri}`);
        let buffer = '';
        let statusCodeFromResponse = 0;
        const promise = new Promise((resolve, reject) => {
            request({
                headers,
                method: 'DELETE',
                timeout: this.getTimeout(),
                uri,
            }).on('response', (response) => {
                statusCodeFromResponse = response.statusCode;
            }).on('error', (err) => {
                Log_1.default.error('HTTP Call Failed');
                const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}: ${err.message}`, '');
                reject(httpErr);
            }).on('data', (data) => buffer += data)
                .on('end', () => {
                if (statusCodeFromResponse > 399) {
                    const httpErr = new http_error_1.HttpError(error_codes_enum_1.ErrorCode.EXTERNAL_SERVICE_ERROR, 'External Service Error', `error posting to ${uri}`, buffer, statusCodeFromResponse);
                    Log_1.default.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                    reject(httpErr);
                }
                else {
                    Log_1.default.debug(`INCOMING RESPONSE - http status: ${statusCodeFromResponse} - BODY: ${buffer}`);
                    resolve(buffer);
                }
            });
        });
        return promise;
    }
    static getBinaryFromSource(uri, headers) {
        let buffer = new Buffer('base64');
        let response;
        const promise = new Promise((resolve, reject) => {
            request.get({
                encoding: null,
                headers,
                method: 'GET',
                timeout: this.getTimeout(),
                uri,
            }).on('error', (err) => reject(err.message)).on('response', (res) => {
                response = res;
            }).on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);
            }).on('end', () => {
                if (response.statusCode > 399) {
                    reject({ message: `error posting to ${uri}`, statusCode: response.statusCode, response: buffer });
                }
                else {
                    resolve(buffer);
                }
            });
        });
        return promise;
    }
    static setContentType(headers) {
        if (headers) {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        }
        else {
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return headers;
    }
    static getTimeout() {
        const timeout = process.env.timeout;
        if (timeout) {
            Log_1.default.silly(`timeout to use: ${timeout}`);
            return Number.parseInt(timeout, 10);
        }
        Log_1.default.silly(`timeout to use: ${defaultTimeout}`);
        return defaultTimeout;
    }
}
exports.RestTemplate = RestTemplate;