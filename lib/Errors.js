class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

/**
 * Will send an error 404 to client
 */
class NotFoundError extends ExtendableError {}

/**
 * Will send an error 403 to client
 */
class ForbiddenError extends ExtendableError {}

/**
 * Will send an error 400 to client
 */
class BadRequestError extends ExtendableError {}

/**
 * Will send a custom expected to client
 */
class ExpectedError extends ExtendableError {
    constructor(code, status, message) {
        super(message);
        this.code = code;
        this.status = status;
    }
}


module.exports = {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    ExpectedError,
};
