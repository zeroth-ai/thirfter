# BLR Thrifter 🛍️

> AI-powered discovery platform for thrift stores in Bangalore

Find the best thrift stores, surplus shops, and factory outlets across Bangalore with intelligent search, personalized recommendations, and image-based discovery.

## ✨ Features

### For Users
- 🔍 **Smart Search** - Natural language search ("vintage denim jackets under ₹500")
- 📸 **Image Search** - Upload a photo to find similar items
- 🎯 **Personalized Feed** - "For You" recommendations based on your style
- 🏷️ **Style Filters** - Y2K, Grunge, Vintage, Streetwear, and more
- 📍 **Location-based** - Filter by area (HSR, Koramangala, Commercial St)
- 🔥 **Trending** - See what's popular this week
- ❤️ **Favorites** - Save stores for later
- 📝 **Style Quiz** - 10-question onboarding for better recommendations

### AI/ML Features
- **Semantic Search** - Vector embeddings with FAISS/Pinecone
- **RAG Pipeline** - Intelligent Q&A about stores
- **CLIP Image Search** - Visual similarity using OpenAI CLIP
- **Collaborative Filtering** - "Users like you also visited..."
- **Web Scraper** - Auto-discover new thrift stores

## 🏗️ Architecture

```
blr-thrifter/
├── frontend/          # Next.js 16 + React 19 + Tailwind
├── backend/           # Node.js + Express + MongoDB
├── ai-services/       # Python + FastAPI + ML models
└── docker-compose.yml # Container orchestration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.10+
- MongoDB (local or Atlas)
- Docker (optional)

### Option 1: Docker (Recommended)

```bash
# Copy environment variables
cp env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d
```

### Option 2: Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**Backend:**
```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

**AI Services:**
```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

## 🔑 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/blr-thrifter

# JWT (generate a random string)
JWT_SECRET=your-super-secret-jwt-key

# OpenAI (for RAG)
OPENAI_API_KEY=sk-...

# Google Maps (for scraper)
GOOGLE_MAPS_API_KEY=...

# Pinecone (optional, falls back to FAISS)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west-2

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📚 API Reference

### AI Services (port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/search` | POST | Semantic search |
| `/search/image` | POST | Image-based search |
| `/search/suggestions` | GET | Autocomplete |
| `/rag/query` | POST | Q&A about stores |
| `/explore` | POST | Personalized feed |
| `/explore/trending` | GET | Trending stores |
| `/scraper/start` | POST | Start web scraper |

### Backend (port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/shops` | GET | List all shops |
| `/api/favorites` | GET/POST | User favorites |
| `/api/explore` | GET | Explore feed |

## 🛠️ Development

### Project Structure

```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities & API client
│   ├── store/         # Zustand state management
│   └── types/         # TypeScript types

backend/
├── src/
│   ├── models/        # MongoDB schemas
│   ├── routes/        # Express routes
│   └── middleware/    # Auth middleware

ai-services/
├── services/
│   ├── search.py      # Semantic search
│   ├── image_search.py # CLIP-based search
│   ├── rag.py         # RAG pipeline
│   ├── explore.py     # Recommendations
│   └── scraper.py     # Web scraper
└── main.py            # FastAPI app
```

### Adding New Features

1. **New Store Data**: Add to MongoDB or `frontend/src/data/stores.ts`
2. **New AI Feature**: Add service in `ai-services/services/`
3. **New API Route**: Add in `backend/src/routes/`
4. **New UI Component**: Add in `frontend/src/components/`

## 🧠 AI Services Deep Dive

### Semantic Search
Uses sentence-transformers (`all-MiniLM-L6-v2`) to encode queries and store descriptions. Searches via cosine similarity in FAISS (local) or Pinecone (production).

### Image Search
Uses OpenAI CLIP (`clip-vit-base-patch32`) to encode images and find visually similar items.

### RAG Pipeline
1. **Query Analysis** - Extract intent, locations, styles
2. **Retrieval** - Hybrid keyword + semantic search
3. **Generation** - GPT-3.5 for natural language answers

### Web Scraper
Scrapes from:
- Google Maps (via Places API)
- Justdial listings
- Instagram hashtags (planned)

Runs as background job, deduplicates, and indexes new stores.

### Explore Recommendations
Combines:
- **Content-based**: Match user preferences to store attributes
- **Collaborative**: "Users who liked X also liked Y"
- **Location-aware**: Popular in your area
- **Trending**: Recent activity across all users

## 🐳 Docker Services

```yaml
services:
  frontend:    # Next.js on :3000
  backend:     # Express on :5000
  ai-services: # FastAPI on :8000
  mongodb:     # MongoDB on :27017
```

## 📱 Screenshots

| Home | Search | Explore |
|------|--------|---------|
| ![Home](./screenshots/home.png) | ![Search](./screenshots/search.png) | ![Explore](./screenshots/explore.png) |

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

Built with ❤️ for Bangalore's thrifting community
