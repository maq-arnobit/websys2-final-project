import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/routes';

const app = express();
const PORT = Number(process.env.PORT) || 4200;

// --- FIX 1: Trust Proxy ---
// Required for cookies to work on Render (HTTPS behind a load balancer)
app.set('trust proxy', 1);

app.use(cookieParser());

// --- FIX 2: Better CORS Config ---
app.use(cors({
  origin: [
    "http://localhost:5173",            // Vite Dev Server
    "http://localhost:5174",            // Alternative Dev Port
    process.env.APP_URL || ""           // Production Vercel URL
  ],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api', routes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0/${PORT}`);
});

export default app;
