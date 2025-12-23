"""
Semantic Search Service
Powered by vector embeddings and hybrid search (keyword + semantic)
Supports both Pinecone (production) and FAISS (local/dev)
"""

import os
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from loguru import logger
import numpy as np

# Vector DB imports
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available. Install with: pip install faiss-cpu")

try:
    from pinecone import Pinecone
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    logger.warning("Pinecone not available. Install with: pip install pinecone-client")


@dataclass
class SearchResult:
    """Search result with relevance score"""
    shop: Dict
    score: float
    match_type: str  # 'semantic', 'keyword', 'hybrid'
    highlights: List[str]


class SemanticSearchService:
    """
    Hybrid search service combining:
    - Semantic search (vector similarity)
    - Keyword search (exact matching)
    - Fuzzy search (typo tolerance)
    
    Supports both FAISS (local) and Pinecone (production)
    """
    
    def __init__(self):
        self.embedding_model = None
        self.faiss_index = None
        self.pinecone_index = None
        self.shop_data: List[Dict] = []
        self.shop_id_map: Dict[int, str] = {}  # FAISS idx -> shop_id
        self.embedding_dim = 384  # Default for all-MiniLM-L6-v2
        self._use_pinecone = False
        self._ready = False
        self._initialize()
    
    def _initialize(self):
        """Initialize search components"""
        try:
            # Initialize embedding model
            try:
                from sentence_transformers import SentenceTransformer
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
                logger.info(f"Loaded embedding model (dim={self.embedding_dim})")
            except ImportError:
                logger.warning("sentence-transformers not available")
            
            # Initialize vector store
            pinecone_api_key = os.getenv("PINECONE_API_KEY")
            pinecone_env = os.getenv("PINECONE_ENVIRONMENT")
            
            if pinecone_api_key and pinecone_env and PINECONE_AVAILABLE:
                self._init_pinecone(pinecone_api_key, pinecone_env)
            elif FAISS_AVAILABLE:
                self._init_faiss()
            else:
                logger.warning("No vector store available")
            
            self._ready = True
            logger.info("Semantic search service initialized")
            
        except Exception as e:
            logger.error(f"Search initialization failed: {e}")
            self._ready = False
    
    def _init_pinecone(self, api_key: str, environment: str):
        """Initialize Pinecone vector store"""
        try:
            pc = Pinecone(api_key=api_key)
            
            index_name = "blr-thrifter-shops"
            
            # Create index if doesn't exist
            if index_name not in pc.list_indexes().names():
                pc.create_index(
                    name=index_name,
                    dimension=self.embedding_dim,
                    metric="cosine",
                    spec={
                        "serverless": {
                            "cloud": "aws",
                            "region": "us-west-2"
                        }
                    }
                )
            
            self.pinecone_index = pc.Index(index_name)
            self._use_pinecone = True
            logger.info("Pinecone initialized successfully")
            
        except Exception as e:
            logger.error(f"Pinecone initialization failed: {e}")
            self._init_faiss()  # Fallback to FAISS
    
    def _init_faiss(self):
        """Initialize FAISS vector store"""
        if not FAISS_AVAILABLE:
            return
        
        # Use cosine similarity (inner product on normalized vectors)
        self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
        self._use_pinecone = False
        logger.info("FAISS initialized successfully")
    
    def is_ready(self) -> bool:
        return self._ready and (self.faiss_index is not None or self.pinecone_index is not None)
    
    # ==================== Main Search API ====================
    
    async def search(
        self,
        query: str,
        filters: Optional[Dict] = None,
        limit: int = 20,
        use_semantic: bool = True,
        use_keyword: bool = True
    ) -> List[SearchResult]:
        """
        Hybrid search combining semantic and keyword matching
        
        Args:
            query: Search query
            filters: Optional filters (location, tag, price_range)
            limit: Max results
            use_semantic: Enable semantic search
            use_keyword: Enable keyword search
        
        Returns:
            List of SearchResult sorted by relevance
        """
        results: Dict[str, SearchResult] = {}
        
        # Preprocess query
        query_clean = self._preprocess_query(query)
        
        # 1. Semantic search
        if use_semantic and self.embedding_model and query_clean:
            semantic_results = await self._semantic_search(query_clean, limit * 2)
            for result in semantic_results:
                shop_id = result.shop.get("_id") or result.shop.get("name")
                results[shop_id] = result
        
        # 2. Keyword search
        if use_keyword and query_clean:
            keyword_results = self._keyword_search(query_clean, limit * 2)
            for result in keyword_results:
                shop_id = result.shop.get("_id") or result.shop.get("name")
                if shop_id in results:
                    # Boost score for items found in both
                    results[shop_id].score += result.score * 0.5
                    results[shop_id].match_type = "hybrid"
                    results[shop_id].highlights.extend(result.highlights)
                else:
                    results[shop_id] = result
        
        # 3. Apply filters
        if filters:
            results = self._apply_filters(results, filters)
        
        # 4. Sort and return
        sorted_results = sorted(results.values(), key=lambda x: x.score, reverse=True)
        
        return sorted_results[:limit]
    
    async def _semantic_search(
        self,
        query: str,
        limit: int
    ) -> List[SearchResult]:
        """Perform semantic vector search"""
        if not self.embedding_model:
            return []
        
        # Generate query embedding
        query_embedding = self.embedding_model.encode(
            [query],
            normalize_embeddings=True,
            show_progress_bar=False
        )[0]
        
        results = []
        
        if self._use_pinecone and self.pinecone_index:
            results = await self._search_pinecone(query_embedding, limit)
        elif self.faiss_index:
            results = self._search_faiss(query_embedding, limit)
        
        return results
    
    async def _search_pinecone(
        self,
        query_embedding: np.ndarray,
        limit: int
    ) -> List[SearchResult]:
        """Search using Pinecone"""
        try:
            response = self.pinecone_index.query(
                vector=query_embedding.tolist(),
                top_k=limit,
                include_metadata=True
            )
            
            results = []
            for match in response.get("matches", []):
                shop_id = match["id"]
                shop = next((s for s in self.shop_data if str(s.get("_id")) == shop_id), None)
                
                if shop:
                    results.append(SearchResult(
                        shop=shop,
                        score=match["score"],
                        match_type="semantic",
                        highlights=[]
                    ))
            
            return results
            
        except Exception as e:
            logger.error(f"Pinecone search error: {e}")
            return []
    
    def _search_faiss(
        self,
        query_embedding: np.ndarray,
        limit: int
    ) -> List[SearchResult]:
        """Search using FAISS"""
        if self.faiss_index.ntotal == 0:
            return []
        
        # Search
        k = min(limit, self.faiss_index.ntotal)
        scores, indices = self.faiss_index.search(
            query_embedding.reshape(1, -1).astype('float32'),
            k
        )
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            
            shop_id = self.shop_id_map.get(idx)
            if shop_id:
                shop = next((s for s in self.shop_data if str(s.get("_id")) == shop_id or s.get("name") == shop_id), None)
                
                if shop:
                    results.append(SearchResult(
                        shop=shop,
                        score=float(score),
                        match_type="semantic",
                        highlights=[]
                    ))
        
        return results
    
    def _keyword_search(
        self,
        query: str,
        limit: int
    ) -> List[SearchResult]:
        """Perform keyword-based search with fuzzy matching"""
        query_tokens = set(query.lower().split())
        
        results = []
        
        for shop in self.shop_data:
            score = 0
            highlights = []
            
            # Search in name
            name_lower = shop.get("name", "").lower()
            for token in query_tokens:
                if token in name_lower:
                    score += 3
                    highlights.append(f"name contains '{token}'")
                elif self._fuzzy_match(token, name_lower):
                    score += 1.5
            
            # Search in tag
            tag_lower = shop.get("tag", "").lower()
            for token in query_tokens:
                if token in tag_lower:
                    score += 2
                    highlights.append(f"tagged as '{token}'")
            
            # Search in description
            desc_lower = shop.get("desc", "").lower()
            for token in query_tokens:
                if token in desc_lower:
                    score += 1
                    highlights.append(f"description mentions '{token}'")
            
            # Search in categories/specialties
            specialties = shop.get("specialties", [])
            for spec in specialties:
                for token in query_tokens:
                    if token in spec.lower():
                        score += 1.5
            
            if score > 0:
                results.append(SearchResult(
                    shop=shop,
                    score=score,
                    match_type="keyword",
                    highlights=highlights[:3]
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]
    
    def _fuzzy_match(self, query: str, text: str, threshold: float = 0.8) -> bool:
        """Simple fuzzy matching using Levenshtein-like ratio"""
        if len(query) < 3:
            return False
        
        # Check if query is substring with 1-2 char difference
        for i in range(len(text) - len(query) + 3):
            substring = text[i:i+len(query)]
            matches = sum(1 for a, b in zip(query, substring) if a == b)
            if matches / len(query) >= threshold:
                return True
        
        return False
    
    def _apply_filters(
        self,
        results: Dict[str, SearchResult],
        filters: Dict
    ) -> Dict[str, SearchResult]:
        """Apply filters to search results"""
        filtered = {}
        
        for shop_id, result in results.items():
            shop = result.shop
            keep = True
            
            # Location filter
            if filters.get("location"):
                shop_location = shop.get("location", {}).get("id")
                if shop_location != filters["location"]:
                    keep = False
            
            # Tag filter
            if filters.get("tags") and keep:
                shop_tag = shop.get("tag", "").lower()
                if not any(tag.lower() in shop_tag for tag in filters["tags"]):
                    keep = False
            
            # Rating filter
            if filters.get("minRating") and keep:
                shop_rating = shop.get("rating") or 0
                if shop_rating < filters["minRating"]:
                    keep = False
            
            if keep:
                filtered[shop_id] = result
        
        return filtered
    
    # ==================== Query Processing ====================
    
    def _preprocess_query(self, query: str) -> str:
        """Preprocess search query"""
        # Normalize whitespace
        query = " ".join(query.split())
        
        # Expand common abbreviations
        expansions = {
            "blr": "bangalore",
            "hsr": "hsr layout",
            "jp": "jp nagar",
            "btm": "btm layout",
        }
        
        query_lower = query.lower()
        for abbr, full in expansions.items():
            if abbr in query_lower and full not in query_lower:
                query_lower = query_lower.replace(abbr, full)
        
        return query_lower
    
    # ==================== Autocomplete ====================
    
    def get_suggestions(self, prefix: str, limit: int = 8) -> List[Dict]:
        """Get search suggestions for autocomplete"""
        prefix_lower = prefix.lower()
        suggestions = []
        
        # Suggest matching store names
        for shop in self.shop_data:
            if shop.get("name", "").lower().startswith(prefix_lower):
                suggestions.append({
                    "type": "store",
                    "text": shop["name"],
                    "shop": shop
                })
        
        # Suggest matching locations
        locations = [
            "HSR Layout", "Koramangala", "Jayanagar", "Indiranagar",
            "Commercial Street", "Whitefield", "JP Nagar", "BTM Layout"
        ]
        for loc in locations:
            if loc.lower().startswith(prefix_lower):
                suggestions.append({
                    "type": "location",
                    "text": f"in {loc}",
                    "filter": {"location": loc.lower().replace(" ", "-")}
                })
        
        # Suggest matching tags/styles
        tags = [
            "vintage", "surplus", "thrift", "budget", "premium",
            "streetwear", "denim", "winter wear", "ethnic"
        ]
        for tag in tags:
            if tag.startswith(prefix_lower):
                suggestions.append({
                    "type": "tag",
                    "text": tag,
                    "filter": {"tags": [tag]}
                })
        
        return suggestions[:limit]
    
    # ==================== Indexing ====================
    
    def index_shops(self, shops: List[Dict]):
        """Index shops for search"""
        self.shop_data = shops
        
        if not self.embedding_model:
            logger.warning("No embedding model - only keyword search available")
            return
        
        # Generate embeddings for all shops
        texts = []
        for shop in shops:
            text = self._create_shop_text(shop)
            texts.append(text)
        
        embeddings = self.embedding_model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=True,
            batch_size=32
        )
        
        if self._use_pinecone and self.pinecone_index:
            self._index_pinecone(shops, embeddings)
        elif self.faiss_index is not None:
            self._index_faiss(shops, embeddings)
        
        logger.info(f"Indexed {len(shops)} shops for search")
    
    def _create_shop_text(self, shop: Dict) -> str:
        """Create searchable text from shop data"""
        parts = [
            shop.get("name", ""),
            shop.get("tag", ""),
            shop.get("desc", ""),
            shop.get("location", {}).get("label", ""),
            " ".join(shop.get("specialties", [])),
        ]
        return " ".join(filter(None, parts))
    
    def _index_pinecone(self, shops: List[Dict], embeddings: np.ndarray):
        """Index shops in Pinecone"""
        try:
            vectors = []
            for i, (shop, embedding) in enumerate(zip(shops, embeddings)):
                shop_id = str(shop.get("_id") or shop.get("name"))
                vectors.append({
                    "id": shop_id,
                    "values": embedding.tolist(),
                    "metadata": {
                        "name": shop.get("name"),
                        "tag": shop.get("tag"),
                        "location": shop.get("location", {}).get("id"),
                    }
                })
            
            # Upsert in batches
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i+batch_size]
                self.pinecone_index.upsert(vectors=batch)
            
            logger.info(f"Indexed {len(vectors)} shops in Pinecone")
            
        except Exception as e:
            logger.error(f"Pinecone indexing error: {e}")
    
    def _index_faiss(self, shops: List[Dict], embeddings: np.ndarray):
        """Index shops in FAISS"""
        # Reset index
        self.faiss_index.reset()
        self.shop_id_map.clear()
        
        # Add embeddings
        embeddings_float32 = embeddings.astype('float32')
        self.faiss_index.add(embeddings_float32)
        
        # Map indices to shop IDs
        for i, shop in enumerate(shops):
            shop_id = str(shop.get("_id") or shop.get("name"))
            self.shop_id_map[i] = shop_id
        
        logger.info(f"Indexed {len(shops)} shops in FAISS")
    
    # ==================== Stats ====================
    
    def get_stats(self) -> Dict:
        """Get search index statistics"""
        return {
            "backend": "pinecone" if self._use_pinecone else "faiss",
            "total_shops": len(self.shop_data),
            "indexed": self.faiss_index.ntotal if self.faiss_index else "n/a",
            "embedding_model": "all-MiniLM-L6-v2" if self.embedding_model else None,
            "embedding_dim": self.embedding_dim,
            "ready": self.is_ready()
        }
