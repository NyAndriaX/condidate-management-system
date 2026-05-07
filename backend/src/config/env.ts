import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI est requis.'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET est requis.'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

export const loadEnv = (): EnvConfig => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missingOrInvalid = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(
      `Variables d'environnement manquantes ou invalides: ${missingOrInvalid}`,
    );
  }

  cachedConfig = parsed.data;
  return cachedConfig;
};

export const config: EnvConfig = cachedConfig ?? loadEnv();
