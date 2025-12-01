import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import { connectDB } from './db/connectDB.js';
import cryptosRoutes from './routes/cryptos.route.js';
import authRoutes from "./routes/auth.route.js";
import favoritesRoutes from './routes/favorites.route.js';
import notesRoutes from "./routes/notes.route.js";
import currenciesRoutes from './routes/currencies.route.js';
import profileRoutes from './routes/profile.route.js';
import exportRoutes from './routes/pdfExport.route.js';
import aiRoutes from './routes/ai.route.js';
import chartDataRoutes from './routes/chartData.route.js';
import { fetchAndCacheCryptos } from './controllers/cryptos.controller.js';
import { incrementalChartUpdate } from './controllers/chartDB.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://cryptodashboard-portfolio-frontend.onrender.com',
      'https://crypto-dash.xyz',
      'https://www.crypto-dash.xyz'
    ].filter(Boolean) 
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api', cryptosRoutes); 
app.use('/api', favoritesRoutes);
app.use('/api', notesRoutes)
app.use('/api', currenciesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chart', chartDataRoutes);


const server = app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
});


(async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected');
        
         const { initialize: initializeChromaDB } = await import('./services/chromadb.service.js');
        await initializeChromaDB();
        console.log('✅ ChromaDB initialized');
    } catch (error) {
        console.error('Service initialization error:', error.message);

    }
})();