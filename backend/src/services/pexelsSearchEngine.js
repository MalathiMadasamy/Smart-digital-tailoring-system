const https = require('https');

// 1. SMART SEARCH QUERY NORMALIZATION MAP
const QUERY_NORMALIZATION_MAP = {
  chudidar: 'chudidar',
  churidar: 'chudidar',
  salwar: 'chudidar',
  'salwar suit': 'chudidar',
  'salwar kameez': 'chudidar',
  blouse: 'blouse',
  blouses: 'blouse',
  saree: 'saree',
  sari: 'saree',
  sarees: 'saree',
  kurti: 'kurti',
  kurtis: 'kurti',
  lehenga: 'lehenga',
  lehengas: 'lehenga',
  pavadai: 'pavadai',
  'pavadai thavani': 'pavadai thavani',
  frock: 'girls frock',
  'girls frock': 'girls frock',
  'kids frock': 'girls frock',
  kurta: 'men kurta',
  'men kurta': 'men kurta',
  'boys kurta': 'boys kurta',
  shirt: 'men shirt',
  'men shirt': 'men shirt',
  blazer: 'blazer',
  'men blazer': 'blazer',
  suit: 'formal suit',
  'formal suit': 'formal suit',
};

// 2. QUERY EXPANSION DICTIONARY FOR HIGH RELEVANCE
const QUERY_EXPANSION_MAP = {
  chudidar: ['women chudidar', 'women salwar suit', 'Indian salwar kameez', 'women churidar suit', 'Indian ethnic women suit'],
  blouse: ['women saree blouse', 'designer blouse', 'Indian blouse', 'saree blouse top'],
  saree: ['Indian women saree', 'women designer saree', 'silk saree indian', 'traditional saree'],
  kurti: ['women kurti', 'indian kurti dress', 'women tunic kurti', 'women ethnic kurti'],
  lehenga: ['women lehenga choli', 'Indian lehenga', 'bridal lehenga'],
  pavadai: ['pavadai', 'girls pattu pavadai', 'traditional pavadai dress'],
  'pavadai thavani': ['pavadai thavani', 'half saree pavadai thavani', 'south indian half saree'],
  'girls frock': ['girls frock', 'kids frock', 'kids girl party dress', 'little girl festive dress'],
  'boys kurta': ['boys kurta', 'kids kurta', 'kids boy traditional kurta'],
  'men kurta': ['men kurta', 'Indian men kurta', 'men ethnic kurta pyjama'],
  'men shirt': ['men shirt', 'men formal shirt', 'men dress shirt'],
  blazer: ['men blazer', 'men formal blazer', 'men suit blazer'],
  'formal suit': ['men formal suit', 'men sherwani', 'men 2 piece suit'],
};

// 3. CATEGORY SPECIFIC DEFAULT QUERIES
const CATEGORY_DEFAULT_QUERIES = {
  Women: ['women blouse', 'designer blouse', 'Indian women saree', 'women chudidar', 'women salwar suit', 'women kurti', 'Indian lehenga'],
  Men: ['men shirt', 'men kurta', 'Indian men kurta', 'men blazer', 'men formal suit', 'men sherwani', 'men dhoti'],
  Kids: ['girls frock', 'kids frock', 'boys kurta', 'kids kurta', 'kids traditional wear', 'kids ethnic dress'],
  Traditional: ['Indian traditional saree', 'Indian blouse', 'pavadai thavani', 'Indian lehenga', 'men sherwani', 'men kurta traditional'],
};

// In-Memory Search Cache (query + category + page -> results)
const searchCache = new Map();

function fetchPexelsRaw(query, page, perPage, apiKey) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      headers: {
        Authorization: apiKey,
      },
    };

    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed.photos || []);
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

