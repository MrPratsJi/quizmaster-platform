import { Request, Response, NextFunction } from 'express';

export interface DataValidationFunction {
  (data: any): { error?: string; value?: any };
}

export const validateRequestData = (validationFunction: DataValidationFunction, dataSource: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const targetData = req[dataSource];
    const { error } = validationFunction(targetData);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Data validation failed',
        error: error
      });
      return;
    }
    
    next();
  };
};

export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('System Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'System error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

export const routeNotFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
};