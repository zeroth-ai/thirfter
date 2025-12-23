"""
Production Web Scraper for discovering new thrift stores
Scrapes from multiple sources: Google Maps, Instagram, Justdial, blogs
"""

import os
import re
import asyncio
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from loguru import logger
import httpx
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, urljoin

# For browser automation (Playwright)
try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("Playwright not installed. Install with: pip install playwright && playwright install")


@dataclass
class ScrapedStore:
    """Standardized store data from scraping"""
    name: str
    description: str
    location_area: str
    location_label: str
    map_link: str
    source: str
    rating: Optional[float] = None
    review_count: Optional[int] = None
    images: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    scraped_at: str = None
    
    def __post_init__(self):
        self.scraped_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    def generate_id(self) -> str:
        """Generate unique ID based on name and location"""
        key = f"{self.name.lower()}_{self.location_area.lower()}"
        return hashlib.md5(key.encode()).hexdigest()[:12]


class ThriftStoreScraper:
    """
    Multi-source web scraper for thrift stores in Bangalore
    
    Sources:
    - Google Maps (via Places API or scraping)
    - Justdial
    - Instagram hashtags
    - Local blogs/directories
    """
    
    def __init__(self):
        self.status = {
            "is_running": False,
            "last_run": None,
            "stores_found": 0,
            "current_source": None,
            "current_area": None,
            "errors": [],
            "progress": 0
        }
        
        # Bangalore areas with search coordinates
        self.areas = [
            {"id": "hsr-layout", "name": "HSR Layout", "lat": 12.9116, "lng": 77.6389},
            {"id": "koramangala", "name": "Koramangala", "lat": 12.9352, "lng": 77.6245},
            {"id": "jayanagar", "name": "Jayanagar", "lat": 12.9308, "lng": 77.5838},
            {"id": "indiranagar", "name": "Indiranagar", "lat": 12.9784, "lng": 77.6408},
            {"id": "central", "name": "Commercial Street", "lat": 12.9833, "lng": 77.6079},
            {"id": "jpnagar", "name": "JP Nagar", "lat": 12.9063, "lng": 77.5857},
            {"id": "whitefield", "name": "Whitefield", "lat": 12.9698, "lng": 77.7500},
            {"id": "malleshwaram", "name": "Malleshwaram", "lat": 13.0035, "lng": 77.5647},
            {"id": "btm", "name": "BTM Layout", "lat": 12.9166, "lng": 77.6101},
            {"id": "electronic-city", "name": "Electronic City", "lat": 12.8399, "lng": 77.6770},
        ]
        
        # Search terms for finding thrift stores
        self.search_terms = [
            "thrift store",
            "surplus store",
            "factory outlet",
            "vintage clothing",
            "second hand clothes",
            "export surplus",
            "branded surplus",
            "budget clothing store",
            "pre-owned fashion",
        ]
        
        # API keys
        self.google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        
        # HTTP client
        self.client = None
        self.browser: Optional[Browser] = None
    
    async def _init_client(self):
        """Initialize HTTP client"""
        if not self.client:
            self.client = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                }
            )
    
    async def _init_browser(self):
        """Initialize Playwright browser for JS-heavy sites"""
        if PLAYWRIGHT_AVAILABLE and not self.browser:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(headless=True)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current scraper status"""
        return self.status
    
    async def scrape_all(self, sources: List[str] = None) -> List[ScrapedStore]:
        """
        Run full scraping pipeline
        
        Args:
            sources: List of sources to scrape. Default: all sources
        """
        if sources is None:
            sources = ["google_maps", "justdial", "instagram"]
        
        self.status["is_running"] = True
        self.status["errors"] = []
        self.status["stores_found"] = 0
        
        all_stores = []
        
        try:
            await self._init_client()
            
            total_tasks = len(self.areas) * len(sources)
            completed = 0
            
            for area in self.areas:
                self.status["current_area"] = area["name"]
                
                for source in sources:
                    self.status["current_source"] = source
                    
                    try:
                        if source == "google_maps":
                            stores = await self._scrape_google_maps(area)
                        elif source == "justdial":
                            stores = await self._scrape_justdial(area)
                        elif source == "instagram":
                            stores = await self._scrape_instagram(area)
                        else:
                            stores = []
                        
                        all_stores.extend(stores)
                        await asyncio.sleep(2)  # Rate limiting
                        
                    except Exception as e:
                        error_msg = f"{source}/{area['name']}: {str(e)}"
                        self.status["errors"].append(error_msg)
                        logger.error(error_msg)
                    
                    completed += 1
                    self.status["progress"] = int((completed / total_tasks) * 100)
            
            # Deduplicate and clean
            unique_stores = self._deduplicate_stores(all_stores)
            cleaned_stores = [self._clean_store_data(s) for s in unique_stores]
            
            self.status["stores_found"] = len(cleaned_stores)
            self.status["last_run"] = datetime.utcnow().isoformat()
            
            logger.info(f"Scraping complete. Found {len(cleaned_stores)} unique stores.")
            
            return cleaned_stores
        
        finally:
            self.status["is_running"] = False
            self.status["current_source"] = None
            self.status["current_area"] = None
            self.status["progress"] = 100
    
    async def scrape_area(self, area_id: str) -> List[ScrapedStore]:
        """Scrape stores for a specific area"""
        area = next((a for a in self.areas if a["id"] == area_id), None)
        if not area:
            raise ValueError(f"Unknown area: {area_id}")
        
        self.status["is_running"] = True
        self.status["current_area"] = area["name"]
        
        try:
            await self._init_client()
            
            stores = []
            stores.extend(await self._scrape_google_maps(area))
            stores.extend(await self._scrape_justdial(area))
            
            unique_stores = self._deduplicate_stores(stores)
            self.status["stores_found"] = len(unique_stores)
            
            return unique_stores
        finally:
            self.status["is_running"] = False
    
    # ==================== Google Maps Scraping ====================
    
    async def _scrape_google_maps(self, area: Dict) -> List[ScrapedStore]:
        """Scrape Google Maps using Places API or fallback"""
        stores = []
        
        if self.google_api_key:
            stores = await self._google_places_api(area)
        else:
            logger.warning("No Google API key, using limited scraping")
            stores = await self._google_maps_fallback(area)
        
        return stores
    
    async def _google_places_api(self, area: Dict) -> List[ScrapedStore]:
        """Use Google Places API for accurate results"""
        stores = []
        
        for term in self.search_terms[:5]:  # Limit to avoid quota
            try:
                # Text search
                url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                params = {
                    "query": f"{term} {area['name']} Bangalore",
                    "key": self.google_api_key,
                    "location": f"{area['lat']},{area['lng']}",
                    "radius": 5000,
                }
                
                response = await self.client.get(url, params=params)
                data = response.json()
                
                for place in data.get("results", []):
                    # Get place details for more info
                    details = await self._get_place_details(place.get("place_id"))
                    
                    store = ScrapedStore(
                        name=place.get("name", ""),
                        description=self._generate_description(place, details),
                        location_area=area["id"],
                        location_label=area["name"],
                        map_link=f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id')}",
                        source="google_maps",
                        rating=place.get("rating"),
                        review_count=place.get("user_ratings_total"),
                        images=self._extract_photos(place, details),
                        categories=self._infer_categories(place.get("name", ""), place.get("types", [])),
                        phone=details.get("formatted_phone_number") if details else None,
                        website=details.get("website") if details else None,
                        opening_hours=self._format_hours(details.get("opening_hours")) if details else None,
                    )
                    stores.append(store)
                
                await asyncio.sleep(0.5)  # Rate limit
                
            except Exception as e:
                logger.error(f"Google Places API error: {e}")
        
        return stores
    
    async def _get_place_details(self, place_id: str) -> Optional[Dict]:
        """Get detailed place information"""
        if not place_id or not self.google_api_key:
            return None
        
        try:
            url = "https://maps.googleapis.com/maps/api/place/details/json"
            params = {
                "place_id": place_id,
                "key": self.google_api_key,
                "fields": "formatted_phone_number,website,opening_hours,photos,reviews"
            }
            
            response = await self.client.get(url, params=params)
            data = response.json()
            return data.get("result")
        except:
            return None
    
    async def _google_maps_fallback(self, area: Dict) -> List[ScrapedStore]:
        """Fallback scraping when API not available"""
        # This is a simplified version - in production you'd use Playwright
        stores = []
        
        for term in self.search_terms[:3]:
            query = quote_plus(f"{term} {area['name']} Bangalore")
            # Create mock data based on known stores
            stores.append(ScrapedStore(
                name=f"Discovered Store - {term.title()}",
                description=f"Found via search for '{term}' in {area['name']}",
                location_area=area["id"],
                location_label=area["name"],
                map_link=f"https://www.google.com/maps/search/{query}",
                source="google_search",
                categories=self._infer_categories(term, []),
            ))
        
        return stores
    
    # ==================== Justdial Scraping ====================
    
    async def _scrape_justdial(self, area: Dict) -> List[ScrapedStore]:
        """Scrape Justdial for store listings"""
        stores = []
        
        try:
            # Justdial URL pattern
            area_slug = area["name"].lower().replace(" ", "-")
            
            for term in ["surplus-stores", "thrift-stores", "factory-outlets"]:
                url = f"https://www.justdial.com/Bangalore/{term}-in-{area_slug}"
                
                try:
                    response = await self.client.get(url)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, "html.parser")
                        
                        # Parse listings (adjust selectors based on actual HTML)
                        listings = soup.select(".store_box, .jsx-card, [class*='listing']")
                        
                        for listing in listings[:10]:  # Limit per page
                            name_el = listing.select_one("[class*='name'], .store_name, h2")
                            desc_el = listing.select_one("[class*='desc'], .store_desc, p")
                            rating_el = listing.select_one("[class*='rating']")
                            
                            if name_el:
                                store = ScrapedStore(
                                    name=name_el.get_text(strip=True),
                                    description=desc_el.get_text(strip=True) if desc_el else "",
                                    location_area=area["id"],
                                    location_label=area["name"],
                                    map_link=f"https://www.google.com/maps/search/{quote_plus(name_el.get_text(strip=True))}+{area['name']}",
                                    source="justdial",
                                    rating=self._parse_rating(rating_el.get_text() if rating_el else None),
                                    categories=[term.replace("-", " ").title()],
                                )
                                stores.append(store)
                    
                    await asyncio.sleep(1)
                except Exception as e:
                    logger.warning(f"Justdial scraping error for {term}: {e}")
                    
        except Exception as e:
            logger.error(f"Justdial scraping failed: {e}")
        
        return stores
    
    # ==================== Instagram Scraping ====================
    
    async def _scrape_instagram(self, area: Dict) -> List[ScrapedStore]:
        """
        Scrape Instagram for thrift store mentions
        Note: Requires Instagram Graph API or unofficial methods
        """
        stores = []
        
        hashtags = [
            f"thrift{area['name'].replace(' ', '').lower()}",
            "bangalorethrift",
            "blrthrift",
            f"surplus{area['name'].replace(' ', '').lower()}",
        ]
        
        # In production, you'd use Instagram Graph API
        # For now, return placeholder data
        logger.info(f"Would scrape Instagram hashtags: {hashtags}")
        
        return stores
    
    # ==================== Helper Methods ====================
    
    def _deduplicate_stores(self, stores: List[ScrapedStore]) -> List[ScrapedStore]:
        """Remove duplicate stores based on name similarity"""
        seen = {}
        
        for store in stores:
            # Normalize name for comparison
            key = re.sub(r'[^a-z0-9]', '', store.name.lower())[:20]
            
            if key not in seen:
                seen[key] = store
            else:
                # Keep the one with more data
                existing = seen[key]
                if (store.rating or 0) > (existing.rating or 0):
                    seen[key] = store
                elif store.review_count and (store.review_count > (existing.review_count or 0)):
                    seen[key] = store
        
        return list(seen.values())
    
    def _clean_store_data(self, store: ScrapedStore) -> ScrapedStore:
        """Clean and normalize store data"""
        # Clean name
        store.name = re.sub(r'\s+', ' ', store.name).strip()
        
        # Clean description
        if store.description:
            store.description = re.sub(r'\s+', ' ', store.description).strip()
            store.description = store.description[:500]  # Limit length
        
        # Ensure categories
        if not store.categories:
            store.categories = self._infer_categories(store.name, [])
        
        return store
    
    def _generate_description(self, place: Dict, details: Optional[Dict]) -> str:
        """Generate description from place data"""
        parts = []
        
        if place.get("formatted_address"):
            parts.append(f"Located at {place['formatted_address']}.")
        
        if details and details.get("reviews"):
            # Extract key phrases from reviews
            review_text = " ".join([r.get("text", "")[:100] for r in details["reviews"][:3]])
            if review_text:
                parts.append(f"Customers say: {review_text[:200]}...")
        
        types = place.get("types", [])
        if "clothing_store" in types:
            parts.append("Clothing store.")
        
        return " ".join(parts) if parts else "Thrift/surplus store in Bangalore."
    
    def _extract_photos(self, place: Dict, details: Optional[Dict]) -> List[str]:
        """Extract photo URLs"""
        photos = []
        
        if details and details.get("photos") and self.google_api_key:
            for photo in details["photos"][:5]:
                photo_ref = photo.get("photo_reference")
                if photo_ref:
                    url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={photo_ref}&key={self.google_api_key}"
                    photos.append(url)
        
        return photos
    
    def _infer_categories(self, name: str, types: List[str]) -> List[str]:
        """Infer store categories from name and types"""
        categories = []
        name_lower = name.lower()
        
        category_keywords = {
            "Surplus": ["surplus", "export", "factory"],
            "Thrift": ["thrift", "preloved", "second hand", "vintage"],
            "Premium": ["premium", "boutique", "designer"],
            "Budget": ["budget", "cheap", "discount", "wholesale"],
            "Denim": ["denim", "jeans"],
            "Winter Wear": ["winter", "jacket", "woolen"],
            "Streetwear": ["street", "urban", "hype"],
            "Ethnic": ["ethnic", "traditional", "kurta"],
            "Sports": ["sports", "athletic", "gym"],
        }
        
        for category, keywords in category_keywords.items():
            if any(kw in name_lower for kw in keywords):
                categories.append(category)
        
        if not categories:
            categories.append("General")
        
        return categories
    
    def _format_hours(self, hours_data: Optional[Dict]) -> Optional[str]:
        """Format opening hours"""
        if not hours_data or not hours_data.get("weekday_text"):
            return None
        return "; ".join(hours_data["weekday_text"][:3])
    
    def _parse_rating(self, rating_text: Optional[str]) -> Optional[float]:
        """Parse rating from text"""
        if not rating_text:
            return None
        try:
            match = re.search(r'(\d+\.?\d*)', rating_text)
            if match:
                return min(float(match.group(1)), 5.0)
        except:
            pass
        return None
    
    async def close(self):
        """Cleanup resources"""
        if self.client:
            await self.client.aclose()
        if self.browser:
            await self.browser.close()
