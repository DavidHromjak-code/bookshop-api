import express from 'express';
import { priceApi } from './routes/priceApi';
import { addBookRoute } from './routes/addBook';

const app = express();
app.use(express.json());

priceApi(app);
addBookRoute(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

export default app;
