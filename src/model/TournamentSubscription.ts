import {z} from 'zod';
import AWS from "aws-sdk";
const sqs = new AWS.SQS();

const bla = async (name: string) => {
    await sqs.sendMessage({
        QueueUrl: process.env.QUEUE_URL!,
        MessageBody: JSON.stringify({name: name})
    }).promise();
}
export const TournamentSubscriptionSchema = z.object({
    id: z.string().uuid(),
    type: z.string(),
    subscriptionId: z.string().uuid(),
    createdOn: z.string(),
    playerName: z.string(),
    playerEmail: z.string()
})

export type TournamentSubscription = z.infer<typeof TournamentSubscriptionSchema>