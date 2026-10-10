/*
 * ============================================================================
 *  WOMEN-ONLY SMART TAILORING SYSTEM — CORE MASTER DATA & SCHEMAS
 * ============================================================================
 */

// 1. WOMEN'S DRESS CATEGORIES STRUCTURED BY OCCASION & STYLE
export const WOMEN_DRESS_CATEGORIES = {
  traditional: [
    'Saree Blouse',
    'Designer Blouse',
    'Pavadai',
    'Pavadai Thavani',
    'Half Saree',
    'Chudidar',
    'Salwar Suit',
    'Anarkali',
    'Lehenga',
  ],
  modern: [
    'Kurti',
    'Frock',
    'Maxi Dress',
    'Gown',
    'Party Wear',
    'Office Wear',
  ],
  specialOccasion: [
    'Bridal Blouse',
    'Bridal Wear',
    'Wedding Wear',
    'Reception Wear',
    'Festival Wear',
  ],
};

export const ALL_WOMEN_CATEGORIES = [
  ...WOMEN_DRESS_CATEGORIES.traditional,
  ...WOMEN_DRESS_CATEGORIES.modern,
  ...WOMEN_DRESS_CATEGORIES.specialOccasion,
];

// 2. EMBROIDERY DESIGNER MODULE
export const EMBROIDERY_DESIGNERS = [
  {
    id: 'emb-aari-1',
    name: 'Master Lakshmi Aari Crafts',
    specialization: 'Aari Work & Peacock Motifs',
    rating: 4.9,
    reviewsCount: 128,
    portfolio: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
    ],
    startingPrice: 1200,
    estimatedTime: '3 - 4 Days',
    bio: 'Specialist in heavy bridal Aari threadwork, maggam work, and gold zari peacock motifs.',
  },
  {
    id: 'emb-zari-1',
    name: 'Sri Kanchi Zari Artisans',
    specialization: 'Pure Zari & Antique Gold Threading',
    rating: 5.0,
    reviewsCount: 154,
    portfolio: [
      'https://images.unsplash.com/photo-1610030469668-9669614742a7?w=600&h=780&fit=crop&auto=format',
      '/images/traditional/pavadai_thavani_blue_yellow.png',
    ],
    startingPrice: 1500,
    estimatedTime: '4 - 5 Days',
    bio: 'Handicrafting authentic Kanchipuram zari borders and traditional dhavani motifs.',
  },
  {
    id: 'emb-bridal-1',
    name: 'Royal Velvet Bridal Studio',
    specialization: 'Bridal Zardosi & Cutwork Velvet',
    rating: 5.0,
    reviewsCount: 198,
    portfolio: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
      '/images/traditional/silver_designer_lehenga.png',
    ],
    startingPrice: 2500,
    estimatedTime: '5 - 7 Days',
    bio: 'High-end bridal blouse and lehenga choli zardosi embroidery with pearl highlights.',
  },
  {
    id: 'emb-stone-1',
    name: 'Glitz Crystal & Stone Art',
    specialization: 'Swarovski Crystal & Mirror Stone Work',
    rating: 4.8,
    reviewsCount: 96,
    portfolio: [
      '/images/traditional/silver_designer_lehenga.png',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
    ],
    startingPrice: 1000,
    estimatedTime: '2 - 3 Days',
    bio: 'Dazzling stone embroidery for party wear gowns, reception lehengas, and designer blouses.',
  },
  {
    id: 'emb-thread-1',
    name: 'Silk Thread Needlework Studio',
    specialization: 'Multi-Color Silk Thread Floral Embroidery',
    rating: 4.9,
    reviewsCount: 84,
    portfolio: [
      'https://images.unsplash.com/photo-1741847639057-b51a25d42892?w=600&h=780&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552109870-dfa8590de1fb?w=600&h=780&fit=crop&auto=format',
    ],
    startingPrice: 800,
    estimatedTime: '2 - 3 Days',
    bio: 'Elegant pastel threadwork for office kurtis, festival salwar kameez, and soft silk blouses.',
  },
  {
    id: 'emb-bead-1',
    name: 'Pearl & Bead Couture',
    specialization: 'Hand-Stitched Pearl & Sequin Beadwork',
    rating: 4.8,
    reviewsCount: 72,
    portfolio: [
      'https://images.unsplash.com/photo-1761117228880-df2425bd70da?w=600&h=780&fit=crop&auto=format',
      '/images/traditional/purple_white_peplum_lehenga.jpg',
    ],
    startingPrice: 1100,
    estimatedTime: '3 - 4 Days',
    bio: 'Intricate pearl border piping, sequin accents, and beadwork for grand evening gowns.',
  },
];

