import { z } from 'zod';

const internationalPhoneRegex = /^\+[1-9]\d{1,14}$/;
const htmlTagRegex = /<[^>]*>/;
const noHtml = (value: string): boolean => !htmlTagRegex.test(value);

export const createCandidateSchema = z.object({
  firstName: z
    .string({ required_error: 'Le prenom est requis.' })
    .trim()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres.')
    .max(50, 'Le prenom ne peut pas depasser 50 caracteres.')
    .refine(noHtml, 'Le prenom ne doit pas contenir de balises HTML.'),
  lastName: z
    .string({ required_error: 'Le nom est requis.' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caracteres.')
    .max(50, 'Le nom ne peut pas depasser 50 caracteres.')
    .refine(noHtml, 'Le nom ne doit pas contenir de balises HTML.'),
  email: z
    .string({ required_error: "L'email est requis." })
    .trim()
    .toLowerCase()
    .email("L'email doit etre valide."),
  phone: z
    .string({ required_error: 'Le numero de telephone est requis.' })
    .trim()
    .regex(internationalPhoneRegex, 'Le numero de telephone doit etre au format international (+XXX...).'),
  position: z
    .string({ required_error: 'Le poste est requis.' })
    .trim()
    .min(2, 'Le poste doit contenir au moins 2 caracteres.')
    .max(100, 'Le poste ne peut pas depasser 100 caracteres.')
    .refine(noHtml, 'Le poste ne doit pas contenir de balises HTML.'),
  experience: z
    .number({
      required_error: "L'experience est requise.",
      invalid_type_error: "L'experience doit etre un nombre.",
    })
    .min(0, "L'experience ne peut pas etre negative.")
    .max(50, "L'experience ne peut pas depasser 50 ans."),
  skills: z
    .array(
      z
        .string({ required_error: 'Chaque competence doit etre une chaine.' })
        .trim()
        .min(2, 'Chaque competence doit contenir au moins 2 caracteres.')
        .refine(noHtml, 'Les competences ne doivent pas contenir de balises HTML.'),
      {
        required_error: 'Les competences sont requises.',
        invalid_type_error: 'Les competences doivent etre un tableau de chaines.',
      },
    )
    .min(1, 'Au moins une competence est requise.'),
  resume: z.string().trim().url('Le CV doit etre une URL valide.').optional(),
});

export const updateCandidateSchema = createCandidateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit etre fourni pour la mise a jour.',
  });

export const validateCandidateSchema = z.object({});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type ValidateCandidateInput = z.infer<typeof validateCandidateSchema>;
