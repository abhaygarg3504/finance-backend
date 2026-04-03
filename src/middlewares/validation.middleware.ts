import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,   // collect all errors, not just first
      stripUnknown: true,  // remove undeclared keys
    });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(ApiError.badRequest(message));
    }

    req[target] = value;
    next();
  };
};
