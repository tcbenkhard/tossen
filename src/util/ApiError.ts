import {APIGatewayProxyResult} from "aws-lambda";

interface Error {
    errorCode: string;
    message: string;
}

export abstract class ApiError implements APIGatewayProxyResult {
    statusCode;
    body;
    headers: { [p: string]: boolean | number | string } | undefined;
    isBase64Encoded: boolean | undefined;
    multiValueHeaders: { [p: string]: Array<boolean | number | string> } | undefined;

    constructor(statusCode: number, error: Error) {
        this.statusCode = statusCode;
        this.body = JSON.stringify({
            statusCode,
            ...error
        });
    }
}

export class BadRequestError extends ApiError {

    constructor(body: Error) {
        super(400, body);
    }
}

export class InternalServerError extends ApiError {
    constructor(body: Error) {
        super(500, body);
    }
}

export class Errors {
    public static unexpectedError = () => new InternalServerError({errorCode: 'UNEXPECTED_ERROR', message: 'An unexpected error occured.'});
}