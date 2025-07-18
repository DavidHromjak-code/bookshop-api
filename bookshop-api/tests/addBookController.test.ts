import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { addBookRoute } from '../src/routes/addBook';

const app = express();
app.use(bodyParser.json());
addBookRoute(app);

describe('addBookController - input validation', () => {
    it('should return 400 for missing ISBN', async () => {
        const res = await request(app).post('/api/book').send({ condition: 'new' });
        expect(res.status).toBe(400);
        expect(res).toHaveProperty('error');
    });

    it('should return 400 for invalid condition', async () => {
        const res = await request(app)
            .post('/api/book')
            .send({ isbn: '9780140328721', condition: 'bad' });
        expect(res.status).toBe(400);
        expect(res).toHaveProperty('error');
    });

    it('should return 400 for too short ISBN', async () => {
        const res = await request(app)
            .post('/api/book')
            .send({ isbn: '123', condition: 'new' });
        expect(res.status).toBe(400);
        expect(res).toHaveProperty('error');
    });

    it('should return 202 or 200 for valid input (depending on external logic)', async () => {
        const res = await request(app)
            .post('/api/book')
            .send({ isbn: '9780140328721', condition: 'new' });
        expect([200, 202]).toContain(res.status);
        expect(res.body).toHaveProperty('isbn13');
    });
});