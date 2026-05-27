import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  STRIPE_SECRET_KEY: z.string().min(1).optional().default("sk_test_PLACEHOLDER_REPLACE_ME"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional().default("whsec_PLACEHOLDER_REPLACE_ME"),
  APP_PUBLIC_URL: z.string().url().default("http://localhost:5173"),
  EMAIL_HOST: z.string().optional().default(""),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_USER: z.string().optional().default(""),
  EMAIL_PASS: z.string().optional().default(""),
  EMAIL_SECURE: z.coerce.boolean().default(false),
  EMAIL_FROM: z.string().default("Kicmatch <noreply@kicmatch.local>"),
  MINIO_ENDPOINT: z.string().default("http://minio:9000"),
  MINIO_PUBLIC_ENDPOINT: z.string().default("http://localhost:9000"),
  MINIO_ACCESS_KEY: z.string().default("kicmatch"),
  MINIO_SECRET_KEY: z.string().default("kicmatch-secret"),
  MINIO_BUCKET: z.string().default("kicmatch"),
  ADMIN_BOOTSTRAP_TOKEN: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  // Firebase Cloud Messaging (mobile push). Get from Firebase Console →
  // Project Settings → Service Accounts → Generate new private key.
  FCM_PROJECT_ID: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}
