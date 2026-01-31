import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['local', 'development', 'test', 'staging', 'production']),
    PORT: z.coerce.number().default(3001),
    APP_URL: z.string().url().optional(),
    API_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url().optional(),
    JWT_SECRET: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
    const parsed = EnvSchema.safeParse(config);

    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
}

export type EnvConfig = z.infer<typeof EnvSchema>;
