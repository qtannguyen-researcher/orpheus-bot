import { z } from "zod";

export const PITCH_STEPS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export const NOTE_TYPES = ["whole", "half", "quarter", "eighth", "16th", "32nd"] as const;
export const CLEFS = ["treble", "bass", "alto", "tenor"] as const;

export const pitchSchema = z.object({
  step: z.enum(PITCH_STEPS),
  alter: z.union([z.literal(-2), z.literal(-1), z.literal(0), z.literal(1), z.literal(2)]),
  octave: z.number().int().min(0).max(8),
});

export const durationSchema = z.object({
  divisions: z.number().int().positive(),
  type: z.enum(NOTE_TYPES),
  dots: z.number().int().min(0).max(2).optional(),
});

export const noteEventSchema = z.object({
  pitch: pitchSchema.nullable(),
  duration: durationSchema,
  onsetBeats: z.number().min(0),
  voice: z.number().int().min(1),
  confidence: z.number().min(0).max(1).optional(),
  tied: z.boolean().optional(),
  lyric: z.string().optional(),
});

export const measureSchema = z.object({
  number: z.number().int().positive(),
  notes: z.array(noteEventSchema),
  partial: z.boolean().optional(),
});

export const partSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  clef: z.enum(CLEFS),
  instrument: z.string().optional(),
  measures: z.array(measureSchema).min(1),
});

export const scoreMetaSchema = z.object({
  title: z.string().min(1),
  composer: z.string().optional(),
  key: z.string().min(1),
  time: z.string().regex(/^\d+\/\d+$/),
  tempoBpm: z.number().positive(),
  pickupBeats: z.number().min(0).optional(),
});

export const scoreIrSchema = z.object({
  version: z.literal(1),
  meta: scoreMetaSchema,
  parts: z.array(partSchema).min(1),
});

export type Pitch = z.infer<typeof pitchSchema>;
export type Duration = z.infer<typeof durationSchema>;
export type NoteEvent = z.infer<typeof noteEventSchema>;
export type Measure = z.infer<typeof measureSchema>;
export type Part = z.infer<typeof partSchema>;
export type ScoreMeta = z.infer<typeof scoreMetaSchema>;
export type ScoreIR = z.infer<typeof scoreIrSchema>;

export function parseScoreIR(input: unknown): ScoreIR {
  return scoreIrSchema.parse(input);
}

export function isScoreIR(input: unknown): input is ScoreIR {
  return scoreIrSchema.safeParse(input).success;
}
