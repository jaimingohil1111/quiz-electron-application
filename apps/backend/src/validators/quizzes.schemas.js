const { z } = require('zod');

const base = {
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(3).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  difficulty: z.string().trim().max(40).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  time_limit_sec: z.number().int().positive().max(60 * 60).optional(),
  version: z.number().int().positive().optional().default(1)
};

const createQuizSchema = z.object(base);
const updateQuizSchema = z.object({
  title: base.title.optional(),
  slug: base.slug.optional(),
  description: base.description,
  category: base.category,
  difficulty: base.difficulty,
  tags: base.tags,
  status: base.status,
  time_limit_sec: base.time_limit_sec,
  version: base.version
}).refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

module.exports = { createQuizSchema, updateQuizSchema };
