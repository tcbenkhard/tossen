import * as AWS from 'aws-sdk';
import {Tournament} from "../model/Tournament";

const tournamentCreatedConfirmationTemplate = require('./templates/tournament-created-confirmation.json');

export class SesClient {
    private sesClient = new AWS.SES();

    sendTournamentConfirmation = (tournament: Tournament) => {
        this.sesClient.sendTemplatedEmail({
            Template: tournamentCreatedConfirmationTemplate,
            TemplateData: JSON.stringify({
                name: tournament.name
            }),
            Destination: {
                ToAddresses: [tournament.creatorEmail]
            },
            Source: 'no-reply@benkhard.com'
        }).promise();
    }
}