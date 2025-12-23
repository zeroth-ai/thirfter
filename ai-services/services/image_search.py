"""
Image Search Service
Uses CLIP for visual similarity search
Finds items/stores similar to uploaded images
"""

import os
import io
from typing import List, Optional, Dict, Any
from loguru import logger
import numpy as np

# Image processing
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# CLIP model
try:
    import torch
    from transformers import CLIPProcessor, CLIPModel
    CLIP_AVAILABLE = True
except ImportError:
    CLIP_AVAILABLE = False
    logger.warning("CLIP not available. Install with: pip install transformers torch")

# Vector search
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False


class ImageSearchService:
    """
    Visual similarity search using CLIP embeddings
    
    Features:
    - Upload an image to find similar items
    - Cross-modal search (text query → image results)
    - Style matching based on visual features
    """
    
    def __init__(self):
        self.model = None
        self.processor = None
        self.faiss_index = None
        self.image_embeddings: Dict[str, np.ndarray] = {}
        self.shop_data: List[Dict] = []
        self.shop_images: Dict[str, List[str]] = {}  # shop_id -> image URLs
        self.embedding_dim = 512
        self._ready = False
        self._initialize()
    
    def _initialize(self):
        """Initialize CLIP model and FAISS index"""
        if not CLIP_AVAILABLE:
            logger.error("CLIP not available - image search disabled")
            return
        
        if not PIL_AVAILABLE:
            logger.error("PIL not available - image search disabled")
            return
        
        try:
            # Load CLIP model
            model_name = "openai/clip-vit-base-patch32"
            logger.info(f"Loading CLIP model: {model_name}")
            
            self.processor = CLIPProcessor.from_pretrained(model_name)
            self.model = CLIPModel.from_pretrained(model_name)
            
            # Move to GPU if available
            if torch.cuda.is_available():
                self.model = self.model.cuda()
                logger.info("CLIP model loaded on GPU")
            else:
                logger.info("CLIP model loaded on CPU")
            
            self.model.eval()
            self.embedding_dim = self.model.config.projection_dim
            
            # Initialize FAISS index
            if FAISS_AVAILABLE:
                self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
            
            self._ready = True
            logger.info("Image search service initialized")
            
        except Exception as e:
            logger.error(f"Image search initialization failed: {e}")
            self._ready = False
    
    def is_ready(self) -> bool:
        return self._ready
    
    # ==================== Main Search API ====================
    
    async def search_by_image(
        self,
        image_data: bytes,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search for similar items by uploaded image
        
        Args:
            image_data: Raw image bytes
            limit: Max results
        
        Returns:
            List of similar shops/items with similarity scores
        """
        if not self._ready:
            return self._fallback_search(limit)
        
        try:
            # Load and process image
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            
            # Get image embedding
            image_embedding = self._encode_image(image)
            
            # Search for similar
            results = self._search_similar(image_embedding, limit)
            
            return results
            
        except Exception as e:
            logger.error(f"Image search error: {e}")
            return self._fallback_search(limit)
    
    async def search_by_text(
        self,
        text: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Search images using text query (cross-modal)
        
        Args:
            text: Text description
            limit: Max results
        """
        if not self._ready:
            return self._fallback_search(limit)
        
        try:
            # Get text embedding
            text_embedding = self._encode_text(text)
            
            # Search for similar images
            results = self._search_similar(text_embedding, limit)
            
            return results
            
        except Exception as e:
            logger.error(f"Text-to-image search error: {e}")
            return self._fallback_search(limit)
    
    # ==================== Encoding ====================
    
    def _encode_image(self, image: Image.Image) -> np.ndarray:
        """Encode image to CLIP embedding"""
        with torch.no_grad():
            inputs = self.processor(images=image, return_tensors="pt")
            
            if torch.cuda.is_available():
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            image_features = self.model.get_image_features(**inputs)
            
            # Normalize
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            return image_features.cpu().numpy().flatten()
    
    def _encode_text(self, text: str) -> np.ndarray:
        """Encode text to CLIP embedding"""
        with torch.no_grad():
            inputs = self.processor(text=[text], return_tensors="pt", padding=True)
            
            if torch.cuda.is_available():
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            text_features = self.model.get_text_features(**inputs)
            
            # Normalize
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)
            
            return text_features.cpu().numpy().flatten()
    
    # ==================== Search ====================
    
    def _search_similar(
        self,
        query_embedding: np.ndarray,
        limit: int
    ) -> List[Dict]:
        """Search for similar items using embedding"""
        results = []
        
        if self.faiss_index and self.faiss_index.ntotal > 0:
            # Use FAISS for fast search
            k = min(limit, self.faiss_index.ntotal)
            scores, indices = self.faiss_index.search(
                query_embedding.reshape(1, -1).astype('float32'),
                k
            )
            
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and idx < len(self.shop_data):
                    shop = self.shop_data[idx]
                    results.append({
                        "shop": shop,
                        "similarity": float(score),
                        "matchType": "visual"
                    })
        else:
            # Fallback to manual search
            for shop_id, embedding in self.image_embeddings.items():
                similarity = np.dot(query_embedding, embedding)
                
                shop = next(
                    (s for s in self.shop_data if str(s.get("_id")) == shop_id),
                    None
                )
                
                if shop:
                    results.append({
                        "shop": shop,
                        "similarity": float(similarity),
                        "matchType": "visual"
                    })
            
            results.sort(key=lambda x: x["similarity"], reverse=True)
        
        return results[:limit]
    
    def _fallback_search(self, limit: int) -> List[Dict]:
        """Return fallback results when image search unavailable"""
        # Return popular shops as fallback
        return [
            {
                "shop": shop,
                "similarity": 0.5,
                "matchType": "fallback"
            }
            for shop in self.shop_data[:limit]
        ]
    
    # ==================== Data Management ====================
    
    def add_shop_data(self, shops: List[Dict]):
        """Add shop data and index images"""
        self.shop_data = shops
        
        if not self._ready:
            logger.warning("Image search not ready - skipping image indexing")
            return
        
        # Extract image URLs
        self.shop_images.clear()
        for shop in shops:
            shop_id = str(shop.get("_id") or shop.get("name"))
            images = shop.get("images", [])
            if images:
                self.shop_images[shop_id] = images
        
        # Generate embeddings from shop descriptions
        # In production, you'd encode actual images
        self._index_shop_descriptions()
        
        logger.info(f"Loaded {len(shops)} shops for image search")
    
    def _index_shop_descriptions(self):
        """Index shops using their descriptions (fallback when no images)"""
        if not self._ready or not self.shop_data:
            return
        
        if FAISS_AVAILABLE:
            self.faiss_index = faiss.IndexFlatIP(self.embedding_dim)
        
        embeddings = []
        
        for shop in self.shop_data:
            # Create visual description
            visual_desc = self._create_visual_description(shop)
            
            # Encode
            embedding = self._encode_text(visual_desc)
            embeddings.append(embedding)
            
            # Store
            shop_id = str(shop.get("_id") or shop.get("name"))
            self.image_embeddings[shop_id] = embedding
        
        # Add to FAISS
        if embeddings and self.faiss_index is not None:
            embeddings_array = np.array(embeddings).astype('float32')
            self.faiss_index.add(embeddings_array)
        
        logger.info(f"Indexed {len(embeddings)} shop descriptions for visual search")
    
    def _create_visual_description(self, shop: Dict) -> str:
        """Create visual/style description for a shop"""
        parts = []
        
        # Style from tag
        tag = shop.get("tag", "")
        if tag:
            parts.append(f"{tag} style clothing store")
        
        # From description
        desc = shop.get("desc", "")
        if desc:
            parts.append(desc)
        
        # From specialties
        specialties = shop.get("specialties", [])
        if specialties:
            parts.append(f"featuring {', '.join(specialties)}")
        
        return " ".join(parts) if parts else "thrift store clothing"
    
    async def index_shop_images(self, shop_id: str, image_urls: List[str]):
        """
        Index actual images for a shop
        Downloads and encodes each image
        """
        if not self._ready:
            return
        
        try:
            import httpx
            
            async with httpx.AsyncClient() as client:
                embeddings = []
                
                for url in image_urls[:5]:  # Limit images per shop
                    try:
                        response = await client.get(url)
                        if response.status_code == 200:
                            image = Image.open(io.BytesIO(response.content)).convert("RGB")
                            embedding = self._encode_image(image)
                            embeddings.append(embedding)
                    except Exception as e:
                        logger.warning(f"Failed to load image {url}: {e}")
                
                if embeddings:
                    # Average embeddings for this shop
                    avg_embedding = np.mean(embeddings, axis=0)
                    self.image_embeddings[shop_id] = avg_embedding
                    logger.info(f"Indexed {len(embeddings)} images for shop {shop_id}")
        
        except Exception as e:
            logger.error(f"Image indexing error: {e}")
    
    # ==================== Style Analysis ====================
    
    async def analyze_style(self, image_data: bytes) -> Dict[str, Any]:
        """
        Analyze the style of an uploaded image
        Returns style tags and similar styles
        """
        if not self._ready:
            return {"error": "Image analysis not available"}
        
        try:
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            image_embedding = self._encode_image(image)
            
            # Compare against style categories
            styles = [
                "vintage retro clothing",
                "streetwear urban fashion",
                "minimalist simple basics",
                "grunge alternative style",
                "y2k 2000s fashion",
                "cottagecore floral romantic",
                "old money classic preppy",
                "bohemian boho style",
                "athletic sportswear",
                "formal business attire"
            ]
            
            style_scores = []
            for style in styles:
                style_embedding = self._encode_text(style)
                similarity = np.dot(image_embedding, style_embedding)
                style_scores.append((style.split()[0], float(similarity)))
            
            style_scores.sort(key=lambda x: x[1], reverse=True)
            
            return {
                "top_styles": [
                    {"style": s[0], "confidence": s[1]}
                    for s in style_scores[:3]
                ],
                "all_styles": style_scores
            }
            
        except Exception as e:
            logger.error(f"Style analysis error: {e}")
            return {"error": str(e)}
    
    # ==================== Stats ====================
    
    def get_stats(self) -> Dict:
        """Get image search statistics"""
        return {
            "ready": self._ready,
            "model": "openai/clip-vit-base-patch32" if self._ready else None,
            "indexed_shops": len(self.image_embeddings),
            "total_shops": len(self.shop_data),
            "embedding_dim": self.embedding_dim
        }
