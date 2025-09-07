const { z } = require('zod');

const email = z.string().trim().email();
const password = z.string().min(8).max(64);
const role = z.enum(['admin', 'user']);

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  role: role.optional().default('user')
});

const loginSchema = z.object({
  email,
  password: z.string().min(1) // allow any length here to avoid info leaks
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

module.exports = { signupSchema, loginSchema, refreshSchema };
