import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Almeno 8 caratteri")
  .regex(/[A-Z]/, "Almeno una maiuscola")
  .regex(/[a-z]/, "Almeno una minuscola")
  .regex(/[0-9]/, "Almeno un numero");

export const registerSchema = z.object({
  email: z.string().email("Email non valida"),
  password: passwordSchema,
  firstName: z.string().min(1, "Nome richiesto").max(80),
  lastName: z.string().min(1, "Cognome richiesto").max(80),
});

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  profileType: z.enum(["PRIVATE", "BUSINESS"]),
  profileName: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  ibanDefault: z.string().nullable().optional(),
  ibanHolderDefault: z.string().nullable().optional(),
  plan: z.enum(["FREE", "PRO", "BUSINESS", "ENTERPRISE"]),
  stripeOnboarded: z.boolean(),
  emailVerified: z.boolean(),
  role: z.enum(["ORGANIZER", "SUPERADMIN"]).default("ORGANIZER"),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: meResponseSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
