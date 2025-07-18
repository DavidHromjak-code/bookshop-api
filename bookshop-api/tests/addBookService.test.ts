import { addBookService } from '../src/services/addBookService';
import { getMultiplier } from '../src/utils/conditionMultiplier';
import * as fetchData from '../src/utils/fetchData';
import { AddBookRouteError } from '../src/errors/addBookRouteError';
import isbnUtils from 'isbn-utils';

jest.mock('isbn-utils', () => ({
    __esModule: true,
    default: {
        parse: jest.fn(),
    },
}));

jest.mock('../src/utils/fetchData');
jest.mock('../src/utils/conditionMultiplier', () => ({
    getMultiplier: jest.fn(() => 1),
}));

const mockParsedISBN = {
    isValid: () => true,
    asIsbn10: () => '1234567890',
    asIsbn13: () => '9781234567897',
        codes: {
            source: '978',
            prefix: '978',
            group: '978',
            groupname: 'Books',
            publisher: '123',
            article: '4567897',
            check: '7',
            check10: '0',
            check13: '7',
        },
    isIsbn10: () => true,
    isIsbn13: () => true,
};

describe('addBookService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return added when title and price are present', async () => {
        jest.mocked(isbnUtils.parse).mockReturnValue(mockParsedISBN);
        jest.mocked(fetchData.fetchPrice).mockResolvedValue(100);
        jest.mocked(fetchData.fetchTitle).mockResolvedValue('Book Title');
        jest.mocked(getMultiplier).mockReturnValue(0.8);

        const result = await addBookService({ isbn: '9781234567897', condition: 'as_new' });

        expect(result).toEqual({
            status: 'added',
            isbn10: '1234567890',
            isbn13: '9781234567897',
            condition: 'as_new',
            title: 'Book Title',
            price: 80,
        });
    });

    it('should return manual_review with reason Missing title', async () => {
        jest.mocked(isbnUtils.parse).mockReturnValue(mockParsedISBN);
        jest.mocked(fetchData.fetchPrice).mockResolvedValue(200);
        jest.mocked(fetchData.fetchTitle).mockResolvedValue(null);
        jest.mocked(getMultiplier).mockReturnValue(0.5);

        const result = await addBookService({ isbn: '9781234567897', condition: 'damaged' });

        expect(result).toEqual({
            status: 'manual_review',
            isbn10: '1234567890',
            isbn13: '9781234567897',
            condition: 'damaged',
            price: 100,
            reason: 'Missing title',
        });
    });

    it('should return manual_review with reason No price', async () => {
        jest.mocked(isbnUtils.parse).mockReturnValue(mockParsedISBN);
        jest.mocked(fetchData.fetchPrice).mockResolvedValue(null);
        jest.mocked(fetchData.fetchTitle).mockResolvedValue('Book Title');

        const result = await addBookService({ isbn: '9781234567897', condition: 'new' });

        expect(result).toEqual({
            status: 'manual_review',
            isbn10: '1234567890',
            condition: 'new',
            isbn13: '9781234567897',
            title: 'Book Title',
            reason: 'No price',
        });
    });

    it('should return manual_review with reason Missing title and price', async () => {
        jest.mocked(isbnUtils.parse).mockReturnValue(mockParsedISBN);
        jest.mocked(fetchData.fetchPrice).mockResolvedValue(null);
        jest.mocked(fetchData.fetchTitle).mockResolvedValue(null);

        const result = await addBookService({ isbn: '9781234567897', condition: 'new' });

        expect(result).toEqual({
            status: 'manual_review',
            isbn10: '1234567890',
            condition: 'new',
            isbn13: '9781234567897',
            reason: 'Missing title and price',
        });
    });

    const mockParsedISBNFalse = {
        isValid: () => false,
        asIsbn10: () => '1234567890',
        asIsbn13: () => '9781234567897',
        codes: {
            source: '978',
            prefix: '978',
            group: '978',
            groupname: 'Books',
            publisher: '123',
            article: '4567897',
            check: '7',
            check10: '0',
            check13: '7',
        },
        isIsbn10: () => true,
        isIsbn13: () => true,
    };
    it('should throw AddBookRouteError.invalidISBN when ISBN is invalid', async () => {
        jest.mocked(isbnUtils.parse).mockReturnValue(mockParsedISBNFalse);

        await expect(
            addBookService({ isbn: 'bad-isbn', condition: 'new' }),
        ).rejects.toThrow(AddBookRouteError.invalidISBN({ ISBN: 'bad-isbn' }));
    });
});
