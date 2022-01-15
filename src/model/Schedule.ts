import {z} from 'zod';

export const PostScheduleRequestSchema = z.object({
    tournamentId: z.string().uuid(),
    token: z.string().optional(),
    numberOfCourts: z.number().min(1).max(20),
    numberOfRounds: z.number().min(1).max(10),
    gameType: z.enum(['single', 'double'])
});

export type PostScheduleRequest = z.infer<typeof PostScheduleRequestSchema>;