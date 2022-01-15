import AWS from "aws-sdk";
import {SendMailEvent} from "../model/SendMailEvent";
import {getEnvironmentVariable} from "../util/Environment";

export class MailService {
    private queueUrl = getEnvironmentVariable('SEND_MAIL_QUEUE_URL');
    private sqs = new AWS.SQS();

    sendMail = async (toAddress: string, template: string, data: {[key: string]: string}) => {
        const event: SendMailEvent = {
            toAddress,
            template,
            data
        }

        await this.sqs.sendMessage({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(event)
        }).promise();
    }
}