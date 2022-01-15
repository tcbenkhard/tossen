import {z} from 'zod';

export const SendMailEventSchema = z.object({
    template: z.string(),
    toAddress: z.string().email(),
    data: z.object({})
})
 
export type SendMailEvent = z.infer<typeof SendMailEventSchema>;