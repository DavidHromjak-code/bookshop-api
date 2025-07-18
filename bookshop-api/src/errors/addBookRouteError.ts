const prefix = "bookshop-api/";

export class AddBookRouteError extends Error {
    statusCode: number;
    details?: unknown;

    constructor(name: string, statusCode: number, message: string, details?: unknown) {
        super(message);
        this.name = prefix + name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    static invalidInput(details?: unknown) {
        return new AddBookRouteError("invalidInput", 400, "Missing or invalid parameters", details);
    }

    static invalidISBN(details?: unknown) {
        return new AddBookRouteError("invalidISBN", 400, "Invalid ISBN format", details);
    }
}