// 3. SMART OCCASION-BASED RECOMMENDATIONS
export const OCCASION_RECOMMENDATIONS = {
  Wedding: {
    title: 'Wedding Wear Collection',
    desc: 'Grand Zardosi Blouses, Kanchipuram Silk Sarees & Heavy Lehengas.',
    recommendedDresses: ['Designer Blouse', 'Saree Blouse', 'Lehenga', 'Bridal Blouse'],
    work: 'Zari, Zardosi & Aari Heavy Work',
    fabric: 'Heavy Raw Silk, Kanchipuram Silk, Velvet',
  },
  Bridal: {
    title: 'Bridal Couture Collection',
    desc: 'Custom Bridal Blouses with Latkan, Multi-Kalas Lehengas & Heavy Zardosi.',
    recommendedDresses: ['Bridal Blouse', 'Bridal Wear', 'Lehenga', 'Designer Blouse'],
    work: 'Royal Zardosi, Swarovski Stone & Maggam Work',
    fabric: 'Bridal Velvet, Tissue Silk, Heavy Mulberry Silk',
  },
  Reception: {
    title: 'Reception & Evening Wear',
    desc: 'Glamorous Evening Gowns, Peplum Lehengas & Cutwork Velvet Blouses.',
    recommendedDresses: ['Gown', 'Reception Wear', 'Party Wear', 'Designer Blouse'],
    work: 'Mirror Embroidery, Sequin Glitz & Pearl Beads',
    fabric: 'Silk Georgette, Micro Velvet, Net & Satin',
  },
  Festival: {
    title: 'Festive Traditional Wear',
    desc: 'Pavadai Thavani Half Sarees, Anarkalis & Zari Chudidars.',
    recommendedDresses: ['Pavadai Thavani', 'Pavadai', 'Anarkali', 'Salwar Suit', 'Festival Wear'],
    work: 'Traditional Gold Zari & Threadwork',
    fabric: 'Art Silk, Chanderi Cotton, Jacquard',
  },
  Party: {
    title: 'Party & Cocktail Wear',
    desc: 'Designer Frocks, Maxi Gowns & Chic Sweetheart Neck Tops.',
    recommendedDresses: ['Frock', 'Maxi Dress', 'Party Wear', 'Kurti'],
    work: 'Modern Sequin Accents & Lace Trim',
    fabric: 'Organza, Satin, Chiffon',
  },
  Office: {
    title: 'Office & Work Wear',
    desc: 'Comfortable Cotton Kurtis, Minimal Salwar Kameez & Crisp Fit Trousers.',
    recommendedDresses: ['Kurti', 'Office Wear', 'Salwar Suit', 'Chudidar'],
    work: 'Subtle Neckline Threadwork & Solid Piping',
    fabric: 'Breathable Rayon, Pure Cotton, Khadi Silk',
  },
  Casual: {
    title: 'Daily Casual Wear',
    desc: 'Easy-breathe Kurtis, Casual Frocks & Simple Cotton Tops.',
    recommendedDresses: ['Kurti', 'Frock', 'Salwar Suit'],
    work: 'Printed Linen & Minimal Stitching',
    fabric: 'Soft Cotton, Rayon Blend',
  },
};

