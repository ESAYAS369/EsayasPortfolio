import { Response } from 'express';

export const successResponse = (res: Response, data: any, status: number = 200) => {
  res.status(status).json({
    success: true,
    data,
  });
};

export const errorResponse = (res: Response, message: string, status: number = 500) => {
  res.status(status).json({
    success: false,
    error: message,
  });
};
