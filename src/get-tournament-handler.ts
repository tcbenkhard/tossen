import {ProxyHandler} from "./util/ProxyHandler";
import {GetTournamentRequest, GetTournamentRequestSchema} from "./model/TournamentMeta";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Response} from "./util/Response";
import {TournamentService} from "./service/TournamentService";

class CreateTournamentHandler extends ProxyHandler<GetTournamentRequest> {
    private tournamentService = new TournamentService();

    async handle(request: GetTournamentRequest): Promise<APIGatewayProxyResult> {
        const tournament = await this.tournamentService.findTournamentById(request.id)
        delete tournament.token;

        return Response.ok(tournament);
    }

    parseRequest(event: APIGatewayProxyEvent): GetTournamentRequest {
        const request: GetTournamentRequest = {
            id: event.pathParameters!.id!
        }
        const token = event.headers.token || event.headers.Token
        if (token)
            request.token = token;

        return GetTournamentRequestSchema.parse(request);
    }
}

export const handler = new CreateTournamentHandler().handler;
