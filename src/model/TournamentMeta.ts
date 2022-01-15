import {z} from 'zod'
import {PlayerSchema} from "./Player";

const MatchSchema = z.object({
    teamA: z.array(PlayerSchema),
    teamB: z.array(PlayerSchema),
})

const RoundSchema = z.object({
    roundNumber: z.number(),
    matches: z.array(MatchSchema),
    idlePlayers: z.array(PlayerSchema).optional()
})

export const TournamentMetaSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('meta'),
    token: z.string().min(6).max(6).optional(),
    tournamentName: z.string(),
    createdOn: z.string(),
    tournamentDate: z.string(),
});

export type TournamentMeta = z.infer<typeof TournamentMetaSchema>;

export type TournamentResponse = Partial<Omit<TournamentMeta, 'token'|'version'>>

export const GetTournamentRequestSchema = z.object({
    id: z.string().uuid(),
    token: z.string().optional()
})

export type GetTournamentRequest = z.infer<typeof GetTournamentRequestSchema>;