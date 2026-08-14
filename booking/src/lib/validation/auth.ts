// Zod schemas at the auth boundary. Reject unknown keys; normalize email.
import { z } from "zod";

export const roleSchema = z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]);

export const signupSchema = z
  .object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(8).max(200),
    name: z.string().trim().min(1).max(120),
    // Public signup defaults to CUSTOMER; ADMIN is never self-assignable.
    role: z.enum(["CUSTOMER", "PROVIDER"]).default("CUSTOMER"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(1).max(200),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
