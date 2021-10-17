import {Tournament, TournamentRequest, TournamentRequestSchema} from "./model/Tournament";
import {ProxyHandler} from "./util/ProxyHandler";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {TournamentRepository} from "./repository/TournamentRepository";
import { v4 as uuidv4 } from 'uuid';
import {SesClient} from "./client/SesClient";
import {Response} from "./util/Response";

class CreateTournamentHandler extends ProxyHandler<TournamentRequest> {
    private repository = new TournamentRepository();
    private mailClient = new SesClient();

    async handle(request: TournamentRequest): Promise<APIGatewayProxyResult> {
        const tournament: Tournament = {
            id: uuidv4(),
            token: generateToken(),
            ...request
        }
        await this.repository.save(tournament);
        await this.mailClient.sendTournamentConfirmation(tournament);

        return Response.OK(tournament);
    }

    parseRequest(event: APIGatewayProxyEvent): TournamentRequest {
        const body = event.body;
        return TournamentRequestSchema.parse(body);
    }
}

export const handler = new CreateTournamentHandler().handler;