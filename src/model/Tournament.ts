import { z } from 'zod'

export const TournamentRequestSchema = z.object({
    name: z.string(),
    createdOn: z.string(),
    type: z.enum(['single', 'double']),
    numberOfRounds: z.number().min(1).max(10),
    creatorEmail: z.string().email()
})

export type TournamentRequest = z.infer<typeof TournamentRequestSchema>

export const TournamentSchema = z.object({
    id: z.string().uuid(),
    token: z.string().min(6).max(6),
    name: z.string(),
    createdOn: z.string(),
    type: z.enum(['single', 'double']),
    numberOfRounds: z.number().min(1).max(10),
    creatorEmail: z.string().email()
});

export type Tournament = z.infer<typeof TournamentSchema>;
