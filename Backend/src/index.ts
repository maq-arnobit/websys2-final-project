import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/routes';

const app = express();
const PORT = Number(process.env.PORT) || 4200;

app.use(cookieParser());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5174',
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//routes
app.use('/api', routes);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0/${PORT}`);
});

export default app;
