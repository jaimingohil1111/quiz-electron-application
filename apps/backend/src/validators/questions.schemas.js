const { z } = require('zod');

const qType = z.enum(['mcq', 'tf', 'fib']);

const createQuestionSchema = z.object({
  quiz_id: z.number().int().positive(),
  type: qType,
  text: z.string().trim().min(1),
  options: z.array(z.string()).optional(),       // required for 'mcq' at UI level
  correct: z.array(z.string()).optional(),       // ["Paris"] or ["true"] etc.
  explanation: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional().nullable(),
  position: z.number().int().positive().optional()
});

const updateQuestionSchema = z.object({
  quiz_id: z.number().int().positive().optional(),
  type: qType.optional(),
  text: z.string().trim().min(1).optional(),
  options: z.array(z.string()).optional(),
  correct: z.array(z.string()).optional(),
  explanation: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional().nullable(),
  position: z.number().int().positive().optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

module.exports = { createQuestionSchema, updateQuestionSchema };
