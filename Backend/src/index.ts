import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cookieParser());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api', routes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
