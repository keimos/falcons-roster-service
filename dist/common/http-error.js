"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(code, name, errorMessage, httpBody, httpStatus, contentType) {
        super();
        this.errorMessage = errorMessage;
        this.code = code;
        this.httpStatus = httpStatus;
        this.name = name;
        this.httpBody = httpBody;
        this.contentType = contentType;
    }
}
exports.HttpError = HttpError;