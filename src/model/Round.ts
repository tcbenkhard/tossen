import {Match} from "./Match";

export interface Round {
    id: string,
    type: string,
    roundNumber: number,
    idlePlayers: string[],
}