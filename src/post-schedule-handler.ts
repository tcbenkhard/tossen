import {PostScheduleRequest, PostScheduleRequestSchema} from "./model/Schedule";
import {ProxyHandler} from "./util/ProxyHandler";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Errors} from "./util/ApiError";
import {TournamentService} from "./service/TournamentService";
import {Response} from "./util/Response";

class PostScheduleHandler extends ProxyHandler<PostScheduleRequest> {
    private tournamentService = new TournamentService();


    async handle(request: PostScheduleRequest): Promise<APIGatewayProxyResult> {
        const tournament = await this.tournamentService.findTournamentById(request.tournamentId);
        if(request.token !== tournament.token)
            throw Errors.forbiddenError('Not allowed to generate schedule for this tournament.');
        const matches = await this.tournamentService.generateSchedule(request);
        return Response.created(matches);
    }

    parseRequest(event: APIGatewayProxyEvent): PostScheduleRequest {
        if(!event.body)
            throw Errors.missingBodyError();

        const body = JSON.parse(event.body);
        const request = PostScheduleRequestSchema.parse({
            tournamentId: event.pathParameters?.id,
            token:  event.headers.token || event.headers.Token,
            numberOfCourts: body.numberOfCourts,
            numberOfRounds: body.numberOfRounds,
            gameType: body.gameType
        });

        return request;
    }
}

export const handler = new PostScheduleHandler().handler;

export default () => {

}