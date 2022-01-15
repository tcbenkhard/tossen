import {ProxyHandler} from "./util/ProxyHandler";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {Response} from "./util/Response";
import {MailService} from "./service/MailService";
import {TournamentService} from "./service/TournamentService";

import { z } from 'zod'

export const SubscriptionRequestSchema = z.object({
    tournamentId: z.string().uuid(),
    name: z.string(),
    email: z.string().email()
})

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>

class PostSubscriptionHandler extends ProxyHandler<SubscriptionRequest> {
    private tournamentService = new TournamentService();
    private mailService = new MailService();

    async handle(request: SubscriptionRequest): Promise<APIGatewayProxyResult> {
        await this.tournamentService.subscribe(request);

        return Response.created({});
    }

    parseRequest(event: APIGatewayProxyEvent): SubscriptionRequest {
        const body = JSON.parse(event.body!);
        const id = event.pathParameters?.id || '';
        const request: SubscriptionRequest = {
            tournamentId: id,
            email: body.email,
            name: body.name
        }
        return  SubscriptionRequestSchema.parse(request);
    }
}

export const handler = new PostSubscriptionHandler().handler;