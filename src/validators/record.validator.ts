import Joi from 'joi';

export const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  type: Joi.string().valid('INCOME', 'EXPENSE').required().messages({
    'any.only': 'Type must be either INCOME or EXPENSE',
    'any.required': 'Type is required',
  }),
  category: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Category is required',
  }),
  date: Joi.date().iso().max('now').required().messages({
    'date.iso': 'Date must be in ISO format (YYYY-MM-DD)',
    'date.max': 'Date cannot be in the future',
    'any.required': 'Date is required',
  }),
  note: Joi.string().max(500).optional().allow(''),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid('INCOME', 'EXPENSE'),
  category: Joi.string().min(2).max(50),
  date: Joi.date().iso().max('now'),
  note: Joi.string().max(500).optional().allow(''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});
