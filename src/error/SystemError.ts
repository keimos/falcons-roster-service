import { ErrorCode } from '../utils/error-codes-enum';

export class SystemError extends Error {
    public code: ErrorCode;
    public httpStatus: number;
    public name: string;
    public message: string;

    constructor(code: ErrorCode, name: string, message: string, httpStatus?: number) {
        super();
        this.message = message;
        this.code = code;
        this.httpStatus = httpStatus;
        this.name = name;
    }
}