// 1B. FULL TAILORING SERVICES CATEGORIZATION FOR WOMEN TAILORING SHOP
export const TAILORING_SERVICES_CATEGORIES = [
  {
    category: "QUICK TAILORING & MICRO SERVICES (ரூ 10 SERVICES)",
    icon: "✂️",
    services: [
      { name: "Saree Mundhi Hemming (சாரி முந்தி அடித்தல்)", price: 10, desc: "Quick edge fold hemming & stitching for saree pallu/mundhi." },
      { name: "Chudidhar / Blouse Side Fitting", price: 10, desc: "Quick side seam alteration & re-fitting for blouse or kurti." },
      { name: "Hook & Eye / Button Fixing", price: 10, desc: "Hand-attaching missing blouse hooks, press buttons or loops." },
      { name: "Zigzag Pallu End Finishing", price: 10, desc: "Neat machine zigzag stitching for unstitched saree ends." },
      { name: "Saree Inner Skirt / InsKirt", price: 150, desc: "6-panel / 8-panel cotton saree inner skirt stitching." },
    ]
  },
  {
    category: "BLOUSE STITCHING",
    icon: "🪡",
    services: [
      { name: "Simple Blouse", price: 500, desc: "Classic plain blouse stitching with perfect fit and lining." },
      { name: "Designer Blouse", price: 800, desc: "Custom neck, sleeve & back designs with piping details." },
      { name: "Bridal Blouse", price: 1500, desc: "Heavy zardosi, maggam & Aari handwork for weddings." },
      { name: "Padded Blouse", price: 900, desc: "Built-in cup padding for seamless saree silhouette." },
      { name: "Princess Cut Blouse", price: 850, desc: "Elegant princess seam tailoring for grand support." },
    ]
  },
  {
    category: "WOMEN'S DRESS STITCHING",
    icon: "👗",
    services: [
      { name: "Petticoat / Inner Skirt", price: 350, desc: "Custom cotton 6-panel or 8-panel saree petticoat." },
      { name: "Pavadai", price: 700, desc: "Traditional silk pavadai skirt and choli for girls & women." },
      { name: "Pavadai Thavani / Half Saree", price: 1400, desc: "Pleated skirt, choli blouse & voni drape set." },
      { name: "Chudidar / Salwar Suit", price: 900, desc: "3-piece kameez, churidar bottom & dupatta set." },
      { name: "Anarkali Gown", price: 1400, desc: "Full flared floor-length Anarkali suit stitching." },
      { name: "Lehenga Choli", price: 1800, desc: "Multi-kalis flare skirt, choli blouse & dupatta set." },
      { name: "Kurti / Tunic", price: 500, desc: "Daily wear or office wear straight/A-line kurti." },
      { name: "Frock / Indo-Western", price: 800, desc: "Layered flared frock with lining and sleeve options." },
      { name: "Evening Gown", price: 1600, desc: "Couture satin/net floor-sweeping maxi gown." },
    ]
  },
  {
    category: "SAREE SERVICES",
    icon: "🥻",
    services: [
      { name: "Saree Fall", price: 150, desc: "Hand-stitched premium cotton saree fall border." },
      { name: "Saree Pico", price: 100, desc: "Machine zigzag edge finishing for saree ends." },
      { name: "Saree Fall & Pico Combo", price: 220, desc: "Complete saree fall attachment and edge pico." },
      { name: "Saree Border Work", price: 800, desc: "Custom border attachment or embroidered border." },
      { name: "Saree Mundhi Work", price: 900, desc: "Heavy pallu/mundhi embroidery and tassel latkan." },
      { name: "Full Saree Embroidery", price: 2200, desc: "All-over saree booti embroidery and zardosi work." },
    ]
  },
  {
    category: "EMBROIDERY & DESIGN WORK",
    icon: "✨",
    services: [
      { name: "Aari Work", price: 1200, desc: "Intricate traditional needle Aari handwork motifs." },
      { name: "Zari Work", price: 1500, desc: "Pure metallic gold/silver thread zari embroidery." },
      { name: "Stone Work", price: 1000, desc: "Swarovski crystal & glass mirror stone embedding." },
      { name: "Bead Work", price: 1100, desc: "Hand-stitched pearl, tube & seed bead embellishments." },
      { name: "Thread Embroidery", price: 800, desc: "Multi-color silk thread floral & peacock work." },
      { name: "Sequin Glitz Work", price: 900, desc: "Dazzling metallic sequin party wear accents." },
    ]
  },
  {
    category: "CUSTOM REQUEST",
    icon: "🎨",
    services: [
      { name: "Upload My Design", price: 800, desc: "Stitch directly from your Pinterest/Instagram reference." },
      { name: "Stitch Like My Existing Dress", price: 800, desc: "Replicate exact fit of your sample fitting dress." },
      { name: "Bring My Own Fabric", price: 0, desc: "Submit your unstitched cloth at workshop or pickup." },
      { name: "Special Stitching Request", price: 500, desc: "Custom alterations, re-fitting & bespoke styling." },
    ]
  }
];

