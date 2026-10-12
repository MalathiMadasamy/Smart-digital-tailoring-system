/*
 * ============================================================================
 *  PEXELS IMAGE SERVICE — 100% WOMEN-ONLY SMART TAILORING COLLECTION
 * ============================================================================
 *  Features:
 *   - Directly uses import.meta.env.VITE_PEXELS_API_KEY
 *   - Authorization Header: `Authorization: API_KEY` (No "Bearer")
 *   - 20 Women-Only tailored categories mapped to specific search queries
 *   - Orientation: portrait
 *   - Automatic rejection of men's & kids' fashion terms
 *   - In-memory caching per query & page to avoid duplicate network calls
 *   - Seamless fallback to curated offline Women-Only fashion data if offline,
 *     rate-limited (429), or missing API key. NEVER crashes the UI.
 *   - Includes proper Pexels attribution.
 * ============================================================================
 */

import { ALL_PRODUCTS } from '../data/dresses.js';

const PEXELS_ENDPOINT = 'https://api.pexels.com/v1/search';
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || 'hApUmZs0yh00fZ9Gw14XE4v1i2ATAXuno4Y0HZDSGHAQK8KK3sgP5noT';

// 20 WOMEN-ONLY TAILORING DRESS CATEGORIES & SPECIFIC SEARCH QUERIES
export const WOMEN_PEXELS_CATEGORIES = {
  'Designer Blouse': 'women designer blouse',
  'Bridal Blouse': 'women bridal blouse',
  'Saree Blouse': 'women saree blouse',
  'Pavadai': 'women pavadai',
  'Pavadai Thavani': 'women half saree',
  'Half Saree': 'women half saree',
  'Chudidar': 'women chudidar',
  'Salwar': 'women salwar suit',
  'Anarkali': 'women anarkali',
  'Lehenga': 'women lehenga',
  'Kurti': 'women kurti',
  'Frock': 'women frock',
  'Gown': 'women gown',
  'Maxi Dress': 'women maxi dress',
  'Party Wear': 'women party wear gown',
  'Office Wear': 'women office wear kurti',
  'Bridal Wear': 'women bridal wear',
  'Wedding Wear': 'women wedding wear',
  'Reception Wear': 'women reception gown',
  'Festival Wear': 'women festival wear',
};

// In-memory cache for API query results
const imageCache = new Map();

// Terms to reject non-women / non-apparel images
const REJECT_KEYWORDS = [
  'man', 'men', 'boy', 'boys', 'male', 'groom', 'guy', 'child', 'baby', 'kid',
  'hanger', 'rack', 'flat lay', 'illustration', 'cartoon', 'icon'
];

function isWomenFashionRelevant(alt = '', title = '') {
  const combined = (alt + ' ' + title).toLowerCase();
  return !REJECT_KEYWORDS.some((kw) => combined.includes(kw));
}

// Fallback image provider when network or API fails
export function getFallbackWomenPhotos(categoryName = 'Women') {
  const categoryClean = (categoryName || '').toLowerCase();
  const matched = ALL_PRODUCTS.filter(
    (p) =>
      p.gender !== 'Male' &&
      p.category !== 'Men' &&
      p.category !== 'Kids' &&
      (categoryClean === 'all' ||
        (p.name && p.name.toLowerCase().includes(categoryClean)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(categoryClean)) ||
        (p.category && p.category.toLowerCase().includes(categoryClean)))
  );

  const list = matched.length > 0 ? matched : ALL_PRODUCTS.filter((p) => p.gender !== 'Male' && p.category !== 'Men');

  return list.map((item, idx) => ({
    id: `fallback-${item.id}-${idx}`,
    name: item.name,
    category: item.category || 'Traditional Wear',
    subcategory: item.subcategory || item.category,
    price: item.price,
    rating: item.rating,
    fabric: item.fabric,
    imgUrl: item.imgUrl,
    photographer: 'DigiTailor Curated Fashion',
    pexelsUrl: 'https://www.pexels.com',
    source: 'Curated Fallback',
    attribution: 'Photos provided by Pexels',
  }));
}

