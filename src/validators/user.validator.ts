import Joi from 'joi';

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  role: Joi.string().valid('VIEWER', 'ANALYST', 'ADMIN'),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase, one lowercase, and one digit',
    }),
});