// 4. SMART DRESS-SPECIFIC MEASUREMENT SCHEMAS (INNOVATION)
export const DRESS_SPECIFIC_MEASUREMENTS_SCHEMA = {
  'Simple Blouse': [
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'underBust', label: 'Under Bust (Inches)', placeholder: '30' },
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '10' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14' },
    { key: 'frontNeckDepth', label: 'Front Neck Depth (Inches)', placeholder: '7' },
    { key: 'backNeckDepth', label: 'Back Neck Depth (Inches)', placeholder: '9' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
  ],
  'Saree Blouse': [
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'underBust', label: 'Under Bust (Inches)', placeholder: '30' },
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '10' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14' },
    { key: 'frontNeckDepth', label: 'Front Neck Depth (Inches)', placeholder: '7' },
    { key: 'backNeckDepth', label: 'Back Neck Depth (Inches)', placeholder: '9' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
  ],
  'Designer Blouse': [
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'underBust', label: 'Under Bust (Inches)', placeholder: '30' },
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '10' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14' },
    { key: 'frontNeckDepth', label: 'Front Neck Depth (Inches)', placeholder: '7' },
    { key: 'backNeckDepth', label: 'Back Neck Depth (Inches)', placeholder: '9.5' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
  ],
  'Bridal Blouse': [
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'underBust', label: 'Under Bust (Inches)', placeholder: '30' },
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '11' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14.5' },
    { key: 'frontNeckDepth', label: 'Front Neck Depth (Inches)', placeholder: '7' },
    { key: 'backNeckDepth', label: 'Back Neck Depth (Inches)', placeholder: '10' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
  ],
  'Petticoat / Inner Skirt': [
    { key: 'waist', label: 'Waist Round (Inches)', placeholder: '30' },
    { key: 'hip', label: 'Hip Round (Inches)', placeholder: '38' },
    { key: 'skirtLength', label: 'Petticoat Length (Inches)', placeholder: '38' },
    { key: 'bottomFlare', label: 'Bottom Flare Round (Inches)', placeholder: '60' },
  ],
  'Saree Border / Mundhi Work': [
    { key: 'workArea', label: 'Work Area (Only Border / Only Mundhi / Border + Mundhi / Full Saree)', placeholder: 'Border + Mundhi' },
    { key: 'sareeLength', label: 'Saree Length (Meters)', placeholder: '5.5' },
  ],
  'Chudidar': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '15' },
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '31' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '39' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '17' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '16' },
    { key: 'topLength', label: 'Top Length (Kameez) (Inches)', placeholder: '42' },
    { key: 'bottomLength', label: 'Bottom Length (Chudidar) (Inches)', placeholder: '40' },
    { key: 'ankle', label: 'Ankle Round (Inches)', placeholder: '10' },
  ],
  'Salwar Suit': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '15' },
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '31' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '39' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '17' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '16' },
    { key: 'topLength', label: 'Top Length (Inches)', placeholder: '40' },
    { key: 'bottomLength', label: 'Salwar Bottom Length (Inches)', placeholder: '38' },
    { key: 'ankle', label: 'Ankle Round (Inches)', placeholder: '12' },
  ],
  'Anarkali': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '15' },
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '31' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '39' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16.5' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '18' },
    { key: 'topLength', label: 'Anarkali Flare Length (Inches)', placeholder: '52' },
    { key: 'neckDepth', label: 'Front Neck Depth (Inches)', placeholder: '7' },
  ],
  'Gown': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '15' },
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '38' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '18' },
    { key: 'gownLength', label: 'Gown Full Length (Inches)', placeholder: '56' },
    { key: 'neckDepth', label: 'Neck Depth (Inches)', placeholder: '7.5' },
    { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16.5' },
  ],
  'Frock': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'chest', label: 'Chest / Bust (Inches)', placeholder: '34' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '29' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '36' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '8' },
    { key: 'frockLength', label: 'Frock Length (Inches)', placeholder: '44' },
    { key: 'neckDepth', label: 'Neck Depth (Inches)', placeholder: '6.5' },
  ],
  'Kurti': [
    { key: 'shoulder', label: 'Shoulder Width (Inches)', placeholder: '14.5' },
    { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
    { key: 'waist', label: 'Waist (Inches)', placeholder: '31' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '39' },
    { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '15' },
    { key: 'kurtiLength', label: 'Kurti Length (Inches)', placeholder: '44' },
    { key: 'neckDepth', label: 'Neck Depth (Inches)', placeholder: '7' },
  ],
  'Lehenga': [
    { key: 'waist', label: 'Lehenga Waist (Inches)', placeholder: '30' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '38' },
    { key: 'lehengaLength', label: 'Lehenga Skirt Length (Inches)', placeholder: '42' },
    { key: 'waistband', label: 'Waistband Round (Inches)', placeholder: '31' },
    { key: 'bust', label: 'Blouse Bust (Inches)', placeholder: '36' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14' },
    { key: 'dupattaLength', label: 'Dupatta Length (Meters)', placeholder: '2.5' },
  ],
  'Pavadai': [
    { key: 'waist', label: 'Skirt Waist (Inches)', placeholder: '28' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '36' },
    { key: 'skirtLength', label: 'Pavadai Skirt Length (Inches)', placeholder: '38' },
    { key: 'waistband', label: 'Waistband Round (Inches)', placeholder: '29' },
    { key: 'bust', label: 'Choli Blouse Bust (Inches)', placeholder: '34' },
    { key: 'blouseLength', label: 'Choli Blouse Length (Inches)', placeholder: '13.5' },
  ],
  'Pavadai Thavani': [
    { key: 'waist', label: 'Pavadai Skirt Waist (Inches)', placeholder: '29' },
    { key: 'hip', label: 'Hip (Inches)', placeholder: '37' },
    { key: 'skirtLength', label: 'Skirt Length (Inches)', placeholder: '40' },
    { key: 'waistband', label: 'Waistband Round (Inches)', placeholder: '30' },
    { key: 'bust', label: 'Blouse Bust (Inches)', placeholder: '35' },
    { key: 'blouseLength', label: 'Blouse Length (Inches)', placeholder: '14' },
    { key: 'dupattaLength', label: 'Dhavani Length (Meters)', placeholder: '2.25' },
  ],
};

// Default fallback schema
export const DEFAULT_MEASUREMENT_SCHEMA = [
  { key: 'bust', label: 'Bust (Inches)', placeholder: '36' },
  { key: 'waist', label: 'Waist (Inches)', placeholder: '30' },
  { key: 'hip', label: 'Hip (Inches)', placeholder: '38' },
  { key: 'shoulder', label: 'Shoulder (Inches)', placeholder: '14.5' },
  { key: 'sleeveLength', label: 'Sleeve Length (Inches)', placeholder: '10' },
  { key: 'armhole', label: 'Armhole (Inches)', placeholder: '16' },
  { key: 'blouseLength', label: 'Top / Blouse Length (Inches)', placeholder: '14' },
  { key: 'neckDepth', label: 'Neck Depth (Inches)', placeholder: '7' },
];

// Helper to get schema for a dress category name
export function getMeasurementSchemaForDress(dressNameOrCategory = '') {
  if (!dressNameOrCategory) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Saree Blouse'];
  const clean = dressNameOrCategory.toLowerCase();

  for (const [catName, schema] of Object.entries(DRESS_SPECIFIC_MEASUREMENTS_SCHEMA)) {
    if (clean.includes(catName.toLowerCase())) {
      return schema;
    }
  }

  if (clean.includes('blouse')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Saree Blouse'];
  if (clean.includes('salwar') || clean.includes('chudi')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Chudidar'];
  if (clean.includes('lehenga')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Lehenga'];
  if (clean.includes('pavadai') || clean.includes('half saree')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Pavadai Thavani'];
  if (clean.includes('gown')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Gown'];
  if (clean.includes('frock')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Frock'];
  if (clean.includes('kurti')) return DRESS_SPECIFIC_MEASUREMENTS_SCHEMA['Kurti'];

  return DEFAULT_MEASUREMENT_SCHEMA;
}

// 5. 14-STAGE REAL TAILORING WORKFLOW STAGES
export const TAILORING_STATUSES = [
  'ORDER RECEIVED',
  'MEASUREMENT TAKEN',
  'DESIGN CONFIRMED',
  'FABRIC RECEIVED',
  'CUTTING',
  'EMBROIDERY',
  'STITCHING',
  'READY FOR FITTING',
  'FITTING',
  'ALTERATION REQUIRED',
  'ALTERATION IN PROGRESS',
  'ALTERATION COMPLETED',
  'READY FOR DELIVERY',
  'COMPLETED',
];

export const REAL_TAILOR_WORKFLOW_STAGES = [
  { stage: 'ORDER RECEIVED', icon: '📝', title: '1. Order Received', desc: 'Customer tailoring order details received.' },
  { stage: 'MEASUREMENT TAKEN', icon: '📏', title: '2. Measurements Taken', desc: 'Dress-specific body profile recorded.' },
  { stage: 'DESIGN CONFIRMED', icon: '🎨', title: '3. Design Confirmed', desc: 'Neck, sleeve, pattern & embroidery finalized.' },
  { stage: 'FABRIC RECEIVED', icon: '🧵', title: '4. Fabric Received', desc: 'Customer unstitched cloth / boutique silk fabric inspected.' },
  { stage: 'CUTTING', icon: '✂️', title: '5. Cutting', desc: 'Master tailor pattern cutting in progress.' },
  { stage: 'EMBROIDERY', icon: '✨', title: '6. Embroidery', desc: 'Aari, Zari, Zardosi or stone work in progress.' },
  { stage: 'STITCHING', icon: '🪡', title: '7. Stitching', desc: 'Workshop tailoring assembly & lining attachment.' },
  { stage: 'READY FOR FITTING', icon: '👗', title: '8. Ready for Fitting', desc: 'Garment prepped for customer fitting session.' },
  { stage: 'FITTING', icon: '🔍', title: '9. Fitting Trial', desc: 'Trial fit session in progress with client.' },
  { stage: 'ALTERATION REQUIRED', icon: '✏️', title: '10. Alteration Required', desc: 'Fitting adjustments requested by client.' },
  { stage: 'ALTERATION IN PROGRESS', icon: '🔄', title: '11. Alteration In Progress', desc: 'Master tailor executing fitting adjustments.' },
  { stage: 'ALTERATION COMPLETED', icon: '✨', title: '12. Alteration Completed', desc: 'Fitting adjustments finalized & pressed.' },
  { stage: 'READY FOR DELIVERY', icon: '📦', title: '13. Ready for Delivery', desc: 'Garment packed and ready for delivery/pickup.' },
  { stage: 'COMPLETED', icon: '✅', title: '14. Completed', desc: 'Order delivered to customer and closed.' },
];

// 6. NEARBY LOCAL TAILORS NETWORK
export const NEARBY_TAILORS = [
  {
    id: 'tlr-1',
    name: 'Master Rajesh Tailor Shop',
    shopName: 'Rajesh Craftsmen Studio',
    specialization: 'Blouse & Bridal Specialist',
    distance: '0.8 km (T. Nagar)',
    rating: 4.9,
    availability: 'Open Now (09:00 AM - 08:00 PM)',
    address: '14, Usman Road, T. Nagar, Chennai',
  },
  {
    id: 'tlr-2',
    name: 'Lakshmi Women Tailors',
    shopName: 'Lakshmi Couture & Aari Center',
    specialization: 'Aari & Zari Embroidery Specialist',
    distance: '1.4 km (Mylapore)',
    rating: 5.0,
    availability: 'Open Now (09:30 AM - 08:30 PM)',
    address: '28, Luz Church Road, Mylapore, Chennai',
  },
];

// 7. DRESS CATEGORY IMAGE & FABRIC MATERIAL RECOMMENDATION ENGINE
export const DRESS_CATEGORY_DETAILS_MAP = {
  'Saree Blouse': {
    category: 'Saree Blouse',
    title: 'Saree Blouse Stitching',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Raw Silk (1.0m)', 'Cotton Silk', 'Brocade Silk', 'Kanchipuram Tissue Silk'],
    lining: '100% Pure Cotton Canvas Lining • Soft Padded Cups • Golden Zari Piping',
    lengthReq: 'Blouse Fabric: 1.0 Meter • Lining: 1.0 Meter',
    fabricPriceEstimate: '₹250 - ₹600',
  },
  'Designer Blouse': {
    category: 'Designer Blouse',
    title: 'Designer Cutwork Blouse',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Dupion Silk (1.2m)', 'Organza Silk', 'Velvet Cutwork', 'Broached Silk'],
    lining: 'Premium Padded Cups • Heavy Cotton Lining • Designer Piping & Tassels',
    lengthReq: 'Blouse Fabric: 1.2 Meters • Lining: 1.2 Meters',
    fabricPriceEstimate: '₹350 - ₹850',
  },
  'Bridal Blouse': {
    category: 'Bridal Blouse',
    title: 'Bridal Aari Maggam Blouse',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Heavy Bridal Velvet (1.25m)', 'Kanchipuram Pure Zari Silk', 'Raw Silk'],
    lining: 'Double Stiffened Cotton Lining • Maggam Bust Padding • Swarovski Latkan',
    lengthReq: 'Blouse Fabric: 1.25 Meters • Lining: 1.25 Meters',
    fabricPriceEstimate: '₹650 - ₹1,500',
  },
  'Chudidar': {
    category: 'Chudidar',
    title: 'Chudidhar Suit & Bottom Fitting',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Chanderi Cotton Silk (2.5m Top)', 'Pure South Cotton', 'Georgette', 'Mulmul'],
    lining: 'Soft Butter Crepe Lining (2.0m) • Contrast Dupatta Piping & Hem Ribbon',
    lengthReq: 'Kameez Top: 2.5m • Bottom Chudidar: 2.0m • Dupatta: 2.25m',
    fabricPriceEstimate: '₹400 - ₹950',
  },
  'Salwar': {
    category: 'Salwar Suit',
    title: 'Patiala Salwar Kameez Set',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Punjabi Cotton Silk', 'Rayon Cotton', 'Crepe Silk', 'Printed Georgette'],
    lining: 'Pure Cotton Breathable Lining • Pleated Bottom Belt Stiffener',
    lengthReq: 'Kameez: 2.25m • Patiala Salwar Bottom: 3.0m • Dupatta: 2.25m',
    fabricPriceEstimate: '₹450 - ₹1,100',
  },
  'Pavadai': {
    category: 'Pavadai',
    title: 'Silk Pavadai (Skirt & Blouse)',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Kanchipuram Silk (2.5m)', 'Art Silk Border', 'Chanderi Tissue Silk'],
    lining: 'Cotton Satin Lining • Contrast Border Piping',
    lengthReq: 'Pavadai Skirt: 2.5m • Top Blouse: 0.8m',
    fabricPriceEstimate: '₹500 - ₹1,200',
  },
  'Pavadai Thavani': {
    category: 'Pavadai Thavani',
    title: 'Traditional Pavadai Thavani (Half Saree)',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Pure Kanchipuram Tissue Silk (3.0m)', 'Contrast Border Silk', 'Organza Voni'],
    lining: 'Cotton Satin Lining • Pleated Waist Stiffener Ribbon',
    lengthReq: 'Skirt: 3.0m • Blouse: 1.0m • Thavani/Voni: 2.5m',
    fabricPriceEstimate: '₹800 - ₹2,200',
  },
  'Half Saree': {
    category: 'Half Saree',
    title: 'Modern Floral Half Saree Set',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Kalamkari Silk (3.5m)', 'Floral Georgette', 'Banarasi Brocade'],
    lining: 'Butter Crepe Lining • Scallop Hem Piping Ribbon',
    lengthReq: 'Skirt: 3.5m • Blouse: 1.0m • Voni: 2.5m',
    fabricPriceEstimate: '₹750 - ₹1,800',
  },
  'Lehenga': {
    category: 'Lehenga',
    title: 'Festive Lehenga Choli',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Bridal Velvet (4.5m Flare)', 'Banarasi Silk', 'Sequin Net', 'Organza'],
    lining: 'Heavy Satin Lining • Double Can-Can Mesh Stiffener',
    lengthReq: 'Lehenga Flare: 4.5m • Choli: 1.0m • Dupatta: 2.5m',
    fabricPriceEstimate: '₹1,200 - ₹3,500',
  },
  'Anarkali': {
    category: 'Anarkali',
    title: 'Flared Anarkali Floor Length Gown',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Dupion Silk (4.0m Flare)', 'Georgette', 'Chiffon', 'Rayon'],
    lining: 'Full Length Butter Crepe Lining • Hemline Canvas Stiffener',
    lengthReq: 'Anarkali Gown: 4.0m • Churidar Bottom: 2.0m',
    fabricPriceEstimate: '₹850 - ₹2,000',
  },
  'Gown': {
    category: 'Gown',
    title: 'Indo-Western Reception Gown',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Satin Silk (4.5m)', 'Organza', 'Sequin Velvet', 'Georgette'],
    lining: 'Soft Satin Full Lining • Padded Bodice Cups',
    lengthReq: 'Gown Fabric: 4.5 Meters',
    fabricPriceEstimate: '₹950 - ₹2,500',
  },
  'Kurti': {
    category: 'Kurti',
    title: 'Daily & Designer Kurti / Top',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Rayon Cotton (2.25m)', 'Khadi Linen', 'Printed Cotton', 'Silk Cotton'],
    lining: 'Light Cotton Breathable Lining • Wooden Buttons',
    lengthReq: 'Kurti Fabric: 2.25 Meters',
    fabricPriceEstimate: '₹200 - ₹500',
  },
  'Frock': {
    category: 'Frock',
    title: 'Modern Western Frock Dress',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Printed Georgette (3.0m)', 'Cotton Satin', 'Linen'],
    lining: 'Soft Cotton Breathable Lining • Back Zip Closure',
    lengthReq: 'Frock Fabric: 3.0 Meters',
    fabricPriceEstimate: '₹350 - ₹750',
  },
  'Maxi Dress': {
    category: 'Maxi Dress',
    title: 'Relaxed Maxi Dress',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Mulmul Cotton (3.5m)', 'Georgette', 'Rayon'],
    lining: 'Full Length Light Cotton Lining',
    lengthReq: 'Maxi Fabric: 3.5 Meters',
    fabricPriceEstimate: '₹400 - ₹900',
  },
  'Party Wear': {
    category: 'Party Wear',
    title: 'Party Wear Sequin Outfit',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Sequin Net (4.0m)', 'Metallic Velvet', 'Silk Satin'],
    lining: 'Heavy Crepe Lining • Padded Bust Cups',
    lengthReq: 'Outfit Fabric: 4.0 Meters',
    fabricPriceEstimate: '₹1,000 - ₹2,800',
  },
  'Office Wear': {
    category: 'Office Wear',
    title: 'Formal Office Kurti & Trousers',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Formal Cotton Linen (4.0m)', 'Khadi Silk', 'Poly Cotton'],
    lining: 'Breathable Cotton Pocket Lining',
    lengthReq: 'Top: 2.0m • Trousers: 2.0m',
    fabricPriceEstimate: '₹450 - ₹950',
  },
  'Custom Dress': {
    category: 'Custom Dress',
    title: 'Custom Stitching Outfit',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=780&fit=crop&auto=format',
    fabrics: ['Customer Provided Fabric / Atelier Pure Silk Cotton'],
    lining: 'Matching Color Cotton / Crepe Lining',
    lengthReq: 'As per dress specification',
    fabricPriceEstimate: '₹300 - ₹800',
  }
};

export function getDressCategoryDetails(target) {
  if (!target) return DRESS_CATEGORY_DETAILS_MAP['Custom Dress'];
  const text = (typeof target === 'string' ? target : target.name || target.category || target.dressType || target.subcategory || '').toLowerCase();
  
  for (const [key, details] of Object.entries(DRESS_CATEGORY_DETAILS_MAP)) {
    if (text.includes(key.toLowerCase()) || key.toLowerCase().includes(text)) {
      return details;
    }
  }
  
  if (text.includes('blouse')) return DRESS_CATEGORY_DETAILS_MAP['Saree Blouse'];
  if (text.includes('chudi') || text.includes('chudidar') || text.includes('salwar')) return DRESS_CATEGORY_DETAILS_MAP['Chudidar'];
  if (text.includes('lehenga')) return DRESS_CATEGORY_DETAILS_MAP['Lehenga'];
  if (text.includes('pavadai') || text.includes('thavani') || text.includes('half saree')) return DRESS_CATEGORY_DETAILS_MAP['Pavadai Thavani'];
  if (text.includes('anarkali') || text.includes('gown')) return DRESS_CATEGORY_DETAILS_MAP['Anarkali'];
  if (text.includes('kurti') || text.includes('frock')) return DRESS_CATEGORY_DETAILS_MAP['Kurti'];

  return DRESS_CATEGORY_DETAILS_MAP['Custom Dress'];
}
