// utils/appError.js

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Capture the stack trace and exclude this constructor
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
