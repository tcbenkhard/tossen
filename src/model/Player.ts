import {z} from "zod";

export const PlayerSchema = z.object({
    id: z.string().uuid(),
    playerName: z.string(),
    email: z.string().email().optional()
})

export type Player = z.infer<typeof PlayerSchema>