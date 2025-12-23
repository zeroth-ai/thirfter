"""
BLR Thrifter AI Services
FastAPI application exposing AI-powered features:
- Semantic search with Pinecone/FAISS
- Image-based search with CLIP
- RAG-powered Q&A
- Personalized recommendations
- Web scraper for new stores
"""

import os
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
from loguru import logger
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Services
from services.search import SemanticSearchService
from services.image_search import ImageSearchService
from services.rag import RAGService
from services.explore import ExploreService
from services.scraper import ThriftStoreScraper

# ==================== App Setup ====================

app = FastAPI(
    title="BLR Thrifter AI Services",
    description="AI-powered backend for thrift store discovery",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Services ====================

# Initialize services
search_service = SemanticSearchService()
image_service = ImageSearchService()
rag_service = RAGService()
explore_service = ExploreService()
scraper = ThriftStoreScraper()

# ==================== Pydantic Models ====================

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    filters: Optional[Dict] = None
    limit: int = Field(default=20, ge=1, le=100)
    use_semantic: bool = True
    use_keyword: bool = True


class RAGRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)
    user_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=10)


class ExploreRequest(BaseModel):
    user_id: Optional[str] = None
    location: Optional[str] = None


class ShopData(BaseModel):
    """Shop data for indexing"""
    _id: Optional[str] = None
    name: str
    tag: str
    desc: str
    location: Dict
    mapLink: str
    specialties: List[str] = []
    rating: Optional[float] = None
    reviewCount: Optional[int] = None


class IndexRequest(BaseModel):
    shops: List[Dict]


class ScraperConfig(BaseModel):
    sources: List[str] = Field(
        default=["google_maps", "justdial"],
        description="Sources to scrape from"
    )
    areas: Optional[List[str]] = Field(
        default=None,
        description="Specific areas to scrape (default: all)"
    )


# ==================== Health & Status ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "BLR Thrifter AI Services",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "search": search_service.is_ready(),
            "image_search": image_service.is_ready(),
            "rag": rag_service.is_ready(),
            "scraper": True
        },
        "search_stats": search_service.get_stats()
    }


# ==================== Search Endpoints ====================

@app.post("/search")
async def semantic_search(request: SearchRequest):
    """
    Hybrid search combining semantic and keyword matching
    
    - **query**: Search query (natural language)
    - **filters**: Optional filters (location, tags, minRating)
    - **limit**: Max results (default 20)
    - **use_semantic**: Enable semantic vector search
    - **use_keyword**: Enable keyword matching
    """
    try:
        results = await search_service.search(
            query=request.query,
            filters=request.filters,
            limit=request.limit,
            use_semantic=request.use_semantic,
            use_keyword=request.use_keyword
        )
        
        return {
            "success": True,
            "query": request.query,
            "total": len(results),
            "results": [
                {
                    "shop": r.shop,
                    "score": r.score,
                    "matchType": r.match_type,
                    "highlights": r.highlights
                }
                for r in results
            ]
        }
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search/suggestions")
async def search_suggestions(
    prefix: str = Query(..., min_length=1, max_length=100)
):
    """
    Get autocomplete suggestions for search
    
    - **prefix**: Search prefix
    """
    suggestions = search_service.get_suggestions(prefix)
    return {
        "success": True,
        "suggestions": suggestions
    }


# ==================== Image Search ====================

