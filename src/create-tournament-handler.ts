import {ProxyHandler} from "./util/ProxyHandler";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Response} from "./util/Response";
import {MailService} from "./service/MailService";
import {TournamentService} from "./service/TournamentService";
import {CreateTournamentRequest, CreateTournamentRequestSchema} from "./model/CreateTournamentRequest";

class CreateTournamentHandler extends ProxyHandler<CreateTournamentRequest> {
    private service = new TournamentService();

    async handle(request: CreateTournamentRequest): Promise<APIGatewayProxyResult> {
        const tournament = await this.service.create(request);

        return Response.created(tournament);
    }

    parseRequest(event: APIGatewayProxyEvent): CreateTournamentRequest {
        const body = JSON.parse(event.body!);
        const request = {
            ...body,
            origin: event.headers.origin
        }
        return CreateTournamentRequestSchema.parse(request);
    }
}

export const handler = new CreateTournamentHandler().handler;