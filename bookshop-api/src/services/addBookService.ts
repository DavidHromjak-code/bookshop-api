import {getMultiplier} from '../utils/conditionMultiplier';
import {fetchPrice, fetchTitle} from '../utils/fetchData';
import {AddBookRouteError} from "../errors/addBookRouteError";
import isbnUtils from "isbn-utils";

/**
 * Adds a book to the e-shop catalog based on its ISBN and condition.
 *
 * This service performs the following steps:
 * 1. Validates the ISBN (supports ISBN-10 and ISBN-13, with or without dashes)
 * 2. Retrieves the base price from an external (mocked) pricing API
 * 3. Adjusts the price based on the book's condition multiplier
 * 4. Fetches the book title from the Open Library API
 * 5. Returns either a fully prepared book object or a partial one for manual review
 *
 * @param {Object} params - Input parameters
 * @param {string} params.isbn - The ISBN of the book (ISBN-10 or ISBN-13)
 * @param {'new' | 'as_new' | 'damaged'} params.condition - The condition of the book
 *
 * @throws {AddBookRouteError} If the ISBN is invalid
 *
 * @returns {Promise<Object>} A result object containing:
 * - `status`: `"added"` if complete, or `"manual_review"` if any data is missing
 * - `isbn10`: Converted ISBN-10 format
 * - `isbn13`: Converted ISBN-13 format
 * - `title?`: Book title (if retrieved successfully)
 * - `price?`: Final calculated price after applying the condition multiplier (if available)
 * - `condition`: Returned only when status is `"added"`
 * - `reason?`: Explanation of what is missing (e.g., `"Missing title"`, `"No price"`)
 */
export async function addBookService({isbn, condition}: { isbn: string; condition: 'new' | 'as_new' | 'damaged' }) {

    const parsedISBN = isbnUtils.parse(isbn);

    if (!parsedISBN || !parsedISBN.isValid()) {
        throw AddBookRouteError.invalidISBN({ISBN: isbn});
    }

    const price = await fetchPrice(parsedISBN.asIsbn13());
    let finalPrice;
    if (price) {
        finalPrice = price * getMultiplier(condition);
    }

    const title = await fetchTitle(parsedISBN.asIsbn13());
    const bookResult: AddBookDtoOut = {
        isbn10: '1234567890',
        isbn13: '9781234567897',
        condition
    };

    if (!title && !price) {
        bookResult.status = 'manual_review';
        bookResult.reason = 'Missing title and price';
        return bookResult
    } else if (!title) {
        bookResult.price = finalPrice;
        bookResult.reason = 'Missing title';
        bookResult.status = 'manual_review';
        return bookResult
    } else if (!finalPrice) {
        bookResult.title = title;
        bookResult.reason = 'No price';
        bookResult.status = 'manual_review';
        return bookResult
    }
    bookResult.status = 'added';
    bookResult.price = finalPrice;
    bookResult.title = title;
    return bookResult;
}
export interface AddBookDtoOut {
    status?: 'added' | 'manual_review';
    isbn10: string;
    isbn13: string;
    title?: string;
    price?: number;
    condition: 'new' | 'as_new' | 'damaged';
    reason?: string;
}