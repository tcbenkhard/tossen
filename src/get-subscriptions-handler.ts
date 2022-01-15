import {ProxyHandler} from "./util/ProxyHandler";
import {z} from "zod";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {TournamentService} from "./service/TournamentService";
import {Response} from "./util/Response";
import {TournamentSubscription, TournamentSubscriptionSchema} from "./model/TournamentSubscription";

export const GetSubscriptionsRequestSchema = z.object({
    id: z.string().uuid()
});

export type GetSubscriptionsRequest = z.infer<typeof GetSubscriptionsRequestSchema>;

const GetSubscriptionsResponseSchema = TournamentSubscriptionSchema.omit({playerEmail: true});
type GetSubscriptionsResponse = z.infer<typeof GetSubscriptionsResponseSchema>;

class GetSubscriptionsHandler extends ProxyHandler<GetSubscriptionsRequest> {
    private tournamentService = new TournamentService();

    async handle(request: GetSubscriptionsRequest): Promise<APIGatewayProxyResult> {
        const subscriptions = await this.tournamentService.getSubscriptions(request.id);
        const response = subscriptions.map(sub => GetSubscriptionsResponseSchema.parse(sub));
        return Response.ok(response);
    }

    parseRequest(event: APIGatewayProxyEvent): GetSubscriptionsRequest {
        const request = GetSubscriptionsRequestSchema.parse({
            id: event.pathParameters?.id
        });

        return request;
    }
}

export const handler = new GetSubscriptionsHandler().handler;