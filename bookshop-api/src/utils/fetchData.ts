import fetch from 'node-fetch';

/**
 * Volá interní mock cenového API na základě ISBN.
 * @param isbn13 - ISBN ve formátu ISBN-13
 * @returns cena knihy v CZK
 * @throws ApiError.priceNotFound pokud není cena dostupná
 */
export async function fetchPrice(isbn13: string): Promise<number | null> {
    const res = await fetch(`http://localhost:3000/api/price?isbn=${isbn13}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.price;
}

/**
 * Získá název knihy z Open Library API.
 * @param isbn13 - ISBN ve formátu ISBN-13
 * @returns název knihy, nebo null pokud nenalezen
 */
export async function fetchTitle(isbn13: string): Promise<string | null> {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn13}.json`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.title ?? null;
}
