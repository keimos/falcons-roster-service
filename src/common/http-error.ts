import { ErrorCode } from '../utils/error-codes-enum';

export class HttpError extends Error {
    public code: ErrorCode;
    public httpStatus: number;
    public name: string;
    public errorMessage: string;
    public httpBody: string;
    public contentType: string;

    constructor(code: number, name: string, errorMessage: string, httpBody: string, httpStatus?: number, contentType?: string) {
        super();
        this.errorMessage = errorMessage;
        this.code = code;
        this.httpStatus = httpStatus;
        this.name = name;
        this.httpBody = httpBody;
        this.contentType = contentType;
    }
}