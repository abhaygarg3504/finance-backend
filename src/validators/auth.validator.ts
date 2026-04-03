import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase, one lowercase, and one digit',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('VIEWER', 'ANALYST', 'ADMIN').default('VIEWER'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