function mapPhotoToProduct(photo, searchQuery, categoryHint) {
  const lowerQ = searchQuery.toLowerCase();
  let cat = categoryHint || 'Women';
  let gender = 'Female';

  if (cat === 'Men' || lowerQ.includes('men') || lowerQ.includes('boy') || lowerQ.includes('blazer') || lowerQ.includes('formal suit') || lowerQ.includes('sherwani')) {
    if (lowerQ.includes('boy') || cat === 'Kids') {
      cat = 'Kids';
      gender = 'Kids';
    } else {
      cat = 'Men';
      gender = 'Male';
    }
  } else if (cat === 'Kids' || lowerQ.includes('girl') || lowerQ.includes('kids') || lowerQ.includes('frock')) {
    cat = 'Kids';
    gender = 'Kids';
  } else if (cat === 'Traditional' || lowerQ.includes('traditional') || lowerQ.includes('saree') || lowerQ.includes('lehenga') || lowerQ.includes('pavadai')) {
    cat = 'Traditional';
    gender = 'Female';
  }

  const cleanAlt = photo.alt && photo.alt.length > 5 && !photo.alt.toLowerCase().includes('pexels')
    ? photo.alt
    : `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Bespoke Outfit`;

  return {
    id: `pexels-${photo.id}`,
    photoId: photo.id,
    name: cleanAlt,
    category: cat,
    subcategory: searchQuery,
    department: cat,
    subCategory: searchQuery,
    gender: gender,
    fabric: 'Custom Tailored Premium Silk / Cotton',
    price: 1299 + (photo.id % 35) * 50,
    rating: +(4.6 + (photo.id % 5) * 0.08).toFixed(1),
    reviewsCount: 20 + (photo.id % 50),
    imgUrl: photo.src.large || photo.src.medium,
    photographer: photo.photographer || 'Pexels Fashion Contributor',
    pexelsUrl: photo.url,
    source: 'Pexels',
    attribution: 'Photos provided by Pexels',
  };
}

async function searchPexelsFashion({ query = 'blouse', category, page = 1, perPage = 20, apiKey, excludeIds = [] }) {
  const rawQ = (query || 'blouse').toLowerCase().trim();
  const normalizedKey = QUERY_NORMALIZATION_MAP[rawQ] || rawQ;

  const cacheKey = `${normalizedKey}_cat_${category || 'All'}_p${page}_pp${perPage}_ex${excludeIds.length}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  let searchQueries = [];
  if (QUERY_EXPANSION_MAP[normalizedKey]) {
    searchQueries = QUERY_EXPANSION_MAP[normalizedKey];
  } else if (category && CATEGORY_DEFAULT_QUERIES[category]) {
    searchQueries = CATEGORY_DEFAULT_QUERIES[category];
  } else {
    searchQueries = [`women ${normalizedKey}`, `indian ${normalizedKey}`, normalizedKey];
  }

  const pool = [];
  const usedPhotoIds = new Set(excludeIds.map(Number));
  const usedImageUrls = new Set();

  for (const qTerm of searchQueries) {
    const photos = await fetchPexelsRaw(qTerm, page, 80, apiKey);

    for (const photo of photos) {
      if (!photo || !photo.id || !photo.src) continue;
      const imgUrl = photo.src.large || photo.src.medium;

      if (usedPhotoIds.has(photo.id) || usedImageUrls.has(imgUrl)) {
        continue;
      }

      usedPhotoIds.add(photo.id);
      usedImageUrls.add(imgUrl);

      pool.push(mapPhotoToProduct(photo, normalizedKey, category));
    }

    if (pool.length >= perPage * 2) break;
  }

  if (pool.length < perPage) {
    const backupPhotos = await fetchPexelsRaw(searchQueries[0], page + 1, 80, apiKey);
    for (const photo of backupPhotos) {
      if (!photo || !photo.id || !photo.src) continue;
      const imgUrl = photo.src.large || photo.src.medium;

      if (usedPhotoIds.has(photo.id) || usedImageUrls.has(imgUrl)) continue;

      usedPhotoIds.add(photo.id);
      usedImageUrls.add(imgUrl);

      pool.push(mapPhotoToProduct(photo, normalizedKey, category));
      if (pool.length >= perPage) break;
    }
  }

  const results = pool.slice(0, perPage);

  const responsePayload = {
    success: true,
    query: normalizedKey,
    category: category || 'All',
    page: Number(page),
    perPage: Number(perPage),
    totalResults: Math.max(pool.length, 20),
    attribution: 'Photos provided by Pexels',
    products: results,
  };

  searchCache.set(cacheKey, responsePayload);
  return responsePayload;
}

module.exports = {
  searchPexelsFashion,
  QUERY_NORMALIZATION_MAP,
  QUERY_EXPANSION_MAP,
};
