import {Player} from "../model/Player";
import {Match} from "../model/Match";
import {smallestCoprime} from "./MathUtils";
import {rotateArray, shuffle} from "./ArrayUtils";
import {v4 as uuid} from 'uuid';
import {Round} from "../model/Round";

interface GenerateMatchOptions {
    tournamentId: string,
    gameType: 'single' | 'double',
    numberOfRounds: number,
    numberOfCourts: number
}

interface RoundGeneratorOptions {
    round: number,
    tournamentId: string,
    playersPerTeam: number,
    numberOfCourts: number
}

interface GeneratedRound {
    matches: Match[],
    idlePlayers: string[],
}

interface GeneratorResults {
    rounds: Round[],
    matches: Match[]
}

export class ScheduleGenerator {
    generateMatches = (players: Player[], options: GenerateMatchOptions): GeneratorResults => {
        const playersPerTeam = options.gameType === 'single' ? 1 : 2;
        const minimumShiftSteps = options.gameType === 'single' ? 1 : 3;
        const steps = smallestCoprime(players.length-1, minimumShiftSteps);

        const playerPool = shuffle(players);
        let rounds = new Array<Round>();
        let matches = new Array<Match>();

        for(let i = 0; i < options.numberOfRounds; i++) {
            const generatedRound = this.generateRound(playerPool, {
                round: i,
                tournamentId: options.tournamentId,
                playersPerTeam,
                numberOfCourts: options.numberOfCourts
            });
            matches.push(...generatedRound.matches);
            rounds.push({
                id: options.tournamentId,
                type: `round#${uuid()}`,
                roundNumber: i,
                idlePlayers: generatedRound.idlePlayers
            })
            rotateArray(playerPool, steps);
        }

        return {
            rounds,
            matches
        };
    }

    private generateRound = (players: Player[], options: RoundGeneratorOptions): GeneratedRound => {
        const firstGroup = players.slice(0, Math.ceil(players.length/2));
        const secondGroup = players.slice(Math.ceil(players.length/2));
        const matches = new Array<Match>();
        const idlePlayers = new Array<string>();
        let usedCourts = 0;

        for(let i = 0; i < firstGroup.length; i+=options.playersPerTeam) {
            const teamA = firstGroup.slice(i, i + options.playersPerTeam).map(player => player.playerName);
            const teamB = secondGroup.slice(i, i + options.playersPerTeam).map(player => player.playerName);

            if (teamA.length != options.playersPerTeam || teamB.length != options.playersPerTeam || usedCourts >= options.numberOfCourts) {
                idlePlayers.push(...teamA, ...teamB);
            } else {
                matches.push({
                    id: options.tournamentId,
                    type: `match#${uuid()}`,
                    roundNumber: options.round,
                    teamA,
                    teamB
                });
                usedCourts++;
            }
        }

        return {
            idlePlayers,
            matches
        };
    }
}