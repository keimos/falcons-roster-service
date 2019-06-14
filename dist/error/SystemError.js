"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SystemError extends Error {
    constructor(code, name, message, httpStatus) {
        super();
        this.message = message;
        this.code = code;
        this.httpStatus = httpStatus;
        this.name = name;
    }
}
exports.SystemError = SystemError;