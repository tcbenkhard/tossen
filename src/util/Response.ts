import {boolean} from "zod";
import {APIGatewayProxyResult} from "aws-lambda";

export class Response {
    static OK = (object: any): APIGatewayProxyResult => {
        return {
            statusCode: 200,
            body: JSON.stringify(object)
        }
    }
}