import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: "L'email est requis." })
    .trim()
    .toLowerCase()
    .email("L'email doit etre valide."),
  password: z
    .string({ required_error: 'Le mot de passe est requis.' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres.'),
  name: z
    .string({ required_error: 'Le nom est requis.' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caracteres.')
    .max(100, 'Le nom ne peut pas depasser 100 caracteres.'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'email est requis." })
    .trim()
    .toLowerCase()
    .email("L'email doit etre valide."),
  password: z.string({ required_error: 'Le mot de passe est requis.' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
