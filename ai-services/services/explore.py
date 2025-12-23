"""
Explore Service - Personalized recommendations and discovery
Implements collaborative filtering, semantic similarity, and location-aware trending
"""

import os
from typing import List, Optional, Dict, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict
import numpy as np
from loguru import logger

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False


@dataclass
class Recommendation:
    """A personalized recommendation"""
    shop: Dict
    score: float
    reason: str
    source: str  # 'collaborative', 'content', 'trending', 'location'


class ExploreService:
    """
    Personalized explore/discovery service
    
    Implements:
    - Collaborative filtering (users who liked X also liked Y)
    - Content-based filtering (similar shops based on attributes)
    - Location-aware trending
    - Hybrid recommendations
    """
    
    def __init__(self):
        self.db = None
        self.shop_data: List[Dict] = []
        self.shop_embeddings: Dict[str, np.ndarray] = {}
        self.user_shop_matrix: Dict[str, Dict[str, float]] = {}  # user_id -> {shop_id: score}
        self.shop_similarity_cache: Dict[str, List[Tuple[str, float]]] = {}
        self._initialize()
    
    def _initialize(self):
        """Initialize explore service"""
        if MOTOR_AVAILABLE:
            try:
                mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
                client = AsyncIOMotorClient(mongo_uri)
                self.db = client.blr_thrifter
                logger.info("Explore service connected to MongoDB")
            except Exception as e:
                logger.error(f"MongoDB connection failed: {e}")
    
    # ==================== Main Explore API ====================
    
    async def get_explore_sections(
        self,
        user_id: Optional[str] = None,
        location: Optional[str] = None
    ) -> List[Dict]:
        """
        Get all explore sections for a user
        
        Returns sections like:
        - For You (personalized)
        - Trending This Week
        - New Arrivals
        - Popular in [Location]
        - Based on your style
        """
        sections = []
        
        # Get user data if authenticated
        user = None
        if user_id and self.db:
            try:
                user = await self.db.users.find_one({"_id": user_id})
            except:
                pass
        
        # 1. For You section (personalized)
        if user:
            for_you = await self.get_for_you(user)
            if for_you:
                sections.append({
                    "id": "for-you",
                    "title": "For You",
                    "subtitle": "Based on your style preferences",
                    "type": "personalized",
                    "items": for_you[:8]
                })
        
        # 2. Trending section
        trending = await self.get_trending(location)
        sections.append({
            "id": "trending",
            "title": "Trending This Week",
            "subtitle": "Most visited stores",
            "type": "trending",
            "items": trending[:8]
        })
        
        # 3. Location-based section
        if location:
            nearby = await self.get_location_popular(location)
            if nearby:
                location_label = self._get_location_label(location)
                sections.append({
                    "id": f"popular-{location}",
                    "title": f"Popular in {location_label}",
                    "subtitle": "Top-rated nearby",
                    "type": "location",
                    "items": nearby[:6]
                })
        
        # 4. Style-based sections (if user has preferences)
        if user and user.get("preferences", {}).get("style"):
            for style in user["preferences"]["style"][:2]:
                style_shops = await self.get_by_style(style)
                if style_shops:
                    sections.append({
                        "id": f"style-{style}",
                        "title": f"{style.title()} Picks",
                        "subtitle": f"Curated for {style} lovers",
                        "type": "style",
                        "items": style_shops[:6]
                    })
        
        # 5. New arrivals
        new = await self.get_new_stores()
        if new:
            sections.append({
                "id": "new",
                "title": "Recently Added",
                "subtitle": "Fresh finds in our database",
                "type": "new",
                "items": new[:6]
            })
        
        # 6. Similar users liked (collaborative)
        if user:
            similar_users = await self.get_collaborative_recommendations(user_id)
            if similar_users:
                sections.append({
                    "id": "similar-users",
                    "title": "Thrifters Like You",
                    "subtitle": "Popular with similar users",
                    "type": "collaborative",
                    "items": similar_users[:6]
                })
        
        return sections
    
    # ==================== For You (Hybrid) ====================
    
    async def get_for_you(
        self,
        user: Dict,
        limit: int = 12
    ) -> List[Dict]:
        """
        Get personalized 'For You' recommendations
        Combines multiple signals:
        - User preferences (content-based)
        - User history (collaborative)
        - Trending (popularity)
        """
        recommendations: Dict[str, Recommendation] = {}
        
        # 1. Content-based from preferences
        content_recs = await self._content_based_recommendations(user, limit)
        for rec in content_recs:
            shop_id = rec.shop.get("_id") or rec.shop.get("name")
            if shop_id not in recommendations or rec.score > recommendations[shop_id].score:
                recommendations[shop_id] = rec
        
        # 2. Collaborative filtering
        user_id = str(user.get("_id", ""))
        collab_recs = await self._collaborative_recommendations(user_id, limit // 2)
        for rec in collab_recs:
            shop_id = rec.shop.get("_id") or rec.shop.get("name")
            if shop_id not in recommendations:
                recommendations[shop_id] = rec
            else:
                # Boost score if also recommended collaboratively
                recommendations[shop_id].score += rec.score * 0.5
        
        # 3. Add trending boost
        trending = await self.get_trending()
        for i, shop in enumerate(trending[:10]):
            shop_id = shop.get("_id") or shop.get("name")
            if shop_id in recommendations:
                recommendations[shop_id].score += (10 - i) * 0.1  # Small trending boost
        
        # Sort and format
        sorted_recs = sorted(
            recommendations.values(),
            key=lambda x: x.score,
            reverse=True
        )
        
        return [
            {
                "shop": rec.shop,
                "reason": rec.reason,
                "matchScore": min(rec.score / 10, 1.0),
                "basedOn": rec.source
            }
            for rec in sorted_recs[:limit]
        ]
    
    async def _content_based_recommendations(
        self,
        user: Dict,
        limit: int
    ) -> List[Recommendation]:
        """Generate recommendations based on user preferences"""
        recommendations = []
        preferences = user.get("preferences", {})
        
        for shop in self.shop_data:
            score = 0
            reasons = []
            
            # Location match (strong signal)
            if preferences.get("favoriteLocations"):
                shop_location = shop.get("location", {}).get("id")
                if shop_location in preferences["favoriteLocations"]:
                    score += 4
                    reasons.append(f"in {shop.get('location', {}).get('label', 'your area')}")
            
            # Style match
            shop_tag = shop.get("tag", "").lower()
            shop_desc = shop.get("desc", "").lower()
            
            style_map = {
                "vintage": ["vintage", "pre-loved", "thrift", "retro"],
                "streetwear": ["streetwear", "urban", "hype", "street"],
                "minimalist": ["basics", "minimal", "simple"],
                "grunge": ["grunge", "edgy", "alternative"],
                "y2k": ["y2k", "2000s", "retro"],
            }
            
            for user_style in preferences.get("style", []):
                keywords = style_map.get(user_style, [user_style])
                for keyword in keywords:
                    if keyword in shop_tag or keyword in shop_desc:
                        score += 3
                        reasons.append(f"matches your {user_style} style")
                        break
            
            # Category match
            for category in preferences.get("favoriteCategories", []):
                if category.lower() in shop_desc:
                    score += 2
                    reasons.append(f"good for {category}")
            
            # Budget match
            if preferences.get("budget"):
                budget_max = preferences["budget"].get("max", 5000)
                if budget_max <= 1000 and any(t in shop_tag for t in ["budget", "cheap", "surplus"]):
                    score += 2
                    reasons.append("fits your budget")
            
            # Rating quality
            if shop.get("rating"):
                score += shop["rating"] * 0.5
            
            if score > 0:
                recommendations.append(Recommendation(
                    shop=shop,
                    score=score,
                    reason=reasons[0] if reasons else "recommended for you",
                    source="content"
                ))
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    async def _collaborative_recommendations(
        self,
        user_id: str,
        limit: int
    ) -> List[Recommendation]:
        """
        Collaborative filtering: find similar users and recommend their favorites
        """
        if not self.db:
            return []
        
        try:
            # Get current user's favorites
            user = await self.db.users.find_one({"_id": user_id})
            if not user or not user.get("favorites"):
                return []
            
            user_favorites = set(str(f) for f in user.get("favorites", []))
            
            # Find users with similar favorites
            similar_users = await self.db.users.find({
                "favorites": {"$in": list(user_favorites)},
                "_id": {"$ne": user_id}
            }).limit(50).to_list(50)
            
            # Count shop occurrences among similar users
            shop_scores = defaultdict(float)
            
            for similar_user in similar_users:
                # Calculate similarity (Jaccard)
                their_favorites = set(str(f) for f in similar_user.get("favorites", []))
                intersection = len(user_favorites & their_favorites)
                union = len(user_favorites | their_favorites)
                similarity = intersection / union if union > 0 else 0
                
                # Weight recommendations by similarity
                for fav in their_favorites - user_favorites:
                    shop_scores[fav] += similarity
            
            # Get shop data for recommendations
            recommendations = []
            for shop_id, score in sorted(shop_scores.items(), key=lambda x: x[1], reverse=True)[:limit]:
                shop = next((s for s in self.shop_data if str(s.get("_id")) == shop_id), None)
                if shop:
                    recommendations.append(Recommendation(
                        shop=shop,
                        score=score * 5,  # Scale up
                        reason="loved by similar thrifters",
                        source="collaborative"
                    ))
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Collaborative filtering error: {e}")
            return []
    
    # ==================== Trending ====================
    
    async def get_trending(
        self,
        location: Optional[str] = None,
        days: int = 7
    ) -> List[Dict]:
        """
        Get trending stores based on:
        - Recent favorites
        - Search appearances
        - Ratings
        """
        # In production, would aggregate from user interactions
        # For now, use rating and review count as proxy
        
        shops = self.shop_data
        
        if location:
            shops = [s for s in shops if s.get("location", {}).get("id") == location]
        
        # Score by popularity metrics
        scored = []
        for shop in shops:
            score = 0
            
            # Review count (engagement)
            score += (shop.get("reviewCount") or 0) * 0.01
            
            # Rating
            score += (shop.get("rating") or 0) * 2
            
            # Boost newer entries
            created = shop.get("createdAt")
            if created:
                try:
                    days_old = (datetime.utcnow() - datetime.fromisoformat(created.replace("Z", ""))).days
                    if days_old < 30:
                        score += 2
                except:
                    pass
            
            scored.append((shop, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in scored]
    
    # ==================== Location-Based ====================
    
    async def get_location_popular(
        self,
        location: str,
        limit: int = 10
    ) -> List[Dict]:
        """Get popular stores in a specific location"""
        location_shops = [
            s for s in self.shop_data
            if s.get("location", {}).get("id") == location
        ]
        
        # Sort by rating and review count
        return sorted(
            location_shops,
            key=lambda x: ((x.get("rating") or 0) * 2 + (x.get("reviewCount") or 0) * 0.01),
            reverse=True
        )[:limit]
    
    def _get_location_label(self, location_id: str) -> str:
        """Get display label for location"""
        labels = {
            "hsr-layout": "HSR Layout",
            "koramangala": "Koramangala",
            "jayanagar": "Jayanagar",
            "jpnagar": "JP Nagar",
            "indiranagar": "Indiranagar",
            "central": "Commercial Street",
            "whitefield": "Whitefield",
            "malleshwaram": "Malleshwaram",
            "btm": "BTM Layout",
        }
        return labels.get(location_id, location_id.replace("-", " ").title())
    
    # ==================== Style-Based ====================
    
    async def get_by_style(
        self,
        style: str,
        limit: int = 10
    ) -> List[Dict]:
        """Get stores matching a style"""
        style_map = {
            "vintage": ["vintage", "pre-loved", "thrift", "retro", "antique"],
            "streetwear": ["streetwear", "urban", "hype", "street", "sneakers"],
            "minimalist": ["basics", "minimal", "simple", "clean"],
            "grunge": ["grunge", "edgy", "alternative", "rock"],
            "y2k": ["y2k", "2000s", "millennium"],
            "cottagecore": ["cottage", "floral", "romantic"],
            "old-money": ["classic", "preppy", "formal", "linen"],
        }
        
        keywords = style_map.get(style.lower(), [style.lower()])
        
        matching = []
        for shop in self.shop_data:
            shop_text = f"{shop.get('tag', '')} {shop.get('desc', '')}".lower()
            
            if any(kw in shop_text for kw in keywords):
                matching.append(shop)
        
        # Sort by rating
        return sorted(
            matching,
            key=lambda x: (x.get("rating") or 0),
            reverse=True
        )[:limit]
    
    # ==================== New Stores ====================
    
    async def get_new_stores(self, days: int = 30, limit: int = 10) -> List[Dict]:
        """Get recently added stores"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        new_shops = []
        for shop in self.shop_data:
            created = shop.get("createdAt")
            if created:
                try:
                    created_dt = datetime.fromisoformat(created.replace("Z", ""))
                    if created_dt > cutoff:
                        new_shops.append((shop, created_dt))
                except:
                    pass
        
        # Sort by newest first
        new_shops.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in new_shops[:limit]]
    
    # ==================== Collaborative Public API ====================
    
    async def get_collaborative_recommendations(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """Public API for collaborative recommendations"""
        recs = await self._collaborative_recommendations(user_id, limit)
        return [
            {
                "shop": rec.shop,
                "reason": rec.reason,
                "matchScore": min(rec.score / 5, 1.0),
                "basedOn": "collaborative"
            }
            for rec in recs
        ]
    
    # ==================== Data Management ====================
    
    def add_shop_data(self, shops: List[Dict]):
        """Add shop data for recommendations"""
        self.shop_data = shops
        logger.info(f"Explore service loaded {len(shops)} shops")
    
    def add_shop_embeddings(self, embeddings: Dict[str, np.ndarray]):
        """Add precomputed shop embeddings"""
        self.shop_embeddings = embeddings
        self._compute_shop_similarities()
    
    def _compute_shop_similarities(self):
        """Precompute shop-to-shop similarities"""
        if not self.shop_embeddings:
            return
        
        shop_ids = list(self.shop_embeddings.keys())
        
        for shop_id in shop_ids:
            similarities = []
            shop_emb = self.shop_embeddings[shop_id]
            
            for other_id in shop_ids:
                if other_id != shop_id:
                    other_emb = self.shop_embeddings[other_id]
                    sim = np.dot(shop_emb, other_emb)
                    similarities.append((other_id, sim))
            
            similarities.sort(key=lambda x: x[1], reverse=True)
            self.shop_similarity_cache[shop_id] = similarities[:20]
        
        logger.info(f"Computed similarities for {len(shop_ids)} shops")

