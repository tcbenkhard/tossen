import * as AWS from "aws-sdk";
import {getEnvironmentVariable} from "../util/Environment";
import {Tournament, TournamentRequest, TournamentRequestSchema} from "../model/Tournament";

export class TournamentRepository {
    private dynamoClient = new AWS.DynamoDB.DocumentClient();
    private readonly TOURNAMENT_TABLE = getEnvironmentVariable('TOURNAMENT_TABLE');

    save = async (tournament: Tournament): Promise<Tournament> => {
        const result = await this.dynamoClient.put({
            TableName: this.TOURNAMENT_TABLE,
            Item: tournament,
        }).promise();

        return tournament;
    }
}