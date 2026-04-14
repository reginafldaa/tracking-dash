import { z } from "zod";

export const pelatihanSchema = z.object({
  name: z.string().min(1, "Nama pelatihan wajib diisi"),
  description: z.string().optional(),
  image: z.string().optional(),
  duration: z.coerce.number().min(1, "Durasi minimal 1 jam/hari"),
  status: z.boolean().default(true),
});

export type PelatihanInput = z.infer<typeof pelatihanSchema>;
