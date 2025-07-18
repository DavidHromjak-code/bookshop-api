import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {AddBookRouteError} from "../errors/addBookRouteError";
import { addBookService } from '../services/addBookService';

const bookSchema = z.object({
    isbn: z
        .string()
        .min(10, { message: "ISBN musí mít alespoň 10 znaků" })
        .max(17, { message: "ISBN nesmí být delší než 17 znaků" }),
    condition: z.enum(['new', 'as_new', 'damaged'], {
        errorMap: () => ({ message: "Stav knihy musí být 'new', 'as_new' nebo 'damaged'" }),
    }),
});


export async function addBookController(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = bookSchema.safeParse(req.body);
        if (!parsed.success) {
            throw AddBookRouteError.invalidInput(parsed.error.format());
        }

        const book = await addBookService(parsed.data);
        res.status(book.status === 'added' ? 200 : 202).json(book);

    } catch (err) {
        next(err);
    }
}