# CryptoDash Portfolio Project



A comprehensive cryptocurrency management dashboard with AI-powered insights, real-time price tracking, and personalized analysis powered with AI and RAG.


[![Live Demo](https://img.shields.io/badge/Live_Demo-crypto--dash.xyz-2ea44f?style=for-the-badge)](https://crypto-dash.xyz)

 ⚠️ Registrations limited due to API call restrictions (free tier).

# CryptoDash Architecture 
![Animazione](https://github.com/user-attachments/assets/d19a86e7-b4ca-4384-abaf-623b970d8798)


## ✨ Features

### 📊 Real-time Crypto Tracking
- Monitor 160+ cryptocurrencies with live price updates
- Interactive price charts with historical data visualization
- Multi-currency support (USD, EUR, GBP, and more)
- Sort and filter by price, market cap, and more

<img width="1974" height="945" alt="image" src="https://github.com/user-attachments/assets/0b7cc79c-63c4-41b3-a699-dd66bda273fb" />

<img width="1971" height="945" alt="image" src="https://github.com/user-attachments/assets/62bfd353-a960-4069-bb59-b02842cfc02a" />



### 🤖 Advanced AI Assistant
- Real-time Price Queries: Ask for current crypto prices instantly
- Latest News Integration: Get up-to-date cryptocurrency news
- Semantic Memory: AI remembers your notes using RAG (Retrieval-Augmented Generation)
- Short & Long-term Memory: Conversations are remembered for context-aware responses (work in progress)
- Time-Aware: AI knows the current date and time (no hallucinations)
- Investment Planning: Study trends and plan your next moves with precision

<img width="1880" height="947" alt="image" src="https://github.com/user-attachments/assets/cb135152-075a-4850-b5c3-a72abec8a8cf" />


### 📝 Smart Notes System
- Create detailed notes for any cryptocurrency
- AI-Powered Summaries: Generate automatic summaries of your notes
- Export to PDF/Word: Download your notes in multiple formats
- Rich text editor with formatting toolbar
- Link notes to multiple cryptocurrencies via Drag & Drop
- Tag system with color coding


<img width="1379" height="878" alt="image" src="https://github.com/user-attachments/assets/6a816825-15f9-490c-aeb8-b98fcb1891a4" />



### ⭐️ Favorites Management
- Save and track your favorite coins
- AI-Generated Pros & Cons: Analyze advantages and disadvantages of your favorites
- Facts & Curiosities: Discover interesting facts about your selected cryptos
- Personalized AI Reports: Get portfolio insights based on your investment profile


<img width="1133" height="937" alt="image" src="https://github.com/user-attachments/assets/dd774345-626f-4556-b28b-b7f4c41f80ee" />

<img width="1134" height="825" alt="image" src="https://github.com/user-attachments/assets/ddc81dd2-2999-43f6-9b55-0d989a172d12" />


### 💎 Detailed Coin Information
- Comprehensive coin detail pages
- Blockchain Information: Access technical details about each blockchain
- Whitepaper Access: Read official whitepapers directly
- Historical price charts and market statistics
- Real-time market data and rankings


<img width="1965" height="934" alt="image" src="https://github.com/user-attachments/assets/9a17a0b3-2578-42b5-8875-af68d8470c26" />


### 🔐 Advanced Security Features
- Have I Been Pwned Integration: Check if your password has been compromised
- Smart Security Check: Real-time password vulnerability detection
- Secure Password Changes: Enhanced security during password updates
- JWT-based authentication with secure cookies
- Email verification system


<img width="1975" height="940" alt="image" src="https://github.com/user-attachments/assets/a22ed16c-3dab-4298-b6ae-fc82582c3fe3" />



### 📄 Document Generation
- Export notes to PDF with professional formatting
- Export notes to Word documents
- AI-powered note summaries before export


<img width="1283" height="876" alt="image" src="https://github.com/user-attachments/assets/99a09fdc-a7fd-46d4-98fe-6b2d4914dbc0" />




### 🎨 Modern User Experience
- Beautiful, responsive UI built with React and Tailwind CSS
- Smooth animations with Framer Motion
- Dark mode interface optimized for extended use
- Fast and efficient data caching with TanStack Query

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher installed ([Download here](https://nodejs.org/))
- **MongoDB** account (free tier works) - [Sign up at MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API** key - [Get it here](https://ai.google.dev/)
- **Mailtrap** account for email testing - [Sign up here](https://mailtrap.io/)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CryptoDashboard-Portfolio
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file from example
cp .env.example .env
```

Now edit the `.env` file with your actual credentials:

```bash
# Required Configuration
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/crypto_dashboard
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_here
MAILTRAP_TOKEN=your_mailtrap_token
MAILTRAP_ENDPOINT=https://send.api.mailtrap.io/

# Optional Configuration
PORT=5000
NODE_ENV=development
CHROMA_MODE=local
LOG_LEVEL=info
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create environment file from example
cp .env.example .env
```

Edit `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Running the Application

You'll need **two terminal windows** open:

### Terminal 1 - Backend Server

```bash
# From project root
npm run dev
```

The backend will start on `http://localhost:5000`

### Terminal 2 - Frontend Server

```bash
# From project root
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 🔑 Getting Your API Keys

### MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string
5. Replace `<password>` with your database user password
6. Paste into `MONGO_URI` in `.env`

### Google Gemini API (AI Features)

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy and paste into `GEMINI_API_KEY` in `.env`

### Mailtrap (Email Service)

1. Sign up at [Mailtrap.io](https://mailtrap.io/)
2. Go to "Email Sending" → "Sending Domains"
3. Get your API Token from the integration settings
4. Copy `Token` to `MAILTRAP_TOKEN`
5. Copy `Endpoint` to `MAILTRAP_ENDPOINT`

---

## 📦 ChromaDB Configuration

CryptoDash uses ChromaDB for AI-powered note search, semantic memory and more. Two modes are available:


### Server Mode (Self-hosted)

If you have your own ChromaDB server:

```bash
CHROMA_MODE=server
CHROMA_URL=http://localhost:8000
```

### Cloud Mode (ChromaDB Cloud)

If you use ChromaDB Cloud:

```bash
CHROMA_MODE=cloud
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=your_database_name
CHROMA_API_KEY=your_chroma_api_key
```

---

## 🏗️ Project Structure

```
CryptoDashboard-Portfolio/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── db/             # Database connection
│   ├── middleware/     # Express middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # API calls
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Zustand stores
│   │   ├── utils/      # Utility functions
│   │   └── App.jsx     # Main app component
│   ├── package.json
    └── .env.example  # Frontend environment template
├── .env.example      # Backend environment template
└── README.md
```

---

## 🎯 Available Scripts

### Backend

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Frontend

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🔧 Troubleshooting

### Port Already in Use

If port 5000 or 5173 is already in use:

- **Backend**: Change `PORT` in `.env`
- **Frontend**: Vite will automatically suggest the next available port

### MongoDB Connection Error

Make sure:
- Your IP is whitelisted in MongoDB Atlas (Network Access)
- Your connection string has the correct password
- There are no special characters in password (or they're URL encoded)

### Frontend Can't Connect to Backend

- Verify backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env` is correct
- Restart the frontend server after changing `.env`

---

## 🚢 Deployment

### Environment Variables for Production

Update these in your `.env` for production:

```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommended Platforms

- **Frontend**: Vercel, Netlify, Render
- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas (already cloud-based)

---

## 🙏 Acknowledgments

- [CoinGecko API](https://www.coingecko.com/) for cryptocurrency data
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [ChromaDB](https://www.trychroma.com/) for vector database
- [MongoDB](https://www.mongodb.com/) for data storage
- [Mailtrap](https://mailtrap.io/) for email testing

---

**Happy Trading! 📈🚀**
