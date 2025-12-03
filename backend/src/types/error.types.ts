import { Prisma } from '@prisma/client';

/**
 * Custom API Error class with HTTP status code
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
    success: false;
    error: string;
    details?: any;
    timestamp?: string;
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
export function handlePrismaError(error: any): ApiError {
    // Prisma Client errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                // Unique constraint violation
                const target = error.meta?.target as string[] | undefined;
                const field = target?.[0] || 'field';
                return new ApiError(
                    400,
                    `A record with this ${field} already exists`,
                    { code: error.code, field }
                );

            case 'P2025':
                // Record not found
                return new ApiError(
                    404,
                    'The requested record was not found',
                    { code: error.code }
                );

            case 'P2003':
                // Foreign key constraint failed
                return new ApiError(
                    400,
                    'Cannot perform this operation due to related records',
                    { code: error.code }
                );

            case 'P2014':
                // Required relation violation
                return new ApiError(
                    400,
                    'Cannot perform this operation due to required relations',
                    { code: error.code }
                );

            default:
                return new ApiError(
                    500,
                    'Database operation failed',
                    { code: error.code, message: error.message }
                );
        }
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
        return new ApiError(
            400,
            'Invalid data provided',
            { message: error.message }
        );
    }

    // Prisma initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return new ApiError(
            500,
            'Database connection failed',
            { message: error.message }
        );
    }

    // Not a Prisma error
    return new ApiError(
        500,
        'An unexpected error occurred',
        { message: error.message }
    );
}

/**
 * Format error response
 */
export function formatErrorResponse(error: ApiError | Error): ErrorResponse {
    if (error instanceof ApiError) {
        return {
            success: false,
            error: error.message,
            details: error.details,
            timestamp: new Date().toISOString(),
        };
    }

    return {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
    };
}

/**
 * Log error with context
 */
export function logError(
    context: string,
    error: any,
    additionalInfo?: Record<string, any>
) {
    const timestamp = new Date().toISOString();
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[${timestamp}] Error in ${context}`);
    console.error('Error:', error);
    if (additionalInfo) {
        console.error('Additional Info:', additionalInfo);
    }
    if (error.stack) {
        console.error('Stack Trace:', error.stack);
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
