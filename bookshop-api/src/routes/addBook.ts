import { Express } from 'express';
import { addBookController } from '../controllers/addBookController';

export function addBookRoute(app: Express) {
    app.post('/api/book', addBookController);
}
