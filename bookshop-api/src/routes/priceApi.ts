import { Express, Request, Response } from 'express';

/**
 * A cache to store prices for ISBNs.
 * @type {Map<string, number>}
 */
const priceCache = new Map<string, number>();

/**
 * The maximum hash value used for price calculation.
 * @type {number}
 */
const maxHash = 741;

/**
 * Registers the `/api/price` endpoint to the provided Express application.
 *
 * The endpoint calculates and returns a price for a given ISBN based on a hash function.
 * If the ISBN is invalid or missing, it returns a 400 error.
 * If the price cannot be determined, it returns a 404 error.
 *
 * @param {Express} app - The Express application instance.
 */
export function priceApi(app: Express) {
  /**
   * GET /api/price
   *
   * Handles requests to fetch the price for a given ISBN.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  app.get('/api/price', (req: Request, res: Response) => {
    const { isbn } = req.query;

    // Validate the ISBN query parameter
    if (!isbn || typeof isbn !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid ISBN' });
    }

    // Calculate a hash value based on the ISBN string
    const hash = [...isbn].reduce((acc, c) => acc + c.charCodeAt(0), 0);

    // Determine whether a price should be returned based on the hash
    const shouldReturnPrice = (hash % 100) < 50;

    // If the price cannot be determined, return a 404 error
    if (!shouldReturnPrice) {
      return res.status(404).json({ error: "Price not found" });
    }

    // If the price is not cached, calculate and store it
    if (!priceCache.has(isbn)) {
      const price = Math.round((hash / maxHash) * (5000 - 10) + 10);
      priceCache.set(isbn, price);
    }

    // Return the cached price
    return res.json({ price: priceCache.get(isbn) });
  });
}