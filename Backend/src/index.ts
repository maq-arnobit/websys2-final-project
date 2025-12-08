import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 4200;

app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;