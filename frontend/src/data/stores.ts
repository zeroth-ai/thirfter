import type { Shop, LocationData } from "@/types";

export const shoppingData: LocationData[] = [
  {
    id: "hsr-layout",
    label: "HSR Layout",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15555.985950244686!2d77.63216964348677!3d12.907973092246765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sclothing%20stores%20hsr%20layout!5e0!3m2!1sen!2sin!4v1709667000000!5m2!1sen!2sin",
    shops: [
      {
        name: "Branded Apparels & Co",
        tag: "Surplus",
        desc: "Top Pick. Huge stock of branded surplus shirts, chinos, and denim. Expect 60-70% off on brands like US Polo and Levis.",
        mapLink: "https://www.google.com/maps/search/Branded+Apparels+%26+Co+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Branded Surplus", "Chinos", "Denim"],
        rating: 4.5,
        reviewCount: 234,
      },
      {
        name: "World of Brands (WoB)",
        tag: "Winter Wear",
        desc: "Massive warehouse-style store. Best for heavy winter jackets, hoodies, sweatshirts, and zippers.",
        mapLink: "https://www.google.com/maps/search/World+of+Brands+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Jackets", "Hoodies", "Winter Wear"],
        rating: 4.3,
        reviewCount: 189,
      },
      {
        name: "Classic Export Surplus",
        tag: "Budget",
        desc: "Basement store hidden gem. Great for daily wear t-shirts, track pants, and shorts under ₹400.",
        mapLink: "https://www.google.com/maps/search/Classic+Export+Surplus+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Budget Finds", "Daily Wear", "Track Pants"],
        rating: 4.1,
        reviewCount: 156,
      },
      {
        name: "Hip Hopz Brand Factory",
        tag: "Streetwear",
        desc: "Trendy oversized tees, baggy cargo pants, and funky prints perfect for the gen-z aesthetic.",
        mapLink: "https://www.google.com/maps/search/Hip+Hopz+Brand+Factory+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Oversized", "Streetwear", "Gen-Z"],
        rating: 4.4,
        reviewCount: 312,
      },
      {
        name: "Snitch",
        tag: "Premium",
        desc: "Slightly pricier (₹1k-2k) but the best place for high-quality baggy cargos and korean-style pants.",
        mapLink: "https://www.google.com/maps/search/Snitch+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Korean Style", "Cargos", "Premium"],
        rating: 4.6,
        reviewCount: 445,
      },
      {
        name: "OWND!",
        tag: "Pre-Loved",
        desc: "Curated mix of pre-loved and surplus items. You can find unique vintage pieces if you dig.",
        mapLink: "https://www.google.com/maps/search/OWND!+HSR+Layout",
        location: { id: "hsr-layout", label: "HSR Layout" },
        specialties: ["Vintage", "Pre-Loved", "Unique Finds"],
        rating: 4.2,
        reviewCount: 98,
      },
    ],
  },
  {
    id: "koramangala",
    label: "Koramangala",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15554.34668744035!2d77.6139462!3d12.9342293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sshopping%20koramangala!5e0!3m2!1sen!2sin!4v1709667000000!5m2!1sen!2sin",
    shops: [
      {
        name: "EcoDhaga",
        tag: "Thrift",
        desc: "Authentic sustainable thrift store. Vintage jackets, unique shirts, and upcycled fashion.",
        mapLink: "https://www.google.com/maps/search/EcoDhaga+Koramangala",
        location: { id: "koramangala", label: "Koramangala" },
        specialties: ["Sustainable", "Vintage", "Upcycled"],
        rating: 4.7,
        reviewCount: 523,
      },
      {
        name: "Hum India",
        tag: "Legendary",
        desc: "The OG surplus store. Huge stock of branded cargos, jackets, shirts, and accessories.",
        mapLink: "https://www.google.com/maps/search/Hum+India+Koramangala",
        location: { id: "koramangala", label: "Koramangala" },
        specialties: ["Cargos", "Jackets", "OG Surplus"],
        rating: 4.5,
        reviewCount: 678,
      },
      {
        name: "Tibet Mall",
        tag: "Imports",
        desc: "Best for imported winter jackets, boots, edgy accessories, and grunge fashion.",
        mapLink: "https://www.google.com/maps/search/Tibet+Mall+Koramangala",
        location: { id: "koramangala", label: "Koramangala" },
        specialties: ["Imports", "Grunge", "Boots"],
        rating: 4.3,
        reviewCount: 234,
      },
      {
        name: "Attic (Consignment)",
        tag: "Luxury Thrift",
        desc: "Consignment store for pre-loved high-street and luxury brands. Unique finds guaranteed.",
        mapLink: "https://www.google.com/maps/search/The+Attic+Koramangala",
        location: { id: "koramangala", label: "Koramangala" },
        specialties: ["Luxury", "Consignment", "Designer"],
        rating: 4.8,
        reviewCount: 167,
      },
    ],
  },
  {
    id: "jayanagar",
    label: "Jayanagar",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d7777.627768586071!2d77.5802167!3d12.9298642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sjayanagar%204th%20block%20shopping!5e0!3m2!1sen!2sin!4v1709667000000!5m2!1sen!2sin",
    shops: [
      {
        name: "4th Block Complex",
        tag: "Hub",
        desc: "The Holy Grail. 50+ shops inside for slippers (₹150), pyjamas, kurtas, and street wear. Bargain hard.",
        mapLink: "https://www.google.com/maps/search/Jayanagar+4th+Block+Shopping+Complex",
        location: { id: "jayanagar", label: "Jayanagar" },
        specialties: ["Bargains", "Variety", "Street Wear"],
        rating: 4.4,
        reviewCount: 892,
      },
      {
        name: "Street Vendors",
        tag: "Cheapest",
        desc: "Opposite the complex. Pavement stalls selling export reject joggers, tees, and funky pyjamas.",
        mapLink: "https://www.google.com/maps/search/Jayanagar+4th+Block+Bus+Stand",
        location: { id: "jayanagar", label: "Jayanagar" },
        specialties: ["Cheapest", "Export Rejects", "Street"],
        rating: 4.0,
        reviewCount: 445,
      },
      {
        name: "Tibetan Plaza",
        tag: "Winter",
        desc: "Nearby complex focused on winter jackets, boots, and woolens.",
        mapLink: "https://www.google.com/maps/search/Tibetan+Plaza+Jayanagar",
        location: { id: "jayanagar", label: "Jayanagar" },
        specialties: ["Winter", "Boots", "Woolens"],
        rating: 4.2,
        reviewCount: 178,
      },
    ],
  },
  {
    id: "central",
    label: "Commercial St",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3887.822787836709!2d77.6083073!3d12.9831969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1scommercial%20street%20shopping!5e0!3m2!1sen!2sin!4v1709667000000!5m2!1sen!2sin",
    shops: [
      {
        name: "Eastern Stores",
        tag: "Surplus",
        desc: "Famous old store on Comm St. Best for export surplus trousers, linen shirts, and cargos.",
        mapLink: "https://www.google.com/maps/search/Eastern+Stores+Commercial+Street",
        location: { id: "central", label: "Commercial St" },
        specialties: ["Linen", "Cargos", "Classic"],
        rating: 4.3,
        reviewCount: 567,
      },
      {
        name: "Vashi's House of Jeans",
        tag: "Denim",
        desc: "Tiny legendary shop. Huge collection of jeans in all fits (skinny, baggy, bootcut) at great prices.",
        mapLink: "https://www.google.com/maps/search/Vashi's+House+of+Jeans",
        location: { id: "central", label: "Commercial St" },
        specialties: ["Denim", "All Fits", "Legendary"],
        rating: 4.6,
        reviewCount: 789,
      },
      {
        name: "Tibetan Market",
        tag: "Grunge",
        desc: "Underground market near Brigade Rd. Best for alternative fashion, grunge fits, and boots.",
        mapLink: "https://www.google.com/maps/search/Tibetan+Market+Brigade+Road",
        location: { id: "central", label: "Commercial St" },
        specialties: ["Grunge", "Alternative", "Underground"],
        rating: 4.4,
        reviewCount: 345,
      },
      {
        name: "Dubai Plaza",
        tag: "Hype",
        desc: "Rest House Rd (Brigade). Hub for imported 'hype' streetwear, sneakers, and bags.",
        mapLink: "https://www.google.com/maps/search/Dubai+Plaza+Brigade+Road",
        location: { id: "central", label: "Commercial St" },
        specialties: ["Hype", "Sneakers", "Streetwear"],
        rating: 4.5,
        reviewCount: 423,
      },
    ],
  },
  {
    id: "jpnagar",
    label: "JP Nagar",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15556.326237699997!2d77.5976722!3d12.9025266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sclothing%20stores%20jp%20nagar!5e0!3m2!1sen!2sin!4v1709667000000!5m2!1sen!2sin",
    shops: [
      {
        name: "Texs Mart",
        tag: "Mega Warehouse",
        desc: "Huge department store. Innerwear, towels, bedsheets, jackets, and daily wear at rock-bottom prices.",
        mapLink: "https://www.google.com/maps/search/Texs+Mart+JP+Nagar",
        location: { id: "jpnagar", label: "JP Nagar" },
        specialties: ["Warehouse", "Daily Wear", "Budget"],
        rating: 4.2,
        reviewCount: 634,
      },
      {
        name: "Escape Closet",
        tag: "Aesthetic Thrift",
        desc: "Hidden gem for aesthetic finds. Vintage jackets, corsets, baggy denim, and unique prints.",
        mapLink: "https://www.google.com/maps/search/Escape+Closet+JP+Nagar",
        location: { id: "jpnagar", label: "JP Nagar" },
        specialties: ["Aesthetic", "Vintage", "Unique"],
        rating: 4.7,
        reviewCount: 289,
      },
      {
        name: "Roboskin Jackets",
        tag: "Leather",
        desc: "Specialist in leather. Best place in JP Nagar for affordable leather jackets and custom repairs.",
        mapLink: "https://www.google.com/maps/search/Roboskin+Jackets+JP+Nagar",
        location: { id: "jpnagar", label: "JP Nagar" },
        specialties: ["Leather", "Custom", "Repairs"],
        rating: 4.4,
        reviewCount: 198,
      },
    ],
  },
  {
    id: "indiranagar",
    label: "Indiranagar",
    mapEmbedUrl: "https://maps.google.com/?cid=5586975323143425413&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ9",
    shops: [
      {
        name: "Hum India Fab",
        tag: "Surplus",
        desc: "Branch of the famous Koramangala store. Premium surplus shirts and chinos.",
        mapLink: "https://maps.google.com/?cid=1574236887953402680",
        location: { id: "indiranagar", label: "Indiranagar" },
        specialties: ["Premium Surplus", "Shirts", "Chinos"],
        rating: 4.4,
        reviewCount: 345,
      },
      {
        name: "Toit Lane Boutiques",
        tag: "Boutique",
        desc: "Several small unnamed boutiques in the lanes near Toit sell unique aesthetic pieces.",
        mapLink: "https://maps.google.com/?cid=1574236887953402680",
        location: { id: "indiranagar", label: "Indiranagar" },
        specialties: ["Boutique", "Unique", "Aesthetic"],
        rating: 4.3,
        reviewCount: 156,
      },
    ],
  },
];

export function getShopSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getShopBySlug(
  slug: string
): { shop: Shop; locationLabel: string } | null {
  for (const location of shoppingData) {
    for (const shop of location.shops) {
      if (getShopSlug(shop.name) === slug) {
        return { shop, locationLabel: location.label };
      }
    }
  }
  return null;
}

export function getAllShops(): Shop[] {
  return shoppingData.flatMap((location) => location.shops);
}

export function getShopsByTag(tag: string): Shop[] {
  return getAllShops().filter(
    (shop) => shop.tag.toLowerCase() === tag.toLowerCase()
  );
}

export function searchShops(query: string): Shop[] {
  const lowerQuery = query.toLowerCase();
  return getAllShops().filter(
    (shop) =>
      shop.name.toLowerCase().includes(lowerQuery) ||
      shop.desc.toLowerCase().includes(lowerQuery) ||
      shop.tag.toLowerCase().includes(lowerQuery) ||
      shop.specialties?.some((s) => s.toLowerCase().includes(lowerQuery))
  );
}

