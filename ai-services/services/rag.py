"""
Production RAG (Retrieval Augmented Generation) Service
Provides intelligent Q&A and recommendations about thrift stores
"""

import os
import re
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from loguru import logger
import numpy as np

# MongoDB for user data
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False


@dataclass
class RetrievalResult:
    """Result from vector retrieval"""
    shop: Dict
    score: float
    match_reason: str


class RAGService:
    """
    RAG-powered Q&A and recommendations for thrift stores
    
    Features:
    - Semantic search across store data
    - Context-aware question answering
    - Personalized recommendations based on user preferences
    - Collaborative filtering
    """
    
    def __init__(self):
        self.llm_client = None
        self.embedding_model = None
        self.shop_data: List[Dict] = []
        self.shop_embeddings: Dict[str, np.ndarray] = {}
        self.user_embeddings: Dict[str, np.ndarray] = {}
        self.db = None
        self._ready = False
        self._initialize()
    
    def _initialize(self):
        """Initialize RAG components"""
        try:
            # Initialize OpenAI
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                from openai import OpenAI
                self.llm_client = OpenAI(api_key=api_key)
            
            # Initialize embedding model
            try:
                from sentence_transformers import SentenceTransformer
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            except ImportError:
                logger.warning("sentence-transformers not available")
            
            # Initialize MongoDB connection
            if MOTOR_AVAILABLE:
                mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
                client = AsyncIOMotorClient(mongo_uri)
                self.db = client.blr_thrifter
            
            self._ready = True
            logger.info("RAG service initialized")
            
        except Exception as e:
            logger.error(f"RAG initialization failed: {e}")
            self._ready = False
    
    def is_ready(self) -> bool:
        return self._ready
    
    # ==================== Main Query Interface ====================
    
    async def query(
        self,
        question: str,
        user_context: Optional[Dict] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Answer questions about thrift stores using RAG
        
        Args:
            question: User's question
            user_context: User preferences and history
            top_k: Number of relevant stores to retrieve
        
        Returns:
            Dict with answer, sources, and confidence
        """
        try:
            # Step 1: Understand the query
            query_analysis = self._analyze_query(question)
            
            # Step 2: Retrieve relevant stores
            relevant_stores = await self._retrieve_stores(
                question,
                query_analysis,
                user_context,
                top_k
            )
            
            # Step 3: Build context
            context = self._build_context(relevant_stores, user_context)
            
            # Step 4: Generate answer
            if self.llm_client:
                answer = await self._generate_answer_llm(question, context, query_analysis)
            else:
                answer = self._generate_answer_template(question, relevant_stores, query_analysis)
            
            # Step 5: Calculate confidence
            confidence = self._calculate_confidence(relevant_stores, query_analysis)
            
            return {
                "answer": answer,
                "sources": [r.shop for r in relevant_stores],
                "confidence": confidence,
                "query_analysis": query_analysis
            }
            
        except Exception as e:
            logger.error(f"RAG query error: {e}")
            return self._fallback_response(question)
    
    # ==================== Query Analysis ====================
    
    def _analyze_query(self, question: str) -> Dict[str, Any]:
        """Analyze query to understand intent and extract entities"""
        question_lower = question.lower()
        
        analysis = {
            "intent": self._detect_intent(question_lower),
            "locations": self._extract_locations(question_lower),
            "styles": self._extract_styles(question_lower),
            "price_intent": self._extract_price_intent(question_lower),
            "item_types": self._extract_item_types(question_lower),
        }
        
        return analysis
    
    def _detect_intent(self, question: str) -> str:
        """Detect the user's intent"""
        if any(w in question for w in ["where", "find", "looking for", "get"]):
            return "find_store"
        elif any(w in question for w in ["best", "top", "recommend", "suggest"]):
            return "recommendation"
        elif any(w in question for w in ["cheap", "budget", "affordable", "under"]):
            return "budget_find"
        elif any(w in question for w in ["compare", "vs", "versus", "or"]):
            return "comparison"
        elif any(w in question for w in ["what", "which", "how"]):
            return "information"
        else:
            return "general"
    
    def _extract_locations(self, question: str) -> List[str]:
        """Extract location mentions from query"""
        locations = []
        
        location_map = {
            "hsr": "hsr-layout",
            "koramangala": "koramangala",
            "jayanagar": "jayanagar",
            "jp nagar": "jpnagar",
            "jpnagar": "jpnagar",
            "indiranagar": "indiranagar",
            "commercial": "central",
            "brigade": "central",
            "whitefield": "whitefield",
            "marathahalli": "whitefield",
            "malleshwaram": "malleshwaram",
            "btm": "btm",
        }
        
        for keyword, loc_id in location_map.items():
            if keyword in question:
                locations.append(loc_id)
        
        return locations
    
    def _extract_styles(self, question: str) -> List[str]:
        """Extract style preferences from query"""
        styles = []
        
        style_keywords = {
            "vintage": "vintage",
            "y2k": "y2k",
            "grunge": "grunge",
            "streetwear": "streetwear",
            "minimalist": "minimalist",
            "korean": "korean",
            "aesthetic": "aesthetic",
            "cottagecore": "cottagecore",
            "old money": "old-money",
        }
        
        for keyword, style in style_keywords.items():
            if keyword in question:
                styles.append(style)
        
        return styles
    
    def _extract_price_intent(self, question: str) -> Optional[Dict]:
        """Extract price-related intent"""
        # Match patterns like "under 500", "below 1000", "cheap"
        patterns = [
            (r"under\s*₹?\s*(\d+)", lambda m: {"max": int(m.group(1))}),
            (r"below\s*₹?\s*(\d+)", lambda m: {"max": int(m.group(1))}),
            (r"less\s*than\s*₹?\s*(\d+)", lambda m: {"max": int(m.group(1))}),
            (r"(\d+)\s*-\s*(\d+)", lambda m: {"min": int(m.group(1)), "max": int(m.group(2))}),
        ]
        
        for pattern, extractor in patterns:
            match = re.search(pattern, question)
            if match:
                return extractor(match)
        
        if any(w in question for w in ["cheap", "budget", "affordable"]):
            return {"max": 500}
        
        return None
    
    def _extract_item_types(self, question: str) -> List[str]:
        """Extract item types from query"""
        items = []
        
        item_keywords = [
            "jacket", "jackets",
            "jeans", "denim",
            "shirt", "shirts",
            "tshirt", "t-shirt", "tees",
            "hoodie", "hoodies",
            "cargo", "cargos",
            "dress", "dresses",
            "shoes", "sneakers",
            "kurta", "ethnic",
        ]
        
        for keyword in item_keywords:
            if keyword in question:
                items.append(keyword)
        
        return items
    
    # ==================== Retrieval ====================
    
    async def _retrieve_stores(
        self,
        question: str,
        analysis: Dict,
        user_context: Optional[Dict],
        top_k: int
    ) -> List[RetrievalResult]:
        """Retrieve relevant stores using hybrid search"""
        
        results = []
        
        # Method 1: Keyword-based retrieval
        keyword_results = self._keyword_retrieval(analysis)
        
        # Method 2: Semantic retrieval (if embedding model available)
        if self.embedding_model:
            semantic_results = self._semantic_retrieval(question, top_k * 2)
        else:
            semantic_results = []
        
        # Method 3: User-based retrieval (if user context provided)
        if user_context:
            user_results = self._user_based_retrieval(user_context)
        else:
            user_results = []
        
        # Combine and rank results
        combined = self._combine_results(
            keyword_results,
            semantic_results,
            user_results,
            analysis
        )
        
        return combined[:top_k]
    
    def _keyword_retrieval(self, analysis: Dict) -> List[RetrievalResult]:
        """Retrieve stores based on keyword matching"""
        results = []
        
        for shop in self.shop_data:
            score = 0
            reasons = []
            
            # Location match (high weight)
            if analysis["locations"]:
                if shop.get("location", {}).get("id") in analysis["locations"]:
                    score += 5
                    reasons.append(f"in {shop['location']['label']}")
            
            # Tag/style match
            shop_tag = shop.get("tag", "").lower()
            shop_desc = shop.get("desc", "").lower()
            
            for style in analysis["styles"]:
                if style in shop_tag or style in shop_desc:
                    score += 3
                    reasons.append(f"matches {style} style")
            
            # Item type match
            for item in analysis["item_types"]:
                if item in shop_desc:
                    score += 2
                    reasons.append(f"has {item}")
            
            # Price intent match
            if analysis["price_intent"]:
                budget_tags = ["budget", "cheap", "wholesale", "surplus"]
                if any(tag in shop_tag for tag in budget_tags):
                    score += 2
                    reasons.append("budget-friendly")
            
            if score > 0:
                results.append(RetrievalResult(
                    shop=shop,
                    score=score,
                    match_reason=", ".join(reasons) if reasons else "relevant"
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results
    
    def _semantic_retrieval(self, question: str, top_k: int) -> List[RetrievalResult]:
        """Retrieve stores using semantic similarity"""
        if not self.embedding_model or not self.shop_embeddings:
            return []
        
        # Encode question
        query_embedding = self.embedding_model.encode([question], normalize_embeddings=True)[0]
        
        results = []
        for shop_id, embedding in self.shop_embeddings.items():
            similarity = np.dot(query_embedding, embedding)
            
            shop = next((s for s in self.shop_data if s.get("_id") == shop_id), None)
            if shop:
                results.append(RetrievalResult(
                    shop=shop,
                    score=float(similarity),
                    match_reason="semantically similar"
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _user_based_retrieval(self, user_context: Dict) -> List[RetrievalResult]:
        """Retrieve stores based on user preferences"""
        results = []
        preferences = user_context.get("preferences", {})
        
        for shop in self.shop_data:
            score = 0
            
            # Match preferred locations
            if preferences.get("favoriteLocations"):
                if shop.get("location", {}).get("id") in preferences["favoriteLocations"]:
                    score += 3
            
            # Match preferred styles
            if preferences.get("style"):
                shop_tag = shop.get("tag", "").lower()
                for style in preferences["style"]:
                    if style in shop_tag:
                        score += 2
            
            if score > 0:
                results.append(RetrievalResult(
                    shop=shop,
                    score=score,
                    match_reason="matches your preferences"
                ))
        
        return results
    
    def _combine_results(
        self,
        keyword_results: List[RetrievalResult],
        semantic_results: List[RetrievalResult],
        user_results: List[RetrievalResult],
        analysis: Dict
    ) -> List[RetrievalResult]:
        """Combine and deduplicate results from multiple retrieval methods"""
        shop_scores = {}
        
        # Weight different retrieval methods
        for result in keyword_results:
            shop_id = result.shop.get("_id") or result.shop.get("name")
            if shop_id not in shop_scores:
                shop_scores[shop_id] = {
                    "shop": result.shop,
                    "score": 0,
                    "reasons": []
                }
            shop_scores[shop_id]["score"] += result.score * 1.5  # Keyword weight
            shop_scores[shop_id]["reasons"].append(result.match_reason)
        
        for result in semantic_results:
            shop_id = result.shop.get("_id") or result.shop.get("name")
            if shop_id not in shop_scores:
                shop_scores[shop_id] = {
                    "shop": result.shop,
                    "score": 0,
                    "reasons": []
                }
            shop_scores[shop_id]["score"] += result.score * 10  # Semantic weight
        
        for result in user_results:
            shop_id = result.shop.get("_id") or result.shop.get("name")
            if shop_id not in shop_scores:
                shop_scores[shop_id] = {
                    "shop": result.shop,
                    "score": 0,
                    "reasons": []
                }
            shop_scores[shop_id]["score"] += result.score * 1.2  # User pref weight
            shop_scores[shop_id]["reasons"].append(result.match_reason)
        
        # Convert to results list
        combined = [
            RetrievalResult(
                shop=data["shop"],
                score=data["score"],
                match_reason=", ".join(set(data["reasons"])) if data["reasons"] else "relevant"
            )
            for data in shop_scores.values()
        ]
        
        combined.sort(key=lambda x: x.score, reverse=True)
        return combined
    
    # ==================== Answer Generation ====================
    
    def _build_context(
        self,
        results: List[RetrievalResult],
        user_context: Optional[Dict]
    ) -> str:
        """Build context for LLM"""
        context_parts = []
        
        context_parts.append("Relevant thrift stores in Bangalore:\n")
        
        for i, result in enumerate(results[:5], 1):
            shop = result.shop
            context_parts.append(
                f"{i}. **{shop.get('name')}** ({shop.get('tag')}) - {shop.get('location', {}).get('label', 'Bangalore')}\n"
                f"   {shop.get('desc', 'No description')}\n"
                f"   Match: {result.match_reason}\n"
            )
            
            if shop.get("rating"):
                context_parts.append(f"   Rating: {shop['rating']}/5\n")
        
        if user_context and user_context.get("preferences"):
            prefs = user_context["preferences"]
            context_parts.append(f"\nUser style preferences: {prefs.get('style', [])}")
            context_parts.append(f"Preferred locations: {prefs.get('favoriteLocations', [])}")
        
        return "\n".join(context_parts)
    
    async def _generate_answer_llm(
        self,
        question: str,
        context: str,
        analysis: Dict
    ) -> str:
        """Generate answer using LLM"""
        try:
            system_prompt = """You are a friendly and knowledgeable assistant for BLR Thrifter, a platform for discovering thrift stores in Bangalore.

Your role is to help users find the perfect thrift stores based on their needs. Be:
- Concise but informative
- Specific - mention store names and locations
- Helpful - give practical tips
- Honest - if you're not sure, say so

When recommending stores:
- Explain WHY each store is a good match
- Mention price ranges when relevant
- Give location tips if helpful"""

            user_prompt = f"""Context about available stores:
{context}

User's question: {question}

Please provide a helpful answer based on the context. If the stores in context don't match well, say so and give general advice."""

            response = self.llm_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return self._generate_answer_template(question, [], analysis)
    
    def _generate_answer_template(
        self,
        question: str,
        results: List[RetrievalResult],
        analysis: Dict
    ) -> str:
        """Generate answer using templates (fallback)"""
        if not results:
            return self._get_fallback_answer(analysis)
        
        intent = analysis.get("intent", "general")
        
        if intent == "find_store":
            stores = [r.shop.get("name") for r in results[:3]]
            location = results[0].shop.get("location", {}).get("label", "Bangalore")
            return f"For what you're looking for, I'd recommend checking out: {', '.join(stores)}. They're located in {location} and should have what you need!"
        
        elif intent == "budget_find":
            budget_stores = [r.shop.get("name") for r in results[:3]]
            return f"For budget-friendly options, try: {', '.join(budget_stores)}. These stores are known for affordable prices - expect to find good deals under ₹500!"
        
        elif intent == "recommendation":
            top_store = results[0].shop
            return f"Based on your query, I'd highly recommend **{top_store.get('name')}** in {top_store.get('location', {}).get('label')}. {top_store.get('desc', '')} They're particularly good for {results[0].match_reason}."
        
        else:
            stores = [f"{r.shop.get('name')} ({r.shop.get('location', {}).get('label')})" for r in results[:3]]
            return f"Here are some stores that might help: {'; '.join(stores)}. Would you like more specific recommendations?"
    
    def _get_fallback_answer(self, analysis: Dict) -> str:
        """Get fallback answer when no matches found"""
        if analysis.get("locations"):
            loc = analysis["locations"][0]
            return f"I couldn't find exact matches in {loc}, but I'd suggest exploring HSR Layout or Koramangala - they have the highest concentration of thrift stores in Bangalore!"
        
        if analysis.get("styles"):
            style = analysis["styles"][0]
            return f"For {style} style, check out EcoDhaga in Koramangala or Tibet Mall for imported pieces. Commercial Street also has hidden gems if you're willing to dig!"
        
        return "I'd recommend starting with HSR Layout or Commercial Street - they have the best variety of thrift and surplus stores in Bangalore. Use our search feature to filter by what you're looking for!"
    
    def _calculate_confidence(
        self,
        results: List[RetrievalResult],
        analysis: Dict
    ) -> float:
        """Calculate confidence score"""
        if not results:
            return 0.3
        
        # Base confidence from result quality
        top_score = results[0].score if results else 0
        base_confidence = min(0.5, top_score / 20)
        
        # Boost for specific queries
        specificity_boost = 0
        if analysis.get("locations"):
            specificity_boost += 0.15
        if analysis.get("styles"):
            specificity_boost += 0.1
        if analysis.get("item_types"):
            specificity_boost += 0.1
        
        # Rating boost
        avg_rating = sum(r.shop.get("rating", 0) or 0 for r in results[:3]) / 3
        rating_boost = avg_rating * 0.05
        
        return min(0.95, base_confidence + specificity_boost + rating_boost + 0.3)
    
    def _fallback_response(self, question: str) -> Dict[str, Any]:
        """Return fallback response when RAG fails"""
        return {
            "answer": "I'm having trouble processing your request. Try searching for specific items or locations, or browse our Explore page for curated recommendations!",
            "sources": [],
            "confidence": 0.3,
            "query_analysis": {}
        }
    
    # ==================== Recommendations ====================
    
    async def get_recommendations(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """Get personalized recommendations for a user"""
        
        # Try to get user data from MongoDB
        user = None
        if self.db:
            try:
                user = await self.db.users.find_one({"_id": user_id})
            except:
                pass
        
        if user and user.get("preferences"):
            return await self._personalized_recommendations(user, limit)
        else:
            return await self._popular_recommendations(limit)
    
    async def _personalized_recommendations(
        self,
        user: Dict,
        limit: int
    ) -> List[Dict]:
        """Generate personalized recommendations"""
        preferences = user.get("preferences", {})
        recommendations = []
        
        for shop in self.shop_data:
            score = 0
            reasons = []
            
            # Location preference
            if preferences.get("favoriteLocations"):
                if shop.get("location", {}).get("id") in preferences["favoriteLocations"]:
                    score += 3
                    reasons.append("in your favorite area")
            
            # Style preference
            if preferences.get("style"):
                shop_tag = shop.get("tag", "").lower()
                for style in preferences["style"]:
                    if style in shop_tag:
                        score += 2
                        reasons.append(f"matches your {style} style")
            
            # Category preference
            if preferences.get("favoriteCategories"):
                for cat in preferences["favoriteCategories"]:
                    if cat.lower() in shop.get("desc", "").lower():
                        score += 1
                        reasons.append(f"good for {cat}")
            
            # Rating boost
            if shop.get("rating"):
                score += shop["rating"] * 0.5
            
            if score > 0:
                recommendations.append({
                    "shop": shop,
                    "score": score,
                    "reason": ", ".join(reasons[:2]) if reasons else "highly rated"
                })
        
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return [r["shop"] for r in recommendations[:limit]]
    
    async def _popular_recommendations(self, limit: int) -> List[Dict]:
        """Return popular stores when no user preference"""
        return sorted(
            self.shop_data,
            key=lambda x: (x.get("rating") or 0, x.get("reviewCount") or 0),
            reverse=True
        )[:limit]
    
    # ==================== Data Management ====================
    
    def add_shop_data(self, shops: List[Dict]):
        """Add shop data and generate embeddings"""
        self.shop_data = shops
        logger.info(f"Added {len(shops)} shops to RAG service")
        
        # Generate embeddings if model available
        if self.embedding_model:
            self._generate_shop_embeddings()
    
    def _generate_shop_embeddings(self):
        """Generate embeddings for all shops"""
        for shop in self.shop_data:
            shop_id = shop.get("_id") or shop.get("name")
            
            # Create rich text for embedding
            text = f"{shop.get('name', '')} {shop.get('tag', '')} {shop.get('desc', '')} {' '.join(shop.get('specialties', []))}"
            
            embedding = self.embedding_model.encode([text], normalize_embeddings=True)[0]
            self.shop_embeddings[shop_id] = embedding
        
        logger.info(f"Generated embeddings for {len(self.shop_embeddings)} shops")
