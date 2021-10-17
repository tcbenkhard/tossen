import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {ApiError, Errors, InternalServerError} from "./ApiError";

export abstract class ProxyHandler<T> {

    abstract parseRequest(event:  APIGatewayProxyEvent): T;

    abstract handle(request: T): Promise<APIGatewayProxyResult>;

    handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const request = this.parseRequest(event);
            const result = await this.handle(request);
            console.log('Handler finished with result:', result);
            return result;
        } catch (e) {
            console.error(e);
            if(e instanceof ApiError) {
                return e;
            } else {
                return Errors.unexpectedError();
            }
        }
    }
}