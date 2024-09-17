import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponse } from '../@types/error-response';

export const CommonApiResponses = () =>
  applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ErrorResponse,
    }),
    ApiResponse({ status: 403, description: 'Forbidden', type: ErrorResponse }),
    ApiResponse({ status: 404, description: 'Not Found', type: ErrorResponse }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ErrorResponse,
    }),
  );
