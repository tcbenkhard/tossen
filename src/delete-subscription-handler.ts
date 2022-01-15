import {ProxyHandler} from "./util/ProxyHandler";
import {z} from "zod";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {TournamentService} from "./service/TournamentService";
import {Response} from "./util/Response";

export const DeleteSubscriptionRequestSchema = z.object({
    id: z.string().uuid(),
    subscriptionId: z.string().uuid()
})

export type DeleteSubscriptionRequest = z.infer<typeof DeleteSubscriptionRequestSchema>;

class DeleteSubscriptionHandler extends ProxyHandler<DeleteSubscriptionRequest> {
    private tournamentService = new TournamentService();

    async handle(request: DeleteSubscriptionRequest): Promise<APIGatewayProxyResult> {
        await this.tournamentService.deleteSubscription(request.id, request.subscriptionId);
        return Response.noContent();
    }

    parseRequest(event: APIGatewayProxyEvent): DeleteSubscriptionRequest {
        const request = DeleteSubscriptionRequestSchema.parse({
            id: event.pathParameters?.id,
            subscriptionId: event.pathParameters?.subscriptionId
        });

        return DeleteSubscriptionRequestSchema.parse(request);
    }
    
}

export const handler = new DeleteSubscriptionHandler().handler;
