import * as AWS from "aws-sdk";
import {getEnvironmentVariable} from "../util/Environment";
import {TournamentMeta} from "../model/TournamentMeta";
import {NotFoundError} from "../util/ApiError";
import {TournamentSubscription} from "../model/TournamentSubscription";
import {Match} from "../model/Match";
import {Round} from "../model/Round";

export class TournamentRepository {
    private dynamoClient = new AWS.DynamoDB.DocumentClient();
    private readonly TOURNAMENTS_TABLE = getEnvironmentVariable('TOURNAMENTS_TABLE');

    createTournament = async (tournament: TournamentMeta): Promise<TournamentMeta> => {
        await this.dynamoClient.put({
            TableName: this.TOURNAMENTS_TABLE,
            Item: tournament,
        }).promise();

        return tournament;
    }

    createSubscription = async (subscription: TournamentSubscription): Promise<TournamentSubscription> => {
        await this.dynamoClient.put({
            TableName: this.TOURNAMENTS_TABLE,
            Item: subscription,
        }).promise();

        return subscription;
    }

    deleteSubscription = async (tournamentId: string, subscriptionId: string) => {
        await this.dynamoClient.delete({
            TableName: this.TOURNAMENTS_TABLE,
            Key: {
                'id': tournamentId,
                'type': `player#${subscriptionId}`
            }
        }).promise();
    }

    delete = async (tournamentId: string, type: string) => {
        await this.dynamoClient.delete({
            TableName: this.TOURNAMENTS_TABLE,
            Key: {
                'id': tournamentId,
                'type': type
            }
        }).promise();
    }

    getSubscriptions = async (tournamentId: string): Promise<TournamentSubscription[]> => {
        const result = await this.dynamoClient.query({
            TableName: this.TOURNAMENTS_TABLE,
            KeyConditionExpression: 'id = :id and begins_with(#type, :player)',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':id': tournamentId,
                ':player': 'player'
            }
        }).promise();

        if(result.Items)
            return result.Items as TournamentSubscription[]

        return [];
    }

    findTournamentById = async (id: string): Promise<TournamentMeta> => {
        const result = await this.dynamoClient.get({
            TableName: this.TOURNAMENTS_TABLE,
            Key: {
                'id': id,
                'type': 'meta'
            },
        }).promise();
        if(result.Item)
            return result.Item as TournamentMeta

        throw new NotFoundError({
            errorCode: 'TOURNAMENT_NOT_FOUND',
            message: `Tournament with id ${id} does not exist`
        });
    }

    save = async (item: any): Promise<void> => {
        console.log('Saving item: ', item);
        await this.dynamoClient.put({
            TableName: this.TOURNAMENTS_TABLE,
            Item: item,
        }).promise();
    }

    public async getMatches(id: string): Promise<Match[]> {
        const result = await this.dynamoClient.query({
            TableName: this.TOURNAMENTS_TABLE,
            KeyConditionExpression: 'id = :id and begins_with(#type, :match)',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':id': id,
                ':match': 'match'
            }
        }).promise();

        if(result.Items)
            return result.Items as Match[]

        return [];
    }

    public async getRounds(id: string): Promise<Round[]> {
        const result = await this.dynamoClient.query({
            TableName: this.TOURNAMENTS_TABLE,
            KeyConditionExpression: 'id = :id and begins_with(#type, :round)',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':id': id,
                ':round': 'round'
            }
        }).promise();

        if(result.Items)
            return result.Items as Round[]

        return [];
    }

    async createMatch(match: Match) {
        await this.dynamoClient.put({
            TableName: this.TOURNAMENTS_TABLE,
            Item: match,
        }).promise();

        return match;
    }
}