@app.post("/search/image")
async def image_search(
    file: UploadFile = File(...),
    limit: int = Query(default=10, ge=1, le=50)
):
    """
    Search for similar items by image
    
    - **file**: Image file (JPEG, PNG)
    - **limit**: Max results
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        image_data = await file.read()
        
        # Search
        results = await image_service.search_by_image(image_data, limit)
        
        return {
            "success": True,
            "total": len(results),
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== RAG / Q&A ====================

@app.post("/rag/query")
async def rag_query(request: RAGRequest):
    """
    Ask questions about thrift stores using RAG
    
    - **question**: Natural language question
    - **user_id**: Optional user ID for personalized answers
    - **top_k**: Number of sources to retrieve
    """
    try:
        # Get user context if authenticated
        user_context = None
        if request.user_id:
            # In production, fetch from MongoDB
            user_context = {"user_id": request.user_id}
        
        result = await rag_service.query(
            question=request.question,
            user_context=user_context,
            top_k=request.top_k
        )
        
        return {
            "success": True,
            "answer": result["answer"],
            "sources": result["sources"],
            "confidence": result["confidence"],
            "analysis": result.get("query_analysis", {})
        }
    except Exception as e:
        logger.error(f"RAG query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rag/recommendations/{user_id}")
async def get_recommendations(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50)
):
    """Get personalized recommendations for a user"""
    try:
        recommendations = await rag_service.get_recommendations(user_id, limit)
        return {
            "success": True,
            "user_id": user_id,
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Explore / Discovery ====================

@app.post("/explore")
async def get_explore_feed(request: ExploreRequest):
    """
    Get personalized explore sections
    
    Returns multiple sections:
    - For You (personalized)
    - Trending
    - By Style
    - By Location
    - New Arrivals
    """
    try:
        sections = await explore_service.get_explore_sections(
            user_id=request.user_id,
            location=request.location
        )
        
        return {
            "success": True,
            "sections": sections
        }
    except Exception as e:
        logger.error(f"Explore error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/explore/trending")
async def get_trending(
    location: Optional[str] = None,
    limit: int = Query(default=10, ge=1, le=50)
):
    """Get trending stores"""
    trending = await explore_service.get_trending(location)
    return {
        "success": True,
        "location": location,
        "trending": trending[:limit]
    }


@app.get("/explore/style/{style}")
async def get_by_style(
    style: str,
    limit: int = Query(default=10, ge=1, le=50)
):
    """Get stores matching a style"""
    stores = await explore_service.get_by_style(style, limit)
    return {
        "success": True,
        "style": style,
        "stores": stores
    }


@app.get("/explore/collaborative/{user_id}")
async def get_collaborative(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50)
):
    """Get collaborative filtering recommendations"""
    recommendations = await explore_service.get_collaborative_recommendations(user_id, limit)
    return {
        "success": True,
        "user_id": user_id,
        "recommendations": recommendations
    }


# ==================== Scraper ====================

@app.post("/scraper/start")
async def start_scraper(
    config: ScraperConfig,
    background_tasks: BackgroundTasks
):
    """
    Start the web scraper to discover new stores
    
    - **sources**: Sources to scrape (google_maps, justdial, instagram)
    - **areas**: Specific areas to scrape (optional)
    """
    if scraper.get_status()["is_running"]:
        raise HTTPException(status_code=409, detail="Scraper is already running")
    
    # Run scraper in background
    background_tasks.add_task(
        _run_scraper,
        config.sources,
        config.areas
    )
    
    return {
        "success": True,
        "message": "Scraper started",
        "sources": config.sources
    }


async def _run_scraper(sources: List[str], areas: Optional[List[str]]):
    """Background task to run scraper"""
    try:
        stores = await scraper.scrape_all(sources)
        logger.info(f"Scraper found {len(stores)} stores")
        
        # In production, save to MongoDB and reindex
        # For now, just log
        for store in stores[:5]:
            logger.info(f"Found: {store.name} in {store.location_label}")
            
    except Exception as e:
        logger.error(f"Scraper error: {e}")


@app.get("/scraper/status")
async def scraper_status():
    """Get current scraper status"""
    return {
        "success": True,
        "status": scraper.get_status()
    }


@app.post("/scraper/area/{area_id}")
async def scrape_area(area_id: str, background_tasks: BackgroundTasks):
    """Scrape a specific area"""
    if scraper.get_status()["is_running"]:
        raise HTTPException(status_code=409, detail="Scraper is already running")
    
    background_tasks.add_task(_run_area_scraper, area_id)
    
    return {
        "success": True,
        "message": f"Started scraping {area_id}"
    }


async def _run_area_scraper(area_id: str):
    """Background task to scrape specific area"""
    try:
        stores = await scraper.scrape_area(area_id)
        logger.info(f"Found {len(stores)} stores in {area_id}")
    except Exception as e:
        logger.error(f"Area scraper error: {e}")


# ==================== Data Management ====================

@app.post("/index")
async def index_shops(request: IndexRequest):
    """
    Index shop data for search
    
    - **shops**: List of shop objects
    """
    try:
        shops = request.shops
        
        # Index for search
        search_service.index_shops(shops)
        
        # Load into RAG
        rag_service.add_shop_data(shops)
        
        # Load into explore
        explore_service.add_shop_data(shops)
        
        # Load into image search
        image_service.add_shop_data(shops)
        
        return {
            "success": True,
            "indexed": len(shops),
            "stats": search_service.get_stats()
        }
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Startup ====================

@app.on_event("startup")
async def startup():
    """Initialize services on startup"""
    logger.info("Starting BLR Thrifter AI Services...")
    
    # Load initial data if available
    try:
        # In production, fetch from MongoDB
        # For now, load sample data
        sample_shops = await _load_sample_shops()
        if sample_shops:
            search_service.index_shops(sample_shops)
            rag_service.add_shop_data(sample_shops)
            explore_service.add_shop_data(sample_shops)
            image_service.add_shop_data(sample_shops)
            logger.info(f"Loaded {len(sample_shops)} sample shops")
    except Exception as e:
        logger.warning(f"Could not load sample data: {e}")
    
    logger.info("AI Services ready!")


async def _load_sample_shops() -> List[Dict]:
    """Load sample shop data"""
    # This would connect to MongoDB in production
    # For now, return sample data
    return [
        {
            "_id": "1",
            "name": "EcoDhaga",
            "tag": "Vintage & Sustainable",
            "desc": "Curated vintage pieces, sustainable fashion, upcycled clothing. Popular for unique finds.",
            "location": {"id": "koramangala", "label": "Koramangala"},
            "mapLink": "https://maps.google.com/?q=EcoDhaga+Koramangala",
            "specialties": ["vintage", "sustainable", "upcycled"],
            "rating": 4.5,
            "reviewCount": 128
        },
        {
            "_id": "2",
            "name": "Tibet Mall Surplus",
            "tag": "Budget Surplus Store",
            "desc": "Multi-floor surplus store with great deals on jackets, jeans, and winter wear.",
            "location": {"id": "central", "label": "Commercial Street"},
            "mapLink": "https://maps.google.com/?q=Tibet+Mall+Commercial+Street",
            "specialties": ["surplus", "jackets", "winter wear", "budget"],
            "rating": 4.2,
            "reviewCount": 256
        },
        {
            "_id": "3",
            "name": "Bombay Store Surplus",
            "tag": "Premium Branded Surplus",
            "desc": "Export surplus with premium international brands at 70% off MRP.",
            "location": {"id": "hsr-layout", "label": "HSR Layout"},
            "mapLink": "https://maps.google.com/?q=Bombay+Store+HSR+Layout",
            "specialties": ["premium", "branded", "export surplus"],
            "rating": 4.3,
            "reviewCount": 89
        }
    ]


# ==================== Main ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
