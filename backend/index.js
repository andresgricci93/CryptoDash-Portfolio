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
import newsRoutes from './routes/news.route.js';
import { fetchAndCacheCryptos } from './controllers/cryptos.controller.js';
import {
    createDailyEditionIfMissing,
    DAILY_EDITION_TIME_ZONE
} from './services/dailyEdition.service.js';

dotenv.config();

// Safety net: SDK internals (e.g. Gemini streaming) can reject promises we
// never get a handle on; without this, one bad stream restarts the instance.
process.on('unhandledRejection', (reason) => {
    console.error('[process] Unhandled rejection (kept alive):', reason?.message || reason);
});

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
app.use('/api', newsRoutes);


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

        // ============================================================
        // CRON JOBS
        // ============================================================

        // Update crypto prices every 2 hours
        cron.schedule('0 */2 * * *', async () => {
            console.log('Cron: Updating crypto prices...');
            try {
                await fetchAndCacheCryptos();
            } catch (error) {
                console.error('Cron error (prices):', error.message);
            }
        });
        console.log(' Cron: Crypto prices (every 2 hours)');

        // Compile and persist the daily news edition at 1:00 AM in Italy
        cron.schedule('0 1 * * *', async () => {
            console.log('Cron: Compiling daily news edition...');
            try {
                const { created, edition } = await createDailyEditionIfMissing();
                console.log(
                    `Cron: Daily edition ${edition.editionDate} ${created ? 'created' : 'already exists'}`
                );
            } catch (error) {
                console.error('Cron error (daily news edition):', error.message);
            }
        }, {
            timezone: DAILY_EDITION_TIME_ZONE
        });
        console.log(` Cron: Daily news edition (1:00 AM ${DAILY_EDITION_TIME_ZONE})`);

    } catch (error) {
        console.error('Service initialization error:', error.message);
    }
})();