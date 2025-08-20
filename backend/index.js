import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectDB } from './db/connectDB.js';
import cryptosRoutes from './routes/cryptos.route.js';
import authRoutes from "./routes/auth.route.js";
import favoritesRoutes from './routes/favorites.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin: "http://localhost:5173", credentials: true}))

app.use(express.json());  // allow us to parse incoming requests :req.body
app.use(cookieParser());  // allow us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use('/api', cryptosRoutes); 
app.use('/api', favoritesRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port:", PORT);
})

