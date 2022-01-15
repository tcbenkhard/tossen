import {z} from "zod";

export const CreateTournamentRequestSchema = z.object({
    tournamentName: z.string(),
    origin: z.string().url(),
    tournamentDate: z.string(),
    creatorEmail: z.string().email(),
    creatorName: z.string()
})

export type CreateTournamentRequest = z.infer<typeof CreateTournamentRequestSchema>