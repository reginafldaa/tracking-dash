import { z } from "zod";

// ✅ Validation schema - handles both string input (from form) and Date conversion
export const pelatihanSchema = z.object({
  name: z.string().min(1, "Nama pelatihan wajib diisi"),
  description: z.string().optional(),
  image: z.string().optional(),
  tanggal: z.coerce.date().refine(
    (date) => !isNaN(date.getTime()),
    "Tanggal tidak valid"
  ),
  status: z.boolean().default(true),
});

// ✅ Single source of truth for all types
export type PelatihanFormInput = z.infer<typeof pelatihanSchema>;
export type PelatihanInput = z.infer<typeof pelatihanSchema>;