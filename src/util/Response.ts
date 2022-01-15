import {APIGatewayProxyResult} from "aws-lambda";

export class Response {
    private static response = (statusCode: number, object: any): APIGatewayProxyResult => {
        return {
            statusCode,
            body: JSON.stringify(object),
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }
    }

    static ok = (object: any): APIGatewayProxyResult => Response.response(200, object);
    static created = (object: any): APIGatewayProxyResult => Response.response(201, object);
    static forbidden = (object: any): APIGatewayProxyResult => Response.response(403, object);
    static noContent = (): APIGatewayProxyResult => Response.response(204, {});
}