import {TournamentRepository} from "../repository/TournamentRepository";
import {v4 as uuidv4} from "uuid";
import {generateToken} from "../util/TokenGenerator";
import moment from "moment";
import {CreateTournamentRequest} from "../model/CreateTournamentRequest";
import {TournamentMeta} from "../model/TournamentMeta";
import {TournamentSubscription} from "../model/TournamentSubscription";
import * as crypto from "crypto";
import {MailService} from "./MailService";
import {SubscriptionRequest} from "../post-subscription-handler";
import {ScheduleGenerator} from "../util/ScheduleGenerator";
import {PostScheduleRequest} from "../model/Schedule";
import {Round} from "../model/Round";

export class TournamentService {
    private repository = new TournamentRepository();
    private mailService = new MailService();
    private scheduleGenerator = new ScheduleGenerator();

    cryptoFunction = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

    public async create(request: CreateTournamentRequest): Promise<TournamentMeta> {
        const tournament: TournamentMeta = {
            id: uuidv4(),
            type: 'meta',
            token: generateToken(),
            createdOn: moment().toISOString(),
            tournamentDate: request.tournamentDate,
            tournamentName: request.tournamentName,
        }

        await Promise.all([
            this.repository.createTournament(tournament),
            this.mailService.sendMail(request.creatorEmail, 'tournament-confirmation', {
                'tournamentName': `${request.tournamentName}`,
                'shareLink': `${request.origin}/${tournament.id}`,
                'shareLinkText': `${request.origin}/${tournament.id}`,
                'manageLink': `${request.origin}/${tournament.id}/${tournament.token}`
            }),
            this.subscribe({
                name: request.creatorName,
                email: request.creatorEmail,
                tournamentId: tournament.id
            })
        ]);

        return tournament;
    }

    public async getSubscriptions(tournamentId: string): Promise<TournamentSubscription[]> {
        console.log(`Retrieving all subscriptions for tournament: ${tournamentId}`);
        return await this.repository.getSubscriptions(tournamentId);
    }

    public async deleteSubscription(tournamentId: string, subscriptionId: string): Promise<void> {
        console.log(`Deleting subscription with id ${subscriptionId} from tournament with id ${tournamentId}`);
        return await this.repository.deleteSubscription(tournamentId, subscriptionId);
    }

    public async subscribe(request: SubscriptionRequest) {
        const subscriptions = await this.getSubscriptions(request.tournamentId);
        const tournament = await this.repository.findTournamentById(request.tournamentId);
        const hashedEmail = this.cryptoFunction(request.email);
        const existingSubscriptions = subscriptions.filter(sub => sub.playerEmail === hashedEmail).length
        if(existingSubscriptions === 0) {
            const playerId = uuidv4();
            await Promise.all([
                this.repository.createSubscription({
                    id: request.tournamentId,
                    subscriptionId: playerId,
                    type: `player#${playerId}`,
                    playerName: request.name,
                    createdOn: moment().toISOString(),
                    playerEmail: hashedEmail
                }),
                this.mailService.sendMail(request.email, 'subscription-confirmation', {
                    'tournamentName': tournament.tournamentName
                })
            ]);
        }
    }

    public async findTournamentById(id: string): Promise<TournamentMeta> {
        return await this.repository.findTournamentById(id);
    }

    public async generateSchedule(request: PostScheduleRequest) {
        const existingRounds = await this.repository.getRounds(request.tournamentId);
        const existingMatches = await this.repository.getMatches(request.tournamentId);
        const deleteRoundPromises = existingRounds.map(round => this.repository.delete(request.tournamentId, round.type));
        const deleteMatchPromises = existingMatches.map(match => this.repository.delete(request.tournamentId, match.type));
        await Promise.all([...deleteRoundPromises, ...deleteMatchPromises]);

        const players = await this.getSubscriptions(request.tournamentId)
        const generatedResults = this.scheduleGenerator.generateMatches(players, {
            tournamentId: request.tournamentId,
            numberOfRounds: request.numberOfRounds,
            numberOfCourts: request.numberOfCourts,
            gameType: request.gameType
        })
        const roundPromises = generatedResults.rounds
            .map(round => this.repository.save(round));
        const matchPromises = generatedResults.matches
            .map(match => this.repository.save(match));

        await Promise.all([...roundPromises, ...matchPromises]);
    }
}