/**
 * Main Reusable Pexels Image Service Helper
 * @param {string} categoryOrQuery - Category name or search keyword
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 15)
 * @returns {Promise<Object>} Search result payload with products array
 */
export async function fetchPexelsImages(categoryOrQuery = 'Designer Blouse', page = 1, perPage = 15) {
  const cleanCategory = (categoryOrQuery || 'Designer Blouse').trim();
  const searchQuery = WOMEN_PEXELS_CATEGORIES[cleanCategory] || `women ${cleanCategory}`;
  const cacheKey = `pexels_${cleanCategory}_p${page}_pp${perPage}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  if (!PEXELS_API_KEY) {
    const fallbackPayload = {
      success: true,
      query: searchQuery,
      source: 'fallback',
      attribution: 'Photos provided by Pexels',
      products: getFallbackWomenPhotos(cleanCategory),
    };
    imageCache.set(cacheKey, fallbackPayload);
    return fallbackPayload;
  }

  try {
    const response = await fetch(
      `${PEXELS_ENDPOINT}?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage * 2}&orientation=portrait`,
      {
        headers: {
          Authorization: PEXELS_API_KEY, // Send API key directly, NO "Bearer" prefix
        },
      }
    );

    if (!response.ok) {
      console.warn(`[Pexels Service] API HTTP ${response.status} for query "${searchQuery}". Using curated fallbacks.`);
      const fallbackPayload = {
        success: true,
        query: searchQuery,
        source: 'fallback',
        attribution: 'Photos provided by Pexels',
        products: getFallbackWomenPhotos(cleanCategory),
      };
      imageCache.set(cacheKey, fallbackPayload);
      return fallbackPayload;
    }

    const data = await response.json();
    const photos = data.photos || [];

    const mappedProducts = photos
      .filter((p) => isWomenFashionRelevant(p.alt, p.photographer))
      .slice(0, perPage)
      .map((photo, idx) => ({
        id: `pexels-${photo.id}`,
        photoId: photo.id,
        name: photo.alt && photo.alt.length > 5 ? photo.alt : `Bespoke Women's ${cleanCategory} Design`,
        category: 'Women',
        subcategory: cleanCategory,
        department: 'Women',
        subCategory: cleanCategory,
        gender: 'Female',
        fabric: 'Custom Tailored Silk / Cotton / Velvet',
        price: 1299 + (photo.id % 40) * 50,
        rating: +(4.6 + (photo.id % 5) * 0.08).toFixed(1),
        reviewsCount: 20 + (photo.id % 50),
        imgUrl: photo.src?.large || photo.src?.portrait || photo.src?.medium,
        photographer: photo.photographer || 'Pexels Contributor',
        pexelsUrl: photo.url || 'https://www.pexels.com',
        source: 'Pexels API',
        attribution: 'Photos provided by Pexels',
      }));

    const finalProducts = mappedProducts.length > 0 ? mappedProducts : getFallbackWomenPhotos(cleanCategory);

    const payload = {
      success: true,
      query: searchQuery,
      source: mappedProducts.length > 0 ? 'pexels' : 'fallback',
      totalResults: data.total_results || finalProducts.length,
      attribution: 'Photos provided by Pexels',
      products: finalProducts,
    };

    imageCache.set(cacheKey, payload);
    return payload;
  } catch (err) {
    console.warn('[Pexels Service] Exception encountered during fetch:', err.message);
    const fallbackPayload = {
      success: true,
      query: searchQuery,
      source: 'fallback',
      attribution: 'Photos provided by Pexels',
      products: getFallbackWomenPhotos(cleanCategory),
    };
    imageCache.set(cacheKey, fallbackPayload);
    return fallbackPayload;
  }
}

/**
 * Clear in-memory cache for refreshing images
 */
export function clearImageCache() {
  imageCache.clear();
}

export default {
  fetchPexelsImages,
  getFallbackWomenPhotos,
  clearImageCache,
  WOMEN_PEXELS_CATEGORIES,
};
