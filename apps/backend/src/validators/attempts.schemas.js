const { z } = require('zod');

const startSchema = z.object({
  quizId: z.number().int().positive()
});

const answerSchema = z.object({
  attemptId: z.number().int().positive(),
  qId: z.number().int().positive(),
  answer: z.array(z.string()).min(1),
  timeMs: z.number().int().nonnegative().optional(),
  flagged: z.boolean().optional()
});

const submitSchema = z.object({
  attemptId: z.number().int().positive()
});

module.exports = { startSchema, answerSchema, submitSchema };
