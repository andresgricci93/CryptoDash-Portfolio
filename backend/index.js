import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from './db/connectDB.js';
import cryptosRoutes from './routes/cryptos.route.js';
import authRoutes from "./routes/auth.route.js";
import favoritesRoutes from './routes/favorites.route.js';
import notesRoutes from "./routes/notes.route.js";
import currenciesRoutes from './routes/currencies.route.js';
import profileRoutes from './routes/profile.route.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin:["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true}))

app.use(express.json());  // allow us to parse incoming requests :req.body
app.use(cookieParser());  // allow us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use('/api', cryptosRoutes); 
app.use('/api', favoritesRoutes);
app.use('/api', notesRoutes )
app.use('/api', currenciesRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT,'127.0.0.1' , () => {
    connectDB();
    console.log("Server is running on port:", PORT);
})

