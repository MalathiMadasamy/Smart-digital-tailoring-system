import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const AuthContext = createContext(null);
const SHOP = 'Smart Tailor';
const STATUSES = ['Order Placed','Measurement Verified','Cutting','Stitching','Quality Check','Ready','Delivered','Cancelled'];
// ---- Real-world dress catalogue: grouped by Women's / Men's / Kids Wear ----
// Each category maps to a folder under src/assets/dresses/<slug>/ for real photo uploads (see IMAGE SYSTEM below).
const slugify=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const DRESS_CATALOG = [
 {category:'Saree',group:'Women',desc:'Traditional drape, perfect for festive & formal occasions',variants:[{name:'Cotton Saree',fabric:'Cotton',price:999},{name:'Silk Saree',fabric:'Silk',price:1499},{name:'Designer Saree',fabric:'Georgette',price:1999}]},
 {category:'Saree Blouse',group:'Women',desc:'Fitted blouse tailored to match your saree',variants:[{name:'Regular Blouse',fabric:'Cotton',price:499},{name:'Designer Blouse',fabric:'Silk',price:699},{name:'Bridal Blouse',fabric:'Velvet',price:999}]},
 {category:'Chudidar',group:'Women',desc:'Comfortable fitted bottom with matching top',variants:[{name:'Straight Chudidar',fabric:'Cotton',price:1099},{name:'Anarkali-Style Chudidar',fabric:'Georgette',price:1399},{name:'Party Wear Chudidar',fabric:'Silk',price:1699}]},
 {category:'Salwar Kameez',group:'Women',desc:'Classic loose-fit two-piece ethnic wear',variants:[{name:'Cotton Salwar Kameez',fabric:'Cotton',price:1199},{name:'Festive Salwar Kameez',fabric:'Silk',price:1699}]},
 {category:'Anarkali',group:'Women',desc:'Flowing floor-length festive silhouette',variants:[{name:'Silk Anarkali',fabric:'Silk',price:1699},{name:'Georgette Anarkali',fabric:'Georgette',price:1999},{name:'Designer Anarkali',fabric:'Net',price:2499}]},
 {category:'Kurti',group:'Women',desc:'Comfortable daily-wear straight kurti',variants:[{name:'Casual Kurti',fabric:'Cotton',price:699},{name:'Printed Kurti',fabric:'Rayon',price:899},{name:'Designer Kurti',fabric:'Silk',price:1299}]},
 {category:'Lehenga',group:'Women',desc:'Flared festive skirt set with dupatta',variants:[{name:'Silk Lehenga',fabric:'Silk',price:2499},{name:'Georgette Lehenga',fabric:'Georgette',price:2799},{name:'Bridal Lehenga',fabric:'Velvet',price:3999}]},
 {category:'Gown',group:'Women',desc:'Floor-length gown for special occasions',variants:[{name:'Evening Gown',fabric:'Chiffon',price:1999},{name:'Party Gown',fabric:'Satin',price:2299},{name:'Wedding Gown',fabric:'Net',price:3499}]},
 {category:'Skirt',group:'Women',desc:'Versatile flared everyday skirt',variants:[{name:'A-Line Skirt',fabric:'Cotton',price:799}]},
 {category:'Palazzo',group:'Women',desc:'Wide-leg relaxed fit bottom wear',variants:[{name:'Cotton Palazzo',fabric:'Cotton',price:699},{name:'Printed Palazzo',fabric:'Rayon',price:899}]},
 {category:'Crop Top',group:'Women',desc:'Trendy fitted crop top',variants:[{name:'Casual Crop Top',fabric:'Cotton',price:599}]},
 {category:'A-Line Dress',group:'Women',desc:'Flattering knee-length everyday dress',variants:[{name:'A-Line Dress',fabric:'Cotton',price:1199}]},
 {category:'Night Dress',group:'Women',desc:'Soft loose-fit relaxed nightwear',variants:[{name:'Comfort Night Dress',fabric:'Cotton',price:699}]},
 {category:'Formal Shirt',group:'Men',desc:'Office and occasion wear with crisp collar',variants:[{name:'Premium Formal Shirt',fabric:'Linen',price:1199}]},
 {category:'Casual Shirt',group:'Men',desc:'Relaxed everyday check or plain shirt',variants:[{name:'Weekend Casual Shirt',fabric:'Cotton',price:899}]},
 {category:'T-Shirt',group:'Men',desc:'Soft round-neck cotton t-shirt',variants:[{name:'Everyday T-Shirt',fabric:'Cotton',price:499}]},
 {category:'Formal Pant',group:'Men',desc:'Tailored straight-fit office trouser',variants:[{name:'Formal Trouser',fabric:'Cotton',price:999}]},
 {category:'Jeans',group:'Men',desc:'Durable everyday denim fit',variants:[{name:'Classic Denim Jeans',fabric:'Denim',price:1099}]},
 {category:'Kurta',group:'Men',desc:'Comfortable collarless festive kurta',variants:[{name:'Traditional Kurta',fabric:'Cotton',price:999}]},
 {category:'Sherwani',group:'Men',desc:'Regal embroidered wedding sherwani',variants:[{name:'Wedding Sherwani',fabric:'Silk',price:3499}]},
 {category:'Dhoti',group:'Men',desc:'Classic draped traditional wear',variants:[{name:'Traditional Dhoti',fabric:'Cotton',price:799}]},
 {category:'Blazer',group:'Men',desc:'Sharp fitted blazer for formal looks',variants:[{name:'Tailored Blazer',fabric:'Wool Blend',price:2199}]},
 {category:'Girls Frock',group:'Kids',desc:'Cute puff-sleeve party frock',variants:[{name:'Girls Party Frock',fabric:'Cotton',price:799}]},
 {category:'Girls Lehenga',group:'Kids',desc:'Festive mini lehenga for little ones',variants:[{name:'Girls Mini Lehenga',fabric:'Silk',price:1499}]},
 {category:'Boys Shirt',group:'Kids',desc:'Smart party-wear shirt for boys',variants:[{name:'Boys Party Shirt',fabric:'Cotton',price:599}]},
 {category:'Boys Pant',group:'Kids',desc:'Comfortable everyday pant for boys',variants:[{name:'Boys Casual Pant',fabric:'Cotton',price:599}]},
 {category:'Kids Kurta',group:'Kids',desc:'Bright festive kurta for kids',variants:[{name:'Kids Festive Kurta',fabric:'Cotton',price:699}]},
 // Newly requested categories
 {category:'Sharara',group:'Women',desc:'Flared festive pant-style ethnic set',variants:[{name:'Festive Sharara Set',fabric:'Georgette',price:1799}]},
 {category:'Pavadai Dhavani',group:'Women',desc:'Traditional half-saree set for young women',variants:[{name:'Silk Pavadai Dhavani',fabric:'Silk',price:1999}]},
 {category:'Pyjama',group:'Men',desc:'Comfortable drawstring pyjama for kurta sets',variants:[{name:'Cotton Pyjama',fabric:'Cotton',price:499}]},
 {category:'Veshti + Shirt',group:'Men',desc:'Traditional veshti paired with a matching shirt',variants:[{name:'Silk Veshti + Shirt Set',fabric:'Silk',price:1599}]},
 {category:'Shorts',group:'Men',desc:'Casual everyday shorts',variants:[{name:'Casual Shorts',fabric:'Cotton',price:499}]},
 {category:'Waistcoat',group:'Men',desc:'Smart layering waistcoat for festive/formal looks',variants:[{name:'Festive Waistcoat',fabric:'Silk',price:1299}]},
 {category:'Nehru Jacket',group:'Men',desc:'Classic short jacket for ethnic and formal wear',variants:[{name:'Silk Nehru Jacket',fabric:'Silk',price:1699}]},
 {category:'Pavadai Sattai',group:'Kids',desc:'Traditional skirt & blouse set for young girls',variants:[{name:'Festive Pavadai Sattai',fabric:'Silk',price:999}]},
 {category:'Kids Shorts',group:'Kids',desc:'Comfortable everyday shorts for kids',variants:[{name:'Kids Casual Shorts',fabric:'Cotton',price:399}]}
];
const DESIGNS = DRESS_CATALOG.flatMap(cat=>{
 const slug=slugify(cat.category);
 return cat.variants.map((v,i)=>({
  id:`${slug}-${String(i+1).padStart(2,'0')}`,
  name:v.name,category:cat.category,group:cat.group,desc:cat.desc,fabric:v.fabric,price:v.price,
  slug,variant:i+1
 }));
});
const CATEGORY_GROUPS = ['Women','Men','Kids'];
const CATEGORIES = [...new Set(DESIGNS.map(d=>d.category))];
const colorsForCategory=cat=>{const schema=CUSTOMIZATION_SCHEMA[cat]||GENERIC_SCHEMA;const fld=schema.find(x=>/color/i.test(x.key));return fld?fld.options:['Cream','Black','Maroon','Navy','Pink']};
// Deterministic mock rating (4.0–5.0) per design, based on its id — stable across renders/sessions.
const ratingFor=design=>{
 let h=0;for(const c of design.id)h=(h*31+c.charCodeAt(0))>>>0;
 return (4+((h%11)/10)).toFixed(1);
};

// ---- Customization fields depend on the selected dress type ----
const f=(key,label,options)=>({key,label,options});
const GENERIC_SCHEMA=[f('fabric','Fabric',['Cotton','Silk','Linen','Rayon','Chiffon']),f('color','Color',['Cream','Black','Maroon','Pink','Navy']),f('pattern','Pattern',['Plain','Floral','Checks','Embroidery']),f('length','Length',['Regular','Short','Long'])];
const CUSTOMIZATION_SCHEMA = {
 'Saree':[f('fabric','Saree Fabric',['Silk','Cotton','Georgette','Chiffon','Linen']),f('color','Saree Color',['Cream','Maroon','Navy','Emerald','Gold']),f('border','Border',['Zari','Temple','Contrast','Plain']),f('blouseDesign','Blouse Design',['Regular','Backless','High Neck','Boat Neck']),f('blouseSleeve','Blouse Sleeve',['Sleeveless','Short','Elbow','Full']),f('neck','Neck Design',['Round','V-Neck','Boat','Halter'])],
 'Saree Blouse':[f('fabric','Fabric',['Silk','Cotton','Velvet']),f('color','Color',['Cream','Maroon','Gold','Black']),f('design','Blouse Design',['Regular','Backless','High Neck','Boat Neck']),f('sleeve','Sleeve',['Sleeveless','Short','Elbow','Full']),f('neck','Neck Design',['Round','V-Neck','Boat','Halter'])],
 'Chudidar':[f('fabric','Fabric',['Cotton','Silk','Rayon']),f('topColor','Top Color',['Cream','Pink','Navy','Mustard']),f('bottomColor','Bottom Color',['White','Black','Cream','Navy']),f('neck','Neck Design',['Round','V-Neck','Chinese Collar']),f('sleeve','Sleeve Design',['Full','3/4th','Short']),f('length','Length',['Knee','Calf','Ankle'])],
 'Salwar Kameez':[f('fabric','Fabric',['Cotton','Silk','Rayon']),f('topColor','Top Color',['Cream','Pink','Navy','Mustard']),f('bottomColor','Bottom Color',['White','Black','Cream']),f('neck','Neck Design',['Round','V-Neck','Boat']),f('sleeve','Sleeve Design',['Full','3/4th','Short']),f('dupatta','Dupatta',['Plain','Printed','Embroidered','None'])],
 'Anarkali':[f('fabric','Fabric',['Georgette','Silk','Chiffon']),f('color','Color',['Maroon','Navy','Emerald','Gold']),f('neck','Neck Design',['Round','V-Neck','Boat']),f('sleeve','Sleeve',['Full','3/4th','Short','Sleeveless']),f('flare','Flare',['Regular','Heavy','Umbrella']),f('embroidery','Embroidery',['Plain','Zari','Stone Work'])],
 'Kurti':[f('fabric','Fabric',['Cotton','Rayon','Silk','Linen']),f('color','Color',['Cream','Black','Maroon','Pink','Mustard']),f('neck','Neck Design',['Round','V-Neck','Collar','Boat']),f('sleeve','Sleeve Design',['Full','3/4th','Short','Sleeveless']),f('pattern','Pattern',['Plain','Floral','Checks','Embroidery']),f('length','Length',['Short','Regular','Long'])],
 'Lehenga':[f('color','Lehenga Color',['Maroon','Gold','Emerald','Navy','Pink']),f('blouseDesign','Blouse Design',['Regular','Backless','High Neck']),f('dupatta','Dupatta',['Plain','Net','Embroidered']),f('embroidery','Embroidery',['Zari','Stone Work','Thread Work','Plain']),f('flare','Skirt Flare',['Regular','Heavy','Circular'])],
 'Gown':[f('fabric','Fabric',['Chiffon','Satin','Velvet','Net']),f('color','Color',['Maroon','Navy','Emerald','Black','Gold']),f('neck','Neck Design',['Sweetheart','Round','V-Neck','Halter']),f('sleeve','Sleeve',['Sleeveless','Cap Sleeve','Full']),f('length','Length',['Floor Length','Knee Length','Ankle Length'])],
 'Skirt':[f('fabric','Fabric',['Cotton','Denim','Rayon']),f('color','Color',['Cream','Black','Navy','Mustard']),f('length','Length',['Mini','Knee','Midi','Maxi']),f('fit','Fit',['A-Line','Straight','Flared'])],
 'Palazzo':[f('fabric','Fabric',['Rayon','Cotton','Crepe']),f('color','Color',['Cream','Black','Navy','Maroon']),f('fit','Fit',['Wide Leg','Flowy','Culotte']),f('waist','Waist Style',['Elastic','Drawstring','Fitted'])],
 'Crop Top':[f('fabric','Fabric',['Cotton','Rayon','Satin']),f('color','Color',['Cream','Black','Pink','Mustard']),f('neck','Neck Design',['Round','Halter','Off-Shoulder']),f('sleeve','Sleeve',['Sleeveless','Short','Full'])],
 'A-Line Dress':[f('fabric','Fabric',['Cotton','Crepe','Georgette']),f('color','Color',['Cream','Navy','Maroon','Mustard']),f('neck','Neck Design',['Round','V-Neck','Boat']),f('sleeve','Sleeve',['Sleeveless','Cap Sleeve','Full']),f('length','Length',['Knee','Midi','Maxi'])],
 'Night Dress':[f('fabric','Fabric',['Cotton','Satin','Rayon']),f('color','Color',['Cream','Pink','Lavender','Navy']),f('sleeve','Sleeve',['Sleeveless','Short','Full']),f('length','Length',['Knee','Ankle'])],
 'Formal Shirt':[f('fabric','Fabric',['Cotton','Linen']),f('collar','Collar',['Classic','Spread','Button-Down']),f('sleeve','Sleeve',['Full','Half']),f('pocket','Pocket',['With Pocket','No Pocket']),f('button','Button Style',['Regular','French Cuff']),f('fit','Shirt Fit',['Slim','Regular','Relaxed'])],
 'Casual Shirt':[f('fabric','Fabric',['Cotton','Linen']),f('collar','Collar',['Classic','Spread','Button-Down']),f('sleeve','Sleeve',['Full','Half']),f('pocket','Pocket',['With Pocket','No Pocket']),f('pattern','Pattern',['Plain','Checks','Stripes']),f('fit','Shirt Fit',['Slim','Regular','Relaxed'])],
 'T-Shirt':[f('fabric','Fabric',['Cotton','Polyester Blend']),f('color','Color',['Black','White','Navy','Maroon']),f('neck','Neck',['Round','Collar','V-Neck']),f('sleeve','Sleeve',['Half','Full','Sleeveless']),f('fit','Fit',['Slim','Regular','Oversized'])],
 'Formal Pant':[f('fabric','Fabric',['Cotton','Wool Blend']),f('waist','Waist',['Regular','High Rise']),f('fit','Fit',['Slim','Regular','Relaxed']),f('length','Length',['Regular','Cropped']),f('pocket','Pocket Style',['Slant','Welt'])],
 'Jeans':[f('fit','Fit',['Slim','Straight','Regular','Bootcut']),f('wash','Wash',['Light','Medium','Dark','Black']),f('waist','Waist',['Regular','High Rise']),f('length','Length',['Ankle','Full'])],
 'Kurta':[f('fabric','Fabric',['Cotton','Linen','Silk']),f('color','Color',['Cream','Maroon','Mustard','Navy']),f('neck','Neck Design',['Mandarin','Round','Collarless']),f('sleeve','Sleeve',['Full','3/4th']),f('length','Length',['Knee','Calf'])],
 'Sherwani':[f('fabric','Fabric',['Silk','Brocade','Velvet']),f('color','Color',['Cream','Maroon','Gold','Navy']),f('embroidery','Embroidery',['Zari','Thread Work','Plain']),f('collar','Collar',['Mandarin','Nehru']),f('length','Length',['Knee','Calf'])],
 'Dhoti':[f('fabric','Fabric',['Cotton','Silk']),f('color','Color',['Cream','White','Gold']),f('border','Border',['Zari','Contrast','Plain']),f('style','Drape Style',['Traditional','Pre-Stitched'])],
 'Blazer':[f('fabric','Fabric',['Wool Blend','Cotton Blend','Linen']),f('color','Color',['Black','Navy','Grey','Maroon']),f('fit','Fit',['Slim','Regular']),f('lapel','Lapel Style',['Notch','Peak']),f('button','Buttons',['Single Breasted','Double Breasted'])],
 'Girls Frock':[f('fabric','Fabric',['Cotton','Net','Satin']),f('color','Color',['Pink','Yellow','Lavender','Mint']),f('sleeve','Sleeve',['Puff','Short','Sleeveless']),f('length','Length',['Above Knee','Knee'])],
 'Girls Lehenga':[f('color','Lehenga Color',['Pink','Gold','Mint','Lavender']),f('blouseDesign','Blouse Design',['Regular','Halter']),f('dupatta','Dupatta',['Plain','Net']),f('embroidery','Embroidery',['Sequins','Thread Work','Plain'])],
 'Boys Shirt':[f('fabric','Fabric',['Cotton','Linen']),f('collar','Collar',['Classic','Mandarin']),f('sleeve','Sleeve',['Full','Half']),f('pattern','Pattern',['Plain','Checks','Stripes'])],
 'Boys Pant':[f('fabric','Fabric',['Cotton','Denim']),f('fit','Fit',['Regular','Slim']),f('length','Length',['Regular','Cropped'])],
 'Kids Kurta':[f('fabric','Fabric',['Cotton','Linen']),f('color','Color',['Mustard','Maroon','Teal','Navy']),f('neck','Neck Design',['Round','Mandarin']),f('length','Length',['Knee','Above Knee'])],
 'Sharara':[f('fabric','Fabric',['Georgette','Silk','Chiffon']),f('color','Color',['Maroon','Emerald','Gold','Navy']),f('neck','Neck Design',['Round','V-Neck','Boat']),f('sleeve','Sleeve',['Full','3/4th','Sleeveless']),f('flare','Sharara Flare',['Regular','Heavy'])],
 'Pavadai Dhavani':[f('fabric','Fabric',['Silk','Cotton']),f('color','Color',['Maroon','Gold','Green','Pink']),f('border','Border',['Zari','Temple','Plain']),f('blouseDesign','Blouse Design',['Regular','Puff Sleeve','Boat Neck'])],
 'Pyjama':[f('fabric','Fabric',['Cotton','Linen']),f('color','Color',['White','Cream','Beige']),f('fit','Fit',['Regular','Slim']),f('waist','Waist Style',['Drawstring','Elastic'])],
 'Veshti + Shirt':[f('fabric','Fabric',['Silk','Cotton']),f('color','Veshti Color',['Cream','White']),f('border','Border',['Zari','Contrast','Plain']),f('shirtFit','Shirt Fit',['Regular','Slim'])],
 'Shorts':[f('fabric','Fabric',['Cotton','Denim']),f('fit','Fit',['Regular','Slim','Relaxed']),f('length','Length',['Above Knee','Knee'])],
 'Waistcoat':[f('fabric','Fabric',['Silk','Wool Blend','Velvet']),f('color','Color',['Maroon','Navy','Black','Gold']),f('button','Buttons',['3-Button','5-Button']),f('fit','Fit',['Slim','Regular'])],
 'Nehru Jacket':[f('fabric','Fabric',['Silk','Jute Blend','Cotton']),f('color','Color',['Maroon','Navy','Black','Cream']),f('embroidery','Embroidery',['Plain','Thread Work','Zari']),f('length','Length',['Regular','Long'])],
 'Pavadai Sattai':[f('fabric','Fabric',['Silk','Cotton']),f('color','Color',['Pink','Yellow','Green','Maroon']),f('blouseDesign','Blouse Design',['Puff Sleeve','Regular']),f('border','Border',['Zari','Plain'])],
 'Kids Shorts':[f('fabric','Fabric',['Cotton','Denim']),f('color','Color',['Navy','Grey','Khaki']),f('length','Length',['Above Knee','Knee'])]
};
const defaultsFromSchema=schema=>schema.reduce((a,x)=>({...a,[x.key]:x.options[0]}),{});

// ---- IMAGE SYSTEM ----
// Two ways to get real photos into the catalogue:
//  1) DEVELOPER: drop a file into src/assets/dresses/<category-slug>/ using the naming convention
//     <slug>-<variant>.jpg (e.g. saree-01.jpg), optionally <slug>-<variant>-<color>.jpg for a color shot.
//     Vite auto-discovers these at build time — no code changes needed.
//  2) SHOP OWNER (no code/rebuild needed): Admin → Photos page lets you upload a photo straight from
//     the browser. It's compressed and saved in this browser's LocalStorage and shown instantly,
//     using the exact same <slug>-<variant>[-<color>] key so both systems share one lookup.
const dressImageModules = import.meta.glob('/src/assets/dresses/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',{eager:true,import:'default'});
const IMAGE_LOOKUP = {};
Object.entries(dressImageModules).forEach(([path,url])=>{
 const file = path.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase();
 IMAGE_LOOKUP[file]=url;
});
const imageKeyFor=(design,colorName)=>`${design.slug}-${String(design.variant).padStart(2,'0')}${colorName?'-'+slugify(colorName):''}`;
const expectedFile=(design,colorName)=>`${imageKeyFor(design,colorName)}.jpg`;
const ImageStoreContext = createContext({uploads:{}});
const CustomDesignsContext = createContext({customDesigns:[]});
const useCombinedDesigns=()=>{
 const {customDesigns}=useContext(CustomDesignsContext);
 return useMemo(()=>[...DESIGNS,...customDesigns],[customDesigns]);
};
const resolveDesignImage=(design,colorName,uploads={})=>{
 const base=imageKeyFor(design);
 if(colorName){
  const key=imageKeyFor(design,colorName);
  if(uploads[key])return uploads[key];
  if(IMAGE_LOOKUP[key])return IMAGE_LOOKUP[key];
 }
 return uploads[base]||IMAGE_LOOKUP[base]||null;
};
const resolveGallery=(design,uploads={})=>{
 const base=imageKeyFor(design);
 const keys=new Set([...Object.keys(IMAGE_LOOKUP),...Object.keys(uploads)]);
 return [...keys].filter(k=>k===base||k.startsWith(base+'-')).sort().map(k=>uploads[k]||IMAGE_LOOKUP[k]);
};
// Compresses an uploaded photo client-side (keeps LocalStorage usage sane) and returns a data URL.
function compressImageFile(file,maxW=1000,quality=0.85){
 return new Promise((resolve,reject)=>{
  if(/heic|heif/i.test(file.type)||/\.hei[cf]$/i.test(file.name)){
   reject(new Error('HEIC photos from iPhone are not supported by browsers — please convert to JPG/PNG first'));
   return;
  }
  const reader=new FileReader();
  reader.onerror=()=>reject(new Error('Could not read file'));
  reader.onload=()=>{
   const img=new Image();
   img.onerror=()=>reject(new Error('Unsupported or corrupted image file'));
   img.onload=()=>{
    const scale=Math.min(1,maxW/img.width);
    const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
    const canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    try{resolve(canvas.toDataURL('image/jpeg',quality))}
    catch(err){reject(new Error('Could not process this image (possibly too large)'))}
   };
   img.src=reader.result;
  };
  reader.readAsDataURL(file);
 });
}

// ---- PhotoFrame: shows the real photo (uploaded or bundled) if present, otherwise a clean "photo coming soon" placeholder ----
// PhotoFrame: shows the real photo (uploaded or bundled) if present, otherwise a clean "photo coming soon"
// placeholder. If the resolved image fails to actually load (corrupted file, etc.), it falls back to another
// photo of the SAME design (a color variant or gallery shot) before ever falling back to the placeholder —
// it never shows a broken-image icon, and never borrows a photo from a different product.
function PhotoFrame({design,color,className,expectHint=true}){
 const {uploads}=useContext(ImageStoreContext);
 const [failed,setFailed]=useState(null);
 const primary=design?resolveDesignImage(design,color,uploads):null;
 const gallery=design?resolveGallery(design,uploads):[];
 const candidates=[primary,...gallery].filter((v,i,arr)=>v&&arr.indexOf(v)===i);
 const src=candidates.find(c=>c!==failed);
 if(src)return <img src={src} alt={design.name} className={(className||'')+' photo-frame-img'} loading="lazy" onError={()=>setFailed(src)}/>;
 return <div className={(className||'')+' photo-placeholder'}>
  <svg viewBox="0 0 64 64" className="placeholder-icon" aria-hidden="true"><circle cx="32" cy="22" r="10" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M12,56 Q12,36 32,36 Q52,36 52,56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
  <span className="placeholder-label">Photo coming soon</span>
  {expectHint&&design&&<code className="placeholder-file">{expectedFile(design,color)}</code>}
 </div>;
}

// ---- Text/Embroidery Font Formatting: choose letter style for custom name/monogram text ----
const FONTS = [
 {key:'Arial', label:'Arial', css:'Arial, Helvetica, sans-serif'},
 {key:'TimesNewRoman', label:'Times New Roman', css:'"Times New Roman", Times, serif'},
 {key:'Georgia', label:'Georgia', css:'Georgia, "Times New Roman", serif'},
 {key:'CourierNew', label:'Courier New', css:'"Courier New", Courier, monospace'},
 {key:'Verdana', label:'Verdana', css:'Verdana, Geneva, sans-serif'},
 {key:'ComicSansMS', label:'Comic Sans MS', css:'"Comic Sans MS", "Comic Sans", cursive'},
 {key:'BrushScript', label:'Elegant Script', css:'"Brush Script MT", "Segoe Script", cursive'},
 {key:'Impact', label:'Impact (Bold)', css:'Impact, "Arial Black", sans-serif'}
];
const PAYMENT_METHODS = [
 {key:'upi', label:'UPI', icon:'📱', hint:'Pay using any UPI app'},
 {key:'card', label:'Card', icon:'💳', hint:'Credit / Debit card'},
 {key:'cod', label:'Cash on Delivery', icon:'💵', hint:'Pay when your order is delivered'}
];
const COUPONS = {WELCOME5:0.05, STITCH10:0.10};

// ---- Theme & Language: useContext hook powers app-wide theme + i18n ----
const ThemeContext = createContext(null);
const LanguageContext = createContext(null);

const TRANSLATIONS = {
 en:{appName:'Smart Tailor',tagline:'Your Perfect Fit, Digitally Tailored',subTagline:'Real-world tailoring shop workflow in one simple application.',journey:['Choose Dress','Measurements','Payment','Delivery'],customerTab:'Customer',adminTab:'Tailor / Admin',customerLoginTitle:'Customer Login',adminLoginTitle:'Tailor Owner Login',customerLoginSub:'Select your dress, measurements and order.',adminLoginSub:'Manage your real tailoring shop and customers.',nameLabel:'Name',customerContactLabel:'Phone / Email',adminContactLabel:'Admin ID',namePlaceholderCustomer:'Customer name',namePlaceholderAdmin:'Owner name',enterHere:'Enter here',enterCustomerApp:'Enter Customer App',openAdminDashboard:'Open Admin Dashboard',demoLoginNote:'Demo login — no backend required.',logout:'Logout',nav_dashboard:'Dashboard',nav_profile:'Profile',nav_measurements:'Measurements',nav_designs:'Browse Designs',nav_customize:'Customize Dress',nav_cart:'Cart',nav_orders:'Orders',nav_tracking:'Tracking',nav_offers:'Offers',nav_settings:'Settings',nav_adminDashboard:'Dashboard',nav_adminCustomers:'Customers',nav_adminMeasurements:'Measurements',nav_adminOrders:'Orders',nav_adminCategories:'Categories',nav_adminWorkload:'Workload',nav_adminRevenue:'Revenue & Reports',customerPortal:'CUSTOMER PORTAL',adminPortal:'TAILOR / ADMIN PORTAL',welcomeMsg:'Welcome',dashboardSub:'Your personal tailoring journey — from fabric choice to final fitting.',browseDesignsBtn:'Browse Designs',perfectFitProfile:'Perfect Fit Profile',measurementFieldsSaved:'measurement fields saved',metricMeasurements:'Measurements',metricCartItems:'Cart Items',metricOrders:'Orders',metricDesigns:'Designs',tailoringJourneyTitle:'Tailoring Journey',tailoringJourneySub:'A simple real-world workflow.',workflow:['Choose Design','Customize','Add Measurements','Cart','Payment','Stitching','Delivery'],settingsTitle:'Settings',settingsSub:'Basic application preferences.',themeLabel:'Appearance',lightTheme:'Light',darkTheme:'Dark',languageLabel:'Language',notif1:'Order status notifications',notif2:'Measurement reminders',notif3:'Promotional offers',localDataNote:'All application data is stored locally in your browser for this demo.'},
 ta:{appName:'ஸ்மார்ட் டெய்லர்',tagline:'உங்கள் சரியான அளவு, டிஜிட்டலாக தையல்',subTagline:'ஒரே எளிய செயலியில் நிஜ தையல் கடை பணிப்பாய்வு.',journey:['ஆடையை தேர்வு செய்யவும்','அளவுகள்','கட்டணம்','டெலிவரி'],customerTab:'வாடிக்கையாளர்',adminTab:'தையல்காரர் / நிர்வாகி',customerLoginTitle:'வாடிக்கையாளர் உள்நுழைவு',adminLoginTitle:'தையல் உரிமையாளர் உள்நுழைவு',customerLoginSub:'உங்கள் ஆடை, அளவுகள் மற்றும் ஆர்டரைத் தேர்ந்தெடுக்கவும்.',adminLoginSub:'உங்கள் தையல் கடை மற்றும் வாடிக்கையாளர்களை நிர்வகிக்கவும்.',nameLabel:'பெயர்',customerContactLabel:'தொலைபேசி / மின்னஞ்சல்',adminContactLabel:'நிர்வாக ஐடி',namePlaceholderCustomer:'வாடிக்கையாளர் பெயர்',namePlaceholderAdmin:'உரிமையாளர் பெயர்',enterHere:'இங்கே உள்ளிடவும்',enterCustomerApp:'வாடிக்கையாளர் செயலியில் நுழையவும்',openAdminDashboard:'நிர்வாக டாஷ்போர்டைத் திற',demoLoginNote:'டெமோ உள்நுழைவு — பின்தள தேவையில்லை.',logout:'வெளியேறு',nav_dashboard:'டாஷ்போர்டு',nav_profile:'சுயவிவரம்',nav_measurements:'அளவுகள்',nav_designs:'வடிவமைப்புகளை பார்க்க',nav_customize:'ஆடையை தனிப்பயனாக்கு',nav_cart:'கார்ட்',nav_orders:'ஆர்டர்கள்',nav_tracking:'கண்காணிப்பு',nav_offers:'சலுகைகள்',nav_settings:'அமைப்புகள்',nav_adminDashboard:'டாஷ்போர்டு',nav_adminCustomers:'வாடிக்கையாளர்கள்',nav_adminMeasurements:'அளவுகள்',nav_adminOrders:'ஆர்டர்கள்',nav_adminCategories:'வகைகள்',nav_adminWorkload:'பணிச்சுமை',nav_adminRevenue:'வருவாய் & அறிக்கைகள்',customerPortal:'வாடிக்கையாளர் போர்டல்',adminPortal:'தையல்காரர் / நிர்வாக போர்டல்',welcomeMsg:'வரவேற்கிறோம்',dashboardSub:'துணி தேர்விலிருந்து இறுதி பொருத்தம் வரை உங்கள் தனிப்பட்ட தையல் பயணம்.',browseDesignsBtn:'வடிவமைப்புகளை பார்க்க',perfectFitProfile:'சரியான பொருத்த சுயவிவரம்',measurementFieldsSaved:'அளவு புலங்கள் சேமிக்கப்பட்டன',metricMeasurements:'அளவுகள்',metricCartItems:'கார்ட் பொருட்கள்',metricOrders:'ஆர்டர்கள்',metricDesigns:'வடிவமைப்புகள்',tailoringJourneyTitle:'தையல் பயணம்',tailoringJourneySub:'ஒரு எளிய நிஜ பணிப்பாய்வு.',workflow:['வடிவமைப்பைத் தேர்வு செய்','தனிப்பயனாக்கு','அளவுகளைச் சேர்','கார்ட்','கட்டணம்','தையல்','டெலிவரி'],settingsTitle:'அமைப்புகள்',settingsSub:'அடிப்படை செயலி விருப்பங்கள்.',themeLabel:'தோற்றம்',lightTheme:'லைட்',darkTheme:'டார்க்',languageLabel:'மொழி',notif1:'ஆர்டர் நிலை அறிவிப்புகள்',notif2:'அளவு நினைவூட்டல்கள்',notif3:'விளம்பர சலுகைகள்',localDataNote:'இந்த டெமோவிற்கு அனைத்து செயலி தரவும் உங்கள் உலாவியில் உள்நாட்டில் சேமிக்கப்படுகிறது.'},
 hi:{appName:'स्मार्ट टेलर',tagline:'आपकी सही फिटिंग, डिजिटल रूप से तैयार',subTagline:'एक ही आसान ऐप में असली टेलरिंग शॉप वर्कफ़्लो।',journey:['ड्रेस चुनें','माप','भुगतान','डिलीवरी'],customerTab:'ग्राहक',adminTab:'टेलर / एडमिन',customerLoginTitle:'ग्राहक लॉगिन',adminLoginTitle:'टेलर मालिक लॉगिन',customerLoginSub:'अपनी ड्रेस, माप और ऑर्डर चुनें।',adminLoginSub:'अपनी असली टेलरिंग शॉप और ग्राहकों को प्रबंधित करें।',nameLabel:'नाम',customerContactLabel:'फ़ोन / ईमेल',adminContactLabel:'एडमिन आईडी',namePlaceholderCustomer:'ग्राहक का नाम',namePlaceholderAdmin:'मालिक का नाम',enterHere:'यहाँ दर्ज करें',enterCustomerApp:'ग्राहक ऐप में प्रवेश करें',openAdminDashboard:'एडमिन डैशबोर्ड खोलें',demoLoginNote:'डेमो लॉगिन — बैकएंड की आवश्यकता नहीं।',logout:'लॉगआउट',nav_dashboard:'डैशबोर्ड',nav_profile:'प्रोफ़ाइल',nav_measurements:'माप',nav_designs:'डिज़ाइन देखें',nav_customize:'ड्रेस कस्टमाइज़ करें',nav_cart:'कार्ट',nav_orders:'ऑर्डर',nav_tracking:'ट्रैकिंग',nav_offers:'ऑफ़र',nav_settings:'सेटिंग्स',nav_adminDashboard:'डैशबोर्ड',nav_adminCustomers:'ग्राहक',nav_adminMeasurements:'माप',nav_adminOrders:'ऑर्डर',nav_adminCategories:'श्रेणियाँ',nav_adminWorkload:'कार्यभार',nav_adminRevenue:'राजस्व और रिपोर्ट',customerPortal:'ग्राहक पोर्टल',adminPortal:'टेलर / एडमिन पोर्टल',welcomeMsg:'स्वागत है',dashboardSub:'कपड़े की पसंद से लेकर अंतिम फिटिंग तक आपकी व्यक्तिगत टेलरिंग यात्रा।',browseDesignsBtn:'डिज़ाइन देखें',perfectFitProfile:'परफेक्ट फिट प्रोफ़ाइल',measurementFieldsSaved:'माप फ़ील्ड सहेजे गए',metricMeasurements:'माप',metricCartItems:'कार्ट आइटम',metricOrders:'ऑर्डर',metricDesigns:'डिज़ाइन',tailoringJourneyTitle:'टेलरिंग यात्रा',tailoringJourneySub:'एक आसान वास्तविक वर्कफ़्लो।',workflow:['डिज़ाइन चुनें','कस्टमाइज़ करें','माप जोड़ें','कार्ट','भुगतान','सिलाई','डिलीवरी'],settingsTitle:'सेटिंग्स',settingsSub:'बुनियादी ऐप प्राथमिकताएँ।',themeLabel:'थीम',lightTheme:'लाइट',darkTheme:'डार्क',languageLabel:'भाषा',notif1:'ऑर्डर स्थिति सूचनाएँ',notif2:'माप रिमाइंडर',notif3:'प्रचार ऑफ़र',localDataNote:'इस डेमो के लिए सभी ऐप डेटा आपके ब्राउज़र में स्थानीय रूप से संग्रहीत है।'}
};

// Custom hook (built on useContext) so any component can call t('key') for the active language
function useTranslation(){
 const ctx=useContext(LanguageContext);
 return ctx; // {lang, setLang, t}
}
function useTheme(){
 return useContext(ThemeContext); // {theme, mode, accent, resolvedTheme, toggleTheme, setMode, setAccent, resetTheme}
}

const ACCENTS = [
 {key:'purple',label:'Royal Purple',swatch:'#6a3159'},
 {key:'blue',label:'Ocean Blue',swatch:'#2c5282'},
 {key:'green',label:'Emerald Green',swatch:'#047857'},
 {key:'pink',label:'Rose Pink',swatch:'#9d174d'},
 {key:'orange',label:'Sunset Orange',swatch:'#c2410c'},
 {key:'indigo',label:'Indigo',swatch:'#3730a3'},
 {key:'teal',label:'Teal',swatch:'#0f766e'},
 {key:'mono',label:'Minimal B&W',swatch:'#3f3f46'}
];

const seedCustomers = [
 {id:'CUS001',name:'Arun Kumar',phone:'9876543210',email:'arun@gmail.com',gender:'Male',measurements:{chest:'40',waist:'34',shoulder:'17',sleeve:'24',length:'29'},created:'15/08/2026'},
 {id:'CUS002',name:'Meena Devi',phone:'9876501234',email:'meena@gmail.com',gender:'Female',measurements:{chest:'36',waist:'30',shoulder:'15',sleeve:'22',length:'42'},created:'15/08/2026'}
];

function useStore(key, initial){
 const [value,setValue]=useState(()=>{try{return JSON.parse(localStorage.getItem(key)) ?? initial}catch{return initial}});
 useEffect(()=>{
  try{localStorage.setItem(key,JSON.stringify(value))}
  catch(err){console.warn(`Could not save "${key}" to LocalStorage`,err)}
 },[key,value]);
 return [value,setValue];
}

function App(){
 const [session,setSession]=useStore('tailor_session',null);
 const [mode,setMode]=useStore('tailor_theme_mode','light'); // light | dark | system
 const [accent,setAccent]=useStore('tailor_theme_accent','purple');
 const [lang,setLang]=useStore('tailor_lang','en');
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

 // useEffect: track OS color scheme changes for System mode
 useEffect(()=>{
  const mq=window.matchMedia?.('(prefers-color-scheme: dark)');
  if(!mq) return;
  const onChange=e=>setSystemDark(e.matches);
  mq.addEventListener?mq.addEventListener('change',onChange):mq.addListener(onChange);
  return()=>{mq.removeEventListener?mq.removeEventListener('change',onChange):mq.removeListener(onChange)};
 },[]);

 const resolvedTheme=mode==='system'?(systemDark?'dark':'light'):mode;

 // useEffect: apply resolved theme + accent + language font as a side-effect whenever they change
 useEffect(()=>{
  document.documentElement.setAttribute('data-theme',resolvedTheme);
  document.documentElement.setAttribute('data-accent',accent);
 },[resolvedTheme,accent]);
 useEffect(()=>{
  document.body.className='lang-'+lang;
 },[lang]);

 const toggleTheme=useCallback(()=>setMode(m=>(m==='system'?(systemDark?'light':'dark'):(m==='light'?'dark':'light'))),[setMode,systemDark]);
 const resetTheme=useCallback(()=>{setMode('light');setAccent('purple')},[setMode,setAccent]);
 const t=useCallback(key=>TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key],[lang]);

 const [uploads,setUploads]=useStore('tailor_uploaded_images',{});
 const uploadImage=useCallback(async(design,color,file)=>{
  const dataUrl=await compressImageFile(file);
  const key=imageKeyFor(design,color);
  setUploads(u=>({...u,[key]:dataUrl}));
 },[setUploads]);
 const removeImage=useCallback((design,color)=>{
  const key=imageKeyFor(design,color);
  setUploads(u=>{const n={...u};delete n[key];return n});
 },[setUploads]);

 const [customDesigns,setCustomDesigns]=useStore('tailor_custom_designs',[]);
 const addCustomDesign=useCallback(design=>setCustomDesigns(d=>[...d,design]),[setCustomDesigns]);
 const removeCustomDesign=useCallback(id=>setCustomDesigns(d=>d.filter(x=>x.id!==id)),[setCustomDesigns]);

 return (
  <ThemeContext.Provider value={{mode,setMode,accent,setAccent,resolvedTheme,theme:resolvedTheme,toggleTheme,resetTheme}}>
   <LanguageContext.Provider value={{lang,setLang,t}}>
    <ImageStoreContext.Provider value={{uploads,uploadImage,removeImage}}>
     <CustomDesignsContext.Provider value={{customDesigns,addCustomDesign,removeCustomDesign}}>
      {session ? <Portal session={session} logout={()=>setSession(null)}/> : <Login onLogin={setSession}/>}
     </CustomDesignsContext.Provider>
    </ImageStoreContext.Provider>
   </LanguageContext.Provider>
  </ThemeContext.Provider>
 );
}

function Login({onLogin}){
 const [role,setRole]=useState('customer'); const [name,setName]=useState(''); const [contact,setContact]=useState('');
 const {lang,setLang,t}=useTranslation(); // useContext-powered translation
 const submit=e=>{e.preventDefault(); if(!name.trim()) return alert('Please enter your name.'); onLogin({role,name:name.trim(),contact})};
 return <div className="login-page">
  <div className="login-showcase"><div className="logo big">✂ {t('appName')}</div><div className="eyebrow">LUXURY FASHION × MODERN TECHNOLOGY</div><h1>{t('tagline')}</h1><p>{t('subTagline')}</p><div className="journey">{t('journey').map((s,i)=><React.Fragment key={s}>{i>0&&<b>→</b>}<span>{s}</span></React.Fragment>)}</div></div>
  <form className="login-card" onSubmit={submit}>
   <div className="logo-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <div className="logo">✂ {t('appName')}</div>
    <select className="lang-select" value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option></select>
   </div>
   <div className="role-tabs"><button type="button" className={role==='customer'?'on':''} onClick={()=>setRole('customer')}>{t('customerTab')}</button><button type="button" className={role==='admin'?'on':''} onClick={()=>setRole('admin')}>{t('adminTab')}</button></div>
   <h2>{role==='customer'?t('customerLoginTitle'):t('adminLoginTitle')}</h2><p className="muted">{role==='customer'?t('customerLoginSub'):t('adminLoginSub')}</p>
   <label>{t('nameLabel')}<input value={name} onChange={e=>setName(e.target.value)} placeholder={role==='customer'?t('namePlaceholderCustomer'):t('namePlaceholderAdmin')}/></label>
   <label>{role==='customer'?t('customerContactLabel'):t('adminContactLabel')}<input value={contact} onChange={e=>setContact(e.target.value)} placeholder={t('enterHere')}/></label>
   <button className="primary full">{role==='customer'?t('enterCustomerApp'):t('openAdminDashboard')}</button>
   <div className="demo-login-row">
    <button type="button" className="link" onClick={()=>onLogin({role:'customer',name:'Demo Customer',contact:'demo@customer.com'})}>Continue as Demo Customer</button>
    <button type="button" className="link" onClick={()=>onLogin({role:'admin',name:'Demo Tailor',contact:'demo@tailor.com'})}>Continue as Demo Admin</button>
   </div>
   <button type="button" className="link forgot-link" onClick={()=>alert('This is a demo app with no backend, so there is no real password to reset. Just enter any name above and continue.')}>Forgot Password?</button>
   <small className="muted">{t('demoLoginNote')}</small>
  </form>
  <ThemeCustomizer floating/>
 </div>;
}

// ---- Global Theme Customization system ----
function ThemeCustomizer({floating}){
 const [open,setOpen]=useState(false);
 const {mode,setMode,accent,setAccent,resetTheme}=useTheme();
 const panelRef=useRef(null);
 useEffect(()=>{
  if(!open) return;
  const onClick=e=>{if(panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)};
  document.addEventListener('mousedown',onClick);
  return()=>document.removeEventListener('mousedown',onClick);
 },[open]);
 return <div className={floating?'theme-fab-wrap':'theme-fab-wrap inline'} ref={panelRef}>
  <button type="button" className="theme-fab" onClick={()=>setOpen(o=>!o)} aria-label="Theme Settings">🎨</button>
  {open && <div className="theme-panel">
   <div className="theme-panel-head"><b>Theme Settings</b><button type="button" className="theme-panel-close" onClick={()=>setOpen(false)}>✕</button></div>
   <div className="theme-panel-section">
    <span className="theme-panel-label">Appearance</span>
    <div className="theme-mode-row">
     {[['light','☀️ Light'],['dark','🌙 Dark'],['system','🖥️ System']].map(([k,l])=>
      <button type="button" key={k} className={mode===k?'theme-mode-btn on':'theme-mode-btn'} onClick={()=>setMode(k)}>{l}</button>)}
    </div>
   </div>
   <div className="theme-panel-section">
    <span className="theme-panel-label">Accent Color</span>
    <div className="theme-accent-grid">
     {ACCENTS.map(a=>
      <button type="button" key={a.key} className={accent===a.key?'theme-swatch on':'theme-swatch'} onClick={()=>setAccent(a.key)} title={a.label}>
       <span className="swatch-dot" style={{background:a.swatch}}/>
       <span className="swatch-label">{a.label}</span>
      </button>)}
    </div>
   </div>
   <button type="button" className="theme-reset" onClick={resetTheme}>Reset Theme</button>
  </div>}
 </div>;
}

function Portal({session,logout}){
 const [page,setPage]=useState(session.role==='customer'?'dashboard':'admin-dashboard');
 const [customers,setCustomers]=useStore('tailor_customers',seedCustomers);
 const [orders,setOrders]=useStore('tailor_orders',[]);
 const [cart,setCart]=useStore('tailor_cart',[]);
 const [profile,setProfile]=useStore('tailor_profile_'+session.name,{name:session.name,phone:session.contact,email:'',gender:'',address:''});
 const [measurements,setMeasurements]=useStore('tailor_measurements_'+session.name,{chest:'',waist:'',shoulder:'',sleeve:'',length:'',hip:'',neck:'',armhole:''});
 const [custom,setCustom]=useState({...defaultsFromSchema(GENERIC_SCHEMA),stitching:'Standard',instructions:'',customText:'',customFont:'Arial',ownFabric:false,fabricImage:null,fabricType:'Cotton'});
 const [toast,setToast]=useState('');
 const [emailLog,setEmailLog]=useStore('tailor_email_log',[]);
 const [coupon,setCoupon]=useState('');
 const [payment,setPayment]=useState({open:false,step:'method',method:'upi',details:{},order:null});
 const [showEmailPreview,setShowEmailPreview]=useState(null);
 const [details,setDetails]=useState(null);
 const [customizeBase,setCustomizeBase]=useState(null);
 const [wishlist,setWishlist]=useStore('tailor_wishlist_'+session.name,[]);
 const toggleWishlist=useCallback(designId=>{
  setWishlist(w=>w.includes(designId)?w.filter(id=>id!==designId):[...w,designId]);
 },[setWishlist]);
 const firstRef=useRef(null);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2200);return()=>clearTimeout(t)}},[toast]);
 const customerOrders=useMemo(()=>orders.filter(o=>o.customer===session.name),[orders,session.name]);
 const subtotal=useMemo(()=>cart.reduce((s,x)=>s+x.price,0),[cart]);
 const discountRate=COUPONS[coupon.toUpperCase()]||0;
 const discount=Math.round(subtotal*discountRate);
 const cartTotal=Math.max(0,subtotal-discount);
 const notify=msg=>setToast(msg);
 const addCart=useCallback(item=>{setCart(c=>[...c,{...item,cartId:Date.now()+Math.random()}]);notify('Added to cart')},[setCart]);
 const removeCart=id=>setCart(c=>c.filter(x=>x.cartId!==id));
 const openDetails=d=>setDetails(d);
 const closeDetails=()=>setDetails(null);
 const goCustomize=d=>{setCustomizeBase(d);setPage('customize');setDetails(null)};
 const placeOrderNow=(design,qty)=>{
  setCart(c=>[...c,{...design,price:design.price*qty,qty,cartId:Date.now()+Math.random()}]);
  setDetails(null);
  setPayment({open:true,step:'confirm',method:'upi',details:{},order:null});
 };
 const saveMeasurements=()=>{if(!measurements.chest||!measurements.waist||!measurements.shoulder||!measurements.sleeve){alert('Please enter chest, waist, shoulder and sleeve.');firstRef.current?.focus();return}setCustomers(cs=>cs.map(c=>c.name===session.name?{...c,measurements}:{...c}));notify('Perfect Fit Profile saved');setPage('profile')};
 const openPayment=()=>{if(!cart.length)return alert('Cart is empty.');setPayment({open:true,step:'confirm',method:'upi',details:{},order:null})};
 const closePayment=()=>setPayment(p=>({...p,open:false}));
 const proceedToPayMethod=()=>setPayment(p=>({...p,step:'method'}));
 const sendOrderEmail=order=>{
  const to=profile.email||session.contact||`${session.name.replace(/\s+/g,'.').toLowerCase()}@example.com`;
  const hasCustomWork=order.items.some(x=>x.customization);
  const ownFabricItems=order.items.filter(x=>x.customization?.ownFabric);
  const email={
   id:'MAIL'+Date.now(),to,date:new Date().toLocaleString('en-IN'),
   subject:`Order Confirmed — ${order.id} | ${SHOP}`,
   body:`Hi ${session.name},\n\nThank you for your order at ${SHOP}!\n\nOrder ID: ${order.id}\nDate: ${order.date}\nItems: ${order.items.map(x=>x.name).join(', ')}\nTotal Paid: ₹${order.total} (${order.payment})\n${hasCustomWork?'Your custom tailoring details and text/font customization have been sent to our stitching team.\n':''}${ownFabricItems.length?`You've provided your own fabric for: ${ownFabricItems.map(x=>x.name).join(', ')}. Our tailor will use the photo you uploaded — no fabric charge applies for these items.\n`:''}\nCurrent Status: ${order.status}\n\nWe will notify you as your order moves through Cutting, Stitching, Quality Check and Delivery.\n\nWarm regards,\n${SHOP} Team`
  };
  setEmailLog(l=>[email,...l]);
  return email;
 };
 const confirmPayment=details=>{
  setPayment(p=>({...p,step:'processing',details}));
  setTimeout(()=>{
   const est=new Date();est.setDate(est.getDate()+7);
   const order={id:'ORD'+String(Date.now()).slice(-6),customer:session.name,phone:profile.phone,items:cart,date:new Date().toLocaleDateString('en-IN'),estDelivery:est.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),subtotal,discount,coupon:discountRate?coupon.toUpperCase():'',total:cartTotal,status:'Order Placed',payment:payment.method==='cod'?'Cash on Delivery':`Paid via ${PAYMENT_METHODS.find(m=>m.key===payment.method)?.label} (Demo)`,txnId:'TXN'+Date.now().toString(36).toUpperCase(),measurements};
   setOrders(o=>[...o,order]);
   const email=sendOrderEmail(order);
   setCart([]);setCoupon('');
   setPayment(p=>({...p,step:'success',order,email}));
   notify('Order placed successfully');
  },1200);
 };
 const finishPayment=()=>{closePayment();setPage('tracking')};
 const continueShopping=()=>{closePayment();setPage('designs')};
 const updateStatus=(id,status)=>setOrders(os=>os.map(o=>o.id===id?{...o,status}:o));
 const {theme,toggleTheme}=useTheme();
 const {lang,setLang,t}=useTranslation();
 return <AuthContext.Provider value={{session}}><div className="app"><header className="topbar"><div className="logo">✂ {t('appName')}</div><div className="top-user"><select className="lang-select" value={lang} onChange={e=>setLang(e.target.value)}><option value="en">EN</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option></select><ThemeCustomizer/><button className="theme-toggle" onClick={toggleTheme}>{theme==='light'?'🌙':'☀️'} {theme==='light'?t('darkTheme'):t('lightTheme')}</button><span>{session.name}</span><button onClick={logout}>{t('logout')}</button></div></header><div className="body-layout"><Sidebar session={session} page={page} setPage={setPage} cartCount={cart.length}/><main className="main">
 {session.role==='customer'?<CustomerPage page={page} setPage={setPage} session={session} profile={profile} setProfile={setProfile} measurements={measurements} setMeasurements={setMeasurements} firstRef={firstRef} saveMeasurements={saveMeasurements} designs={DESIGNS} custom={custom} setCustom={setCustom} addCart={addCart} cart={cart} removeCart={removeCart} subtotal={subtotal} discount={discount} coupon={coupon} setCoupon={setCoupon} total={cartTotal} openPayment={openPayment} orders={customerOrders} emailLog={emailLog} setShowEmailPreview={setShowEmailPreview} openDetails={openDetails} goCustomize={goCustomize} customizeBase={customizeBase} wishlist={wishlist} toggleWishlist={toggleWishlist}/>:<AdminPage page={page} setPage={setPage} customers={customers} setCustomers={setCustomers} orders={orders} updateStatus={updateStatus} emailLog={emailLog}/>} 
 </main></div>{toast&&<div className="toast">✓ {toast}</div>}
 {payment.open&&<PaymentModal payment={payment} setPayment={setPayment} cart={cart} measurements={measurements} total={cartTotal} discount={discount} subtotal={subtotal} onClose={closePayment} onProceed={proceedToPayMethod} onConfirm={confirmPayment} onFinish={finishPayment} onContinueShopping={continueShopping} onViewEmail={()=>setShowEmailPreview(payment.email)}/>}
 {showEmailPreview&&<EmailPreviewModal email={showEmailPreview} onClose={()=>setShowEmailPreview(null)}/>}
 {details&&<ProductDetailsModal design={details} wishlist={wishlist} toggleWishlist={toggleWishlist} onClose={closeDetails} onCustomize={goCustomize} onAddCart={(d,qty)=>{setCart(c=>[...c,{...d,price:d.price*qty,qty,cartId:Date.now()+Math.random()}]);notify('Added to cart');closeDetails()}} onPlaceOrder={placeOrderNow}/>}
 {session.role==='customer'&&<EncouragementPopup setPage={setPage} setCoupon={setCoupon}/>}
 </div></AuthContext.Provider>;
}

function Sidebar({session,page,setPage,cartCount}){
 const {t}=useTranslation();
 const customer=[['dashboard',t('nav_dashboard')],['profile',t('nav_profile')],['measurements',t('nav_measurements')],['designs',t('nav_designs')],['wishlist','Wishlist'],['customize',t('nav_customize')],['cart',t('nav_cart')+' '+(cartCount?`(${cartCount})`: '')],['orders',t('nav_orders')],['tracking',t('nav_tracking')],['offers',t('nav_offers')],['settings',t('nav_settings')]];
 const admin=[['admin-dashboard',t('nav_adminDashboard')],['admin-customers',t('nav_adminCustomers')],['admin-measurements',t('nav_adminMeasurements')],['admin-orders',t('nav_adminOrders')],['admin-categories',t('nav_adminCategories')],['admin-add-dress','Add New Dress'],['admin-photos','Photos'],['admin-workload',t('nav_adminWorkload')],['admin-revenue',t('nav_adminRevenue')],['admin-notifications','Notifications']];
 return <aside className="sidebar"><div className="side-role">{session.role==='customer'?t('customerPortal'):t('adminPortal')}</div>{(session.role==='customer'?customer:admin).map(([id,label])=><button key={id} onClick={()=>setPage(id)} className={page===id?'nav on':'nav'}>{label}</button>)}</aside>;
}

function CustomerPage(p){
 const {page}=p;
 if(page==='profile')return <Profile {...p}/>;
 if(page==='measurements')return <Measurements {...p}/>;
 if(page==='designs')return <Designs {...p}/>;
 if(page==='wishlist')return <WishlistPage {...p}/>;
 if(page==='customize')return <Customize {...p}/>;
 if(page==='cart')return <Cart {...p}/>;
 if(page==='orders')return <Orders orders={p.orders}/>;
 if(page==='tracking')return <Tracking orders={p.orders}/>;
 if(page==='offers')return <Offers/>;
 if(page==='settings')return <Settings/>;
 return <CustomerDashboard {...p}/>;
}

function CustomerDashboard({setPage,session,measurements,cart,orders}){
 const ALL=useCombinedDesigns();
 const {t}=useTranslation();
 const workflowPages=['designs','customize','measurements','cart','cart','tracking','tracking'];
 return <><section className="hero"><div><div className="eyebrow">CUSTOMER DASHBOARD</div><h1>{t('welcomeMsg')}, {session.name} 👋</h1><p>{t('dashboardSub')}</p><button className="primary" onClick={()=>setPage('designs')}>{t('browseDesignsBtn')}</button></div><div className="fit-card"><b>{t('perfectFitProfile')}</b><strong>{Object.values(measurements).filter(Boolean).length}/8</strong><span>{t('measurementFieldsSaved')}</span></div></section><div className="cards"><Metric title={t('metricMeasurements')} value={`${Object.values(measurements).filter(Boolean).length}/8`}/><Metric title={t('metricCartItems')} value={cart.length}/><Metric title={t('metricOrders')} value={orders.length}/><Metric title={t('metricDesigns')} value={ALL.length}/></div><SectionTitle title={t('tailoringJourneyTitle')} subtitle={t('tailoringJourneySub')}/><div className="workflow">{t('workflow').map((x,i)=><button type="button" className="workflow-item" key={x} onClick={()=>setPage(workflowPages[i]||'designs')}><b>{i+1}</b><span>{x}</span></button>)}</div></>}

function Profile({profile,setProfile,setPage}){return <><SectionTitle title="My Profile" subtitle="Keep your customer details ready for every order."/><div className="form-card grid2">{[['name','Full Name'],['phone','Phone'],['email','Email'],['gender','Gender'],['address','Address']].map(([k,l])=><label key={k}>{l}<input value={profile[k]||''} onChange={e=>setProfile({...profile,[k]:e.target.value})}/></label>)}</div><button className="primary" onClick={()=>setPage('measurements')}>Continue to Measurements</button></>}

function Measurements({measurements,setMeasurements,firstRef,saveMeasurements}){return <><SectionTitle title="Perfect Fit Profile" subtitle="Enter measurements in inches. These values are saved for future orders."/><div className="measurement-note">Tip: Measure over a comfortable garment and keep the tape straight.</div><div className="form-card grid3">{Object.entries(measurements).map(([k,v],i)=><label key={k}>{k.replace(/([A-Z])/g,' $1').toUpperCase()} (inch)<input ref={i===0?firstRef:null} type="number" min="0" value={v} onChange={e=>setMeasurements({...measurements,[k]:e.target.value})}/></label>)}</div><button className="primary" onClick={saveMeasurements}>Save Perfect Fit Profile</button></>}

// ---- Pinterest-style masonry gallery — built from real photos you've uploaded (never scraped/external) ----
function StyleGallery({designs,openDetails}){
 const {uploads}=useContext(ImageStoreContext);
 const tiles=useMemo(()=>{
  const out=[];
  designs.forEach(d=>{
   resolveGallery(d,uploads).forEach(src=>{if(src)out.push({src,design:d})});
  });
  return out;
 },[designs,uploads]);
 if(!tiles.length)return <div className="gallery-empty">
  <b>📌 Style Gallery</b>
  <p className="muted">This fills up automatically with every real photo you upload — Admin → Photos → upload a few colors/angles per design and they'll appear here as a Pinterest-style board.</p>
 </div>;
 return <div className="masonry-gallery">
  {tiles.map((t,i)=><img key={i} src={t.src} alt={t.design.name} loading="lazy" onClick={()=>openDetails(t.design)}/>)}
 </div>;
}

function Designs({setPage,addCart,openDetails,goCustomize,wishlist,toggleWishlist}){
 const [selectedCategory,setSelectedCategory]=useState(null);
 const [q,setQ]=useState('');
 const [fabric,setFabric]=useState('All');
 const [sort,setSort]=useState('default');
 const ALL=useCombinedDesigns();
 const ALL_CATEGORIES=useMemo(()=>[...new Set(ALL.map(d=>d.category))],[ALL]);
 if(!selectedCategory){
  const cats=ALL_CATEGORIES.filter(c=>c.toLowerCase().includes(q.toLowerCase()));
  return <><SectionTitle title="Browse Designs" subtitle="Real-world dress catalogue — pick a dress type to see all available designs."/>
   <div className="filters"><input placeholder="Search dress type..." value={q} onChange={e=>setQ(e.target.value)}/></div>
   {CATEGORY_GROUPS.map(g=>{
    const gcats=cats.filter(c=>ALL.find(d=>d.category===c)?.group===g);
    if(!gcats.length)return null;
    return <div key={g} className="category-group">
     <h3>{g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}</h3>
     <div className="design-grid">{gcats.map(c=>{
      const sample=ALL.find(d=>d.category===c);
      const count=ALL.filter(d=>d.category===c).length;
      return <div className="design-card type-card" key={c} onClick={()=>setSelectedCategory(c)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setSelectedCategory(c)}>
       <div className="design-image"><PhotoFrame design={sample} expectHint={false}/></div>
       <h3>{c}</h3>
       <p>{count} design{count>1?'s':''} available</p>
      </div>;
     })}</div>
    </div>;
   })}
   <SectionTitle title="📌 Style Gallery" subtitle="Every real photo uploaded across the whole catalogue, Pinterest-style. Tap a photo to open that design."/>
   <StyleGallery designs={ALL} openDetails={openDetails}/>
  </>;
 }
 const list=ALL.filter(d=>d.category===selectedCategory);
 const fabrics=['All',...new Set(list.map(d=>d.fabric))];
 let shown=fabric==='All'?list:list.filter(d=>d.fabric===fabric);
 shown=sort==='low'?[...shown].sort((a,b)=>a.price-b.price):sort==='high'?[...shown].sort((a,b)=>b.price-a.price):shown;
 return <><button type="button" className="back-link" onClick={()=>setSelectedCategory(null)}>← All Categories</button>
  <SectionTitle title={`${selectedCategory} Designs`.toUpperCase()} subtitle={list[0]?.desc||'Choose a design to view, customize or add to cart.'}/>
  <div className="filters">
   {fabrics.length>2&&<select value={fabric} onChange={e=>setFabric(e.target.value)}>{fabrics.map(f=><option key={f}>{f}</option>)}</select>}
   <select value={sort} onChange={e=>setSort(e.target.value)}>
    <option value="default">Sort: Featured</option>
    <option value="low">Price: Low to High</option>
    <option value="high">Price: High to Low</option>
   </select>
  </div>
  <div className="design-grid">
   {shown.map(d=>{const saved=wishlist?.includes(d.id);return <div className="design-card" key={d.id}>
    <div className="design-image"><PhotoFrame design={d}/></div>
    <div className="tag">{d.fabric}</div>
    <h3>{d.name}</h3>
    <p>{d.desc}</p>
    <div className="rating-row">★ {ratingFor(d)}<span>({Math.round(ratingFor(d)*37)} reviews)</span></div>
    <div className="price">Starting from ₹{d.price}</div>
    <div className="card-actions">
     <button type="button" onClick={()=>openDetails(d)}>View Details</button>
     <button type="button" onClick={()=>goCustomize(d)}>Customize</button>
     <button type="button" className="primary" onClick={()=>{addCart(d);setPage('cart')}}>Add to Cart</button>
     <button type="button" className={saved?'wishlist-btn on':'wishlist-btn'} onClick={()=>toggleWishlist(d.id)} aria-label={saved?'Remove from wishlist':'Add to wishlist'}>{saved?'♥ Saved':'♡ Wishlist'}</button>
    </div>
   </div>;})}
  </div>
  <SectionTitle title="📌 Style Gallery" subtitle={`All uploaded ${selectedCategory} photos in one board. Tap a photo to view that design.`}/>
  <StyleGallery designs={list} openDetails={openDetails}/>
 </>;
}

// ---- Wishlist page ----
function WishlistPage({wishlist,toggleWishlist,addCart,setPage,openDetails,goCustomize}){
 const ALL=useCombinedDesigns();
 const items=ALL.filter(d=>wishlist?.includes(d.id));
 return <><SectionTitle title="My Wishlist" subtitle="Designs you've saved for later."/>
  {!items.length?<div className="empty">No wishlist items yet. <button className="link" onClick={()=>setPage('designs')}>Explore Designs</button></div>:
  <div className="design-grid">
   {items.map(d=><div className="design-card" key={d.id}>
    <div className="design-image"><PhotoFrame design={d}/></div>
    <div className="tag">{d.category}</div>
    <h3>{d.name}</h3>
    <p>{d.desc}</p>
    <div className="rating-row">★ {ratingFor(d)}</div>
    <div className="price">Starting from ₹{d.price}</div>
    <div className="card-actions">
     <button type="button" onClick={()=>openDetails(d)}>View Details</button>
     <button type="button" onClick={()=>goCustomize(d)}>Customize</button>
     <button type="button" className="primary" onClick={()=>{addCart(d);setPage('cart')}}>Add to Cart</button>
     <button type="button" className="wishlist-btn on" onClick={()=>toggleWishlist(d.id)}>✕ Remove</button>
    </div>
   </div>)}
  </div>}
 </>;
}

// ---- Product Details page: realistic single-product view with gallery, colors, quantity ----
function ProductDetailsModal({design,wishlist,toggleWishlist,onClose,onCustomize,onAddCart,onPlaceOrder}){
 const {uploads}=useContext(ImageStoreContext);
 const [qty,setQty]=useState(1);
 const colors=useMemo(()=>colorsForCategory(design.category),[design.category]);
 const [color,setColor]=useState(colors[0]);
 const gallery=useMemo(()=>{const g=resolveGallery(design,uploads);return g.length?g:[null]},[design,uploads]);
 const [imgIdx,setImgIdx]=useState(0);
 const [brokenSrcs,setBrokenSrcs]=useState(()=>new Set());
 useEscClose(true,onClose);
 const schema=CUSTOMIZATION_SCHEMA[design.category]||GENERIC_SCHEMA;
 const candidates=[resolveDesignImage(design,color,uploads),gallery[imgIdx],...gallery].filter((v,i,arr)=>v&&arr.indexOf(v)===i);
 const mainSrc=candidates.find(c=>!brokenSrcs.has(c));
 const markBroken=src=>setBrokenSrcs(s=>new Set(s).add(src));
 const saved=wishlist?.includes(design.id);
 return <div className="modal-overlay" onClick={onClose}>
  <div className="modal-card details-card" role="dialog" aria-modal="true" aria-label={`${design.name} product details`} onClick={e=>e.stopPropagation()}>
   <div className="modal-head"><b>Product Details</b><button className="modal-close" aria-label="Close" onClick={onClose}>✕</button></div>
   <div className="details-image">{mainSrc?<img src={mainSrc} alt={design.name} className="photo-frame-img" onError={()=>markBroken(mainSrc)}/>:<PhotoFrame design={design} color={color}/>}</div>
   {gallery.length>1&&<div className="thumb-row">{gallery.map((g,i)=><button type="button" key={i} className={i===imgIdx?'thumb on':'thumb'} onClick={()=>setImgIdx(i)}><img src={g} alt={`${design.name} view ${i+1}`} onError={()=>markBroken(g)}/></button>)}</div>}
   <h2>{design.name}</h2>
   <div className="tag">{design.category} · {design.group==='Women'?"Women's Wear":design.group==='Men'?"Men's Wear":'Kids Wear'}</div>
   <div className="rating-row">★ {ratingFor(design)}<span>({Math.round(ratingFor(design)*37)} reviews)</span></div>
   <p className="muted">{design.desc}</p>
   <div className="price" style={{fontSize:24}}>Starting Price: ₹{design.price}</div>
   <div className="details-section">
    <b>Available Colors</b>
    <div className="color-row">{colors.map(c=><button type="button" key={c} className={c===color?'color-swatch on':'color-swatch'} onClick={()=>setColor(c)}>{c}</button>)}</div>
   </div>
   <div className="details-section">
    <b>Fabric</b><p className="muted" style={{margin:'6px 0 0'}}>{design.fabric}</p>
   </div>
   <div className="details-section">
    <b>Available Customizations</b>
    <div className="chip-row">{schema.map(f=><span className="chip" key={f.key}>{f.label}</span>)}<span className="chip">Measurements</span></div>
   </div>
   <div className="qty-row">
    <b>Quantity</b>
    <div className="qty-stepper"><button type="button" onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="Decrease quantity">−</button><span>{qty}</span><button type="button" onClick={()=>setQty(q=>q+1)} aria-label="Increase quantity">+</button></div>
   </div>
   <div className="total"><span>Total</span><b>₹{design.price*qty}</b></div>
   <div className="quick" style={{justifyContent:'flex-end'}}>
    {toggleWishlist&&<button className={saved?'wishlist-btn on':'wishlist-btn'} onClick={()=>toggleWishlist(design.id)}>{saved?'♥ Saved':'♡ Wishlist'}</button>}
    <button onClick={onClose}>Back</button>
    <button onClick={()=>onCustomize(design)}>Customize</button>
    <button onClick={()=>onAddCart(design,qty)}>Add to Cart</button>
    <button className="primary" onClick={()=>onPlaceOrder(design,qty)}>Place Order</button>
   </div>
  </div>
 </div>;
}

function Customize({custom,setCustom,addCart,customizeBase}){
 const ALL=useCombinedDesigns();
 const [base,setBase]=useState(customizeBase||ALL[0]);
 useEffect(()=>{if(customizeBase)setBase(customizeBase)},[customizeBase]);
 const schema=CUSTOMIZATION_SCHEMA[base.category]||GENERIC_SCHEMA;
 useEffect(()=>{
  setCustom(c=>({...c,...defaultsFromSchema(schema)}));
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[base.id]);
 const [fabricBusy,setFabricBusy]=useState(false);
 const [fabricError,setFabricError]=useState('');
 const update=(k,v)=>setCustom({...custom,[k]:v});
 const setOwnFabric=val=>setCustom(c=>({...c,ownFabric:val,...(val?{}:{fabricImage:null})}));
 const onFabricFile=async e=>{
  const file=e.target.files?.[0];
  e.target.value='';
  if(!file)return;
  setFabricBusy(true);setFabricError('');
  try{const dataUrl=await compressImageFile(file,500,0.8);update('fabricImage',dataUrl)}
  catch(err){setFabricError(err.message||'Could not process that photo')}
  setFabricBusy(false);
 };
 const textFontCss=FONTS.find(f=>f.key===custom.customFont)?.css||FONTS[0].css;
 const stitchingCharge=Math.round(base.price*0.4);
 const extra=150+(custom.customText?100:0);
 const price=custom.ownFabric?stitchingCharge+extra:base.price+extra;
 const item={...base,name:`${base.name} - Custom`,price,customization:custom};
 return <><SectionTitle title="Customize Dress" subtitle="Build your outfit before adding it to the cart. Options change based on the dress type."/><div className="custom-layout"><div className="preview"><div className="design-image big-dress">{custom.ownFabric&&custom.fabricImage?<img src={custom.fabricImage} alt="Your fabric" className="photo-frame-img"/>:<PhotoFrame design={base} color={custom.color||custom.topColor}/>}</div><h2>{base.name}</h2><p>Live customization summary</p>
  <ul>
   {custom.ownFabric?<li>Fabric: Your own material ({custom.fabricType||'Cotton'}) — ₹0</li>:schema.filter(f=>f.key==='fabric').map(f=><li key={f.key}>{f.label}: {custom[f.key]}</li>)}
   {schema.filter(f=>f.key!=='fabric').map(f=><li key={f.key}>{f.label}: {custom[f.key]}</li>)}
   <li>Stitching: {custom.stitching}</li>
  </ul>
  {custom.customText&&<div className="embroidery-preview" style={{fontFamily:textFontCss}}>{custom.customText}</div>}
  <span className="muted" style={{fontSize:12}}>{custom.customText?`Monogram in ${FONTS.find(f=>f.key===custom.customFont)?.label}`:'Add a name/monogram below to preview it here'}</span>
 </div><div className="form-card custom-form"><label>Dress Type<select value={base.id} onChange={e=>setBase(ALL.find(x=>x.id===e.target.value))}>{CATEGORY_GROUPS.map(g=><optgroup key={g} label={g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}>{ALL.filter(x=>x.group===g).map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</optgroup>)}</select></label>

  <label className="text-format-label">Do you have your own fabric?
   <div className="fabric-toggle">
    <button type="button" className={!custom.ownFabric?'fabric-toggle-btn on':'fabric-toggle-btn'} onClick={()=>setOwnFabric(false)}>No, use shop fabric</button>
    <button type="button" className={custom.ownFabric?'fabric-toggle-btn on':'fabric-toggle-btn'} onClick={()=>setOwnFabric(true)}>Yes, I have my own</button>
   </div>
  </label>

  {custom.ownFabric?<div className="own-fabric-box">
   <label>Fabric Type<select value={custom.fabricType||'Cotton'} onChange={e=>update('fabricType',e.target.value)}>{['Cotton','Silk','Linen','Rayon','Chiffon','Georgette','Velvet'].map(o=><option key={o}>{o}</option>)}</select></label>
   {fabricError&&<div className="upload-status error">{fabricError}</div>}
   {custom.fabricImage?<div className="fabric-preview-row">
    <img src={custom.fabricImage} alt="Uploaded fabric" className="fabric-thumb"/>
    <label className="upload-btn small">Replace<input type="file" accept="image/*" hidden disabled={fabricBusy} onChange={onFabricFile}/></label>
    <button type="button" className="remove-photo-btn small" onClick={()=>update('fabricImage',null)}>Remove</button>
   </div>:<label className="upload-btn" style={{display:'inline-block'}}>{fabricBusy?'Uploading…':'Upload Photo of Your Fabric'}<input type="file" accept="image/*" hidden disabled={fabricBusy} onChange={onFabricFile}/></label>}
   <small className="muted" style={{display:'block',marginTop:8}}>Fabric cost is ₹0 when you provide your own material — only stitching &amp; customization charges apply.</small>
  </div>:schema.filter(f=>f.key==='fabric').map(fld=><label key={fld.key}>{fld.label}<select value={custom[fld.key]||fld.options[0]} onChange={e=>update(fld.key,e.target.value)}>{fld.options.map(o=><option key={o}>{o}</option>)}</select></label>)}

  {schema.filter(fld=>fld.key!=='fabric').map(fld=><label key={fld.key}>{fld.label}<select value={custom[fld.key]||fld.options[0]} onChange={e=>update(fld.key,e.target.value)}>{fld.options.map(o=><option key={o}>{o}</option>)}</select></label>)}
  <label>Stitching<select value={custom.stitching} onChange={e=>update('stitching',e.target.value)}>{['Standard','Premium','Express'].map(o=><option key={o}>{o}</option>)}</select></label>
  <label className="text-format-label">Custom Text / Name / Monogram<input value={custom.customText} maxLength={20} onChange={e=>update('customText',e.target.value)} placeholder="e.g. Arun or A.K."/></label>
  <label className="text-format-label">Letter Formatting (Font Style)
   <select className="font-select" value={custom.customFont} onChange={e=>update('customFont',e.target.value)} style={{fontFamily:textFontCss}}>
    {FONTS.map(f=><option key={f.key} value={f.key} style={{fontFamily:f.css}}>{f.label}</option>)}
   </select>
   <div className="font-swatches">{FONTS.map(f=><button type="button" key={f.key} className={custom.customFont===f.key?'font-swatch on':'font-swatch'} style={{fontFamily:f.css}} onClick={()=>update('customFont',f.key)}>Aa</button>)}</div>
  </label>
  <label>Special Instructions<textarea value={custom.instructions} onChange={e=>update('instructions',e.target.value)} placeholder="Any tailoring instruction..."/></label>
  <button className="primary full" disabled={custom.ownFabric&&!custom.fabricImage} onClick={()=>addCart(item)}>Add Customized Dress to Cart — ₹{item.price}</button>
  {custom.ownFabric&&!custom.fabricImage&&<small className="muted" style={{display:'block',marginTop:6}}>Upload a photo of your fabric to continue.</small>}
 </div></div></>;
}

function Cart({cart,removeCart,subtotal,discount,coupon,setCoupon,total,openPayment,setPage}){
 const [code,setCode]=useState(coupon||'');
 const apply=()=>{if(!COUPONS[code.toUpperCase()]){alert('Invalid or expired coupon code.');return}setCoupon(code.toUpperCase());};
 return <><SectionTitle title="Cart & Checkout" subtitle="Review your selected outfits and complete payment."/>{!cart.length?<div className="empty">Your cart is empty. <button className="link" onClick={()=>setPage('designs')}>Browse Designs</button></div>:<div className="cart-card">
  {cart.map(x=><div className="cart-row" key={x.cartId}><span className="cart-item-name"><span className="cart-mini-icon"><PhotoFrame design={x} expectHint={false}/></span>{x.name}{x.qty>1?` × ${x.qty}`:''}{x.customization?.ownFabric?<em className="own-fabric-tag"> · Own Fabric</em>:null}{x.customization?.customText?<em className="mono-tag" style={{fontFamily:FONTS.find(f=>f.key===x.customization.customFont)?.css}}> "{x.customization.customText}"</em>:null}</span><b>₹{x.price}</b><button onClick={()=>removeCart(x.cartId)}>Remove</button></div>)}
  <div className="coupon-row"><input placeholder="Coupon code (e.g. WELCOME5)" value={code} onChange={e=>setCode(e.target.value)}/><button type="button" onClick={apply}>Apply</button></div>
  {coupon&&discount>0&&<div className="discount-line">🎉 Coupon <b>{coupon}</b> applied — you saved ₹{discount}</div>}
  <div className="total sub"><span>Subtotal</span><b>₹{subtotal}</b></div>
  {discount>0&&<div className="total sub discount"><span>Discount</span><b>-₹{discount}</b></div>}
  <div className="total"><span>Grand Total</span><b>₹{total}</b></div>
  <div className="payment"><b>Payment Method</b><div className="payment-options">{PAYMENT_METHODS.map(m=><span key={m.key}>{m.icon} {m.label}</span>)}</div><small>Secure demo payment — no real money is charged.</small></div>
  <p className="encourage-line">Your perfect-fit outfit is almost ready! ✨ Everything looks great — ready to place your order?</p>
  <button className="primary full" onClick={openPayment}>Proceed to Payment — ₹{total}</button>
 </div>}</>
}

function Orders({orders}){return <><SectionTitle title="Order History" subtitle="All your tailoring orders."/>{orders.length?orders.map(o=><OrderCard order={o} key={o.id}/>):<div className="empty">No orders yet.</div>}</>}
function Tracking({orders}){return <><SectionTitle title="Order Tracking" subtitle="See exactly where your dress is in the tailoring process."/>{orders.length?orders.map(o=><OrderCard order={o} key={o.id}/>):<div className="empty">Place an order to start tracking.</div>}</>}
// ---- Escape-to-close helper for modals ----
function useEscClose(active,onClose){
 useEffect(()=>{
  if(!active)return;
  const onKey=e=>{if(e.key==='Escape')onClose()};
  document.addEventListener('keydown',onKey);
  return()=>document.removeEventListener('keydown',onKey);
 },[active,onClose]);
}

// ---- Lightweight confetti burst (no extra dependency) ----
function Confetti(){
 const pieces=useMemo(()=>{
  const colors=['#d76578','#b48a4a','#6a3159','#f2b7a0','#4c8b70','#3182ce'];
  return Array.from({length:26},(_,i)=>({id:i,left:Math.random()*100,color:colors[i%colors.length],delay:(Math.random()*0.4).toFixed(2),dur:(1.6+Math.random()*1.1).toFixed(2),rot:Math.round(Math.random()*360)}));
 },[]);
 return <div className="confetti-wrap" aria-hidden="true">{pieces.map(p=><span key={p.id} className="confetti-piece" style={{left:p.left+'%',background:p.color,animationDelay:p.delay+'s',animationDuration:p.dur+'s',transform:`rotate(${p.rot}deg)`}}/>)}</div>;
}

// ---- Payment Process: confirm -> method select -> processing -> success + receipt ----
function PaymentModal({payment,setPayment,cart,measurements,total,discount,subtotal,onClose,onProceed,onConfirm,onFinish,onContinueShopping,onViewEmail}){
 const {step,method,order}=payment;
 const [upi,setUpi]=useState('');
 const [card,setCard]=useState({number:'',name:'',expiry:'',cvv:''});
 const setMethod=m=>setPayment(p=>({...p,method:m}));
 const closable=step!=='processing';
 useEscClose(closable,onClose);
 const pay=()=>{
  if(method==='upi'&&!/^[\w.\-]{2,}@[\w]{2,}$/.test(upi))return alert('Enter a valid UPI ID, e.g. name@bank');
  if(method==='card'&&(card.number.replace(/\s/g,'').length<12||!card.name||card.expiry.length<4||card.cvv.length<3))return alert('Please fill valid card details.');
  onConfirm(method==='upi'?{upi}:method==='card'?card:{cod:true});
 };
 const measurementCount=Object.values(measurements||{}).filter(Boolean).length;
 return <div className="modal-overlay" onClick={closable?onClose:undefined}>
  <div className="modal-card" role="dialog" aria-modal="true" aria-label={step==='confirm'?'Confirm your order':step==='method'?'Choose payment method':step==='success'?'Order placed successfully':'Processing payment'} onClick={e=>e.stopPropagation()}>
   {step==='confirm'&&<>
    <div className="modal-head"><b>Confirm Your Order</b>{closable&&<button className="modal-close" aria-label="Close" onClick={onClose}>✕</button>}</div>
    <p className="encourage-line">Your custom dress is ready to be sent to our tailoring workflow. Everything looks perfect — ready to place your order? ✨</p>
    <div className="confirm-summary">
     {cart.map(x=><div className="confirm-row" key={x.cartId}><span className="cart-item-name"><span className="cart-mini-icon"><PhotoFrame design={x} expectHint={false}/></span>{x.name}{x.qty>1?` × ${x.qty}`:''}{x.customization?.ownFabric?<em className="own-fabric-tag"> · Own Fabric</em>:null}</span><b>₹{x.price}</b></div>)}
     {cart.some(x=>x.customization)&&<div className="confirm-sub"><span>Customization</span><small>{cart.filter(x=>x.customization).map(x=>`${x.customization.fabric}, ${x.customization.color}${x.customization.customText?`, "${x.customization.customText}"`:''}`).join(' · ')}</small></div>}
     <div className="confirm-sub"><span>Measurements</span><small>{measurementCount}/8 fields saved</small></div>
     <div className="confirm-sub"><span>Quantity</span><small>{cart.length} item{cart.length>1?'s':''}</small></div>
    </div>
    <div className="total sub"><span>Subtotal</span><b>₹{subtotal}</b></div>
    {discount>0&&<div className="total sub discount"><span>Discount</span><b>-₹{discount}</b></div>}
    <div className="total"><span>Total Amount</span><b>₹{total}</b></div>
    <div className="quick" style={{justifyContent:'flex-end'}}>
     <button onClick={onClose}>Cancel</button>
     <button className="primary" onClick={onProceed}>Yes, Place Order</button>
    </div>
   </>}
   {step==='method'&&<>
    <div className="modal-head"><b>Choose Payment Method</b><button className="modal-close" aria-label="Close" onClick={onClose}>✕</button></div>
    <div className="pay-method-grid">{PAYMENT_METHODS.map(m=><button type="button" key={m.key} className={method===m.key?'pay-method on':'pay-method'} onClick={()=>setMethod(m.key)}><span className="pm-icon">{m.icon}</span><span>{m.label}</span><small>{m.hint}</small></button>)}</div>
    {method==='upi'&&<label>UPI ID<input placeholder="yourname@upi" value={upi} onChange={e=>setUpi(e.target.value)}/></label>}
    {method==='card'&&<div className="grid2">
     <label>Card Number<input placeholder="1234 5678 9012 3456" value={card.number} onChange={e=>setCard({...card,number:e.target.value})}/></label>
     <label>Name on Card<input placeholder="Full name" value={card.name} onChange={e=>setCard({...card,name:e.target.value})}/></label>
     <label>Expiry<input placeholder="MM/YY" value={card.expiry} onChange={e=>setCard({...card,expiry:e.target.value})}/></label>
     <label>CVV<input placeholder="•••" type="password" value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value})}/></label>
    </div>}
    {method==='cod'&&<p className="muted">Pay in cash to our delivery partner or in-store when your order arrives.</p>}
    <div className="total sub"><span>Subtotal</span><b>₹{subtotal}</b></div>
    {discount>0&&<div className="total sub discount"><span>Discount</span><b>-₹{discount}</b></div>}
    <div className="total"><span>Payable</span><b>₹{total}</b></div>
    <button className="primary full" onClick={pay}>{method==='cod'?'Confirm Order (Pay on Delivery)':`Pay ₹${total} Now`}</button>
    <small className="muted">🔒 Demo payment — no real money is charged.</small>
   </>}
   {step==='processing'&&<div className="pay-processing"><div className="spinner"/><b>Processing your payment…</b><span className="muted">Please don't close this window.</span></div>}
   {step==='success'&&order&&<div className="pay-success">
    <Confetti/>
    <div className="success-tick">✓</div>
    <h2>🎉 Order Placed Successfully!</h2>
    <p className="muted">Thank you — your tailoring order has been confirmed.</p>
    <div className="receipt">
     <div><span>Order ID</span><b>{order.id}</b></div>
     <div><span>Transaction ID</span><b>{order.txnId}</b></div>
     <div><span>Payment</span><b>{order.payment}</b></div>
     <div><span>Amount Paid</span><b>₹{order.total}</b></div>
     <div><span>Estimated Delivery</span><b>{order.estDelivery}</b></div>
    </div>
    <p className="email-note">📧 A confirmation email with your order &amp; customization details has been sent{order.items?.some(x=>x.customization?.customText)?' to our stitching team':''}.</p>
    <div className="quick" style={{justifyContent:'center'}}>
     <button onClick={onViewEmail}>View Confirmation Email</button>
     <button onClick={onContinueShopping}>Continue Shopping</button>
     <button className="primary" onClick={onFinish}>Track Order</button>
    </div>
   </div>}
  </div>
 </div>;
}

function EmailPreviewModal({email,onClose}){
 useEscClose(!!email,onClose);
 if(!email)return null;
 return <div className="modal-overlay" onClick={onClose}><div className="modal-card email-card" role="dialog" aria-modal="true" aria-label="Order confirmation email preview" onClick={e=>e.stopPropagation()}>
  <div className="modal-head"><b>✉ Order Confirmation Email</b><button className="modal-close" aria-label="Close" onClick={onClose}>✕</button></div>
  <div className="email-meta"><div><span>To</span><b>{email.to}</b></div><div><span>Date</span><b>{email.date}</b></div><div><span>Subject</span><b>{email.subject}</b></div></div>
  <pre className="email-body">{email.body}</pre>
 </div></div>;
}

// ---- Encouragement popup: nudges an engaged visitor toward completing an order ----
function EncouragementPopup({setPage,setCoupon}){
 const [visible,setVisible]=useState(false);
 const [dismissed,setDismissed]=useState(()=>sessionStorage.getItem('tailor_encouragement_shown')==='1');
 const close=useCallback(()=>{setVisible(false);setDismissed(true);sessionStorage.setItem('tailor_encouragement_shown','1')},[]);
 useEscClose(visible&&!dismissed,close);
 useEffect(()=>{
  if(dismissed)return;
  const timer=setTimeout(()=>setVisible(true),18000);
  const onScroll=()=>{
   const doc=document.documentElement;
   const scrolled=doc.scrollTop/((doc.scrollHeight-doc.clientHeight)||1);
   if(scrolled>0.6)setVisible(true);
  };
  window.addEventListener('scroll',onScroll,true);
  return()=>{clearTimeout(timer);window.removeEventListener('scroll',onScroll,true)};
 },[dismissed]);
 const claim=()=>{setCoupon('WELCOME5');setPage('designs');close()};
 if(dismissed||!visible)return null;
 return <div className="encourage-overlay" onClick={close}>
  <div className="encourage-card" role="dialog" aria-modal="true" aria-label="Special offer" onClick={e=>e.stopPropagation()}>
   <button className="modal-close" aria-label="Close" onClick={close}>✕</button>
   <div className="encourage-icon">🎁</div>
   <h3>Still exploring? You're one step away!</h3>
   <p>Grab <b>5% OFF</b> your first custom-stitched outfit. Perfect fit, perfect price — designed just for you.</p>
   <div className="encourage-code">WELCOME5</div>
   <button className="primary full" onClick={claim}>Apply Code &amp; Browse Designs</button>
   <button className="link" onClick={close}>Maybe later</button>
  </div>
 </div>;
}

function OrderCard({order}){const current=STATUSES.indexOf(order.status);return <div className="order-card"><div className="order-head"><div><b>{order.id}</b><span>{order.date}</span></div><strong>₹{order.total}</strong></div><p>{order.items.map(x=>x.name).join(', ')}</p><span className="status">{order.status}</span><div className="progress">{STATUSES.filter(x=>x!=='Cancelled').map((s,i)=><div key={s} className={i<=current?'done':''}><i></i><span>{s}</span></div>)}</div></div>}
function Offers(){return <><SectionTitle title="Offers & Recommendations" subtitle="Smart suggestions based on your tailoring journey."/><div className="offer-grid"><div><b>NEW CUSTOMER</b><h2>10% OFF</h2><p>First custom stitching order.</p></div><div><b>PERFECT FIT</b><h2>Save Measurements</h2><p>Reuse your measurements for every future order.</p></div><div><b>RECOMMENDED</b><h2>Premium Blouse</h2><p>Popular for wedding and festive orders.</p></div></div></>}
function Settings(){
 const {theme,toggleTheme}=useTheme();
 const {lang,setLang,t}=useTranslation();
 return <><SectionTitle title={t('settingsTitle')} subtitle={t('settingsSub')}/><div className="settings-card">
  <label>{t('themeLabel')}<div style={{display:'flex',gap:10,marginTop:6}}><button type="button" className={theme==='light'?'primary':''} onClick={()=>theme!=='light'&&toggleTheme()}>☀️ {t('lightTheme')}</button><button type="button" className={theme==='dark'?'primary':''} onClick={()=>theme!=='dark'&&toggleTheme()}>🌙 {t('darkTheme')}</button></div></label>
  <label>Theme Customizer<div style={{marginTop:6}}><ThemeCustomizer/></div></label>
  <label>{t('languageLabel')}<select className="lang-select" value={lang} onChange={e=>setLang(e.target.value)} style={{marginTop:6,maxWidth:220}}><option value="en">English</option><option value="ta">தமிழ் (Tamil)</option><option value="hi">हिन्दी (Hindi)</option></select></label>
  <label><input type="checkbox" defaultChecked/> {t('notif1')}</label>
  <label><input type="checkbox" defaultChecked/> {t('notif2')}</label>
  <label><input type="checkbox"/> {t('notif3')}</label>
  <p className="muted">{t('localDataNote')}</p>
 </div></>}

function AdminPage(p){const {page}=p;if(page==='admin-customers')return <AdminCustomers {...p}/>;if(page==='admin-measurements')return <AdminMeasurements {...p}/>;if(page==='admin-orders')return <AdminOrders {...p}/>;if(page==='admin-categories')return <AdminCategories/>;if(page==='admin-add-dress')return <AdminAddDress/>;if(page==='admin-photos')return <AdminPhotos/>;if(page==='admin-workload')return <AdminWorkload orders={p.orders}/>;if(page==='admin-revenue')return <AdminRevenue orders={p.orders}/>;if(page==='admin-notifications')return <AdminNotifications emailLog={p.emailLog}/>;return <AdminDashboard {...p}/>}

// ---- Admin: Add a brand-new dress type/design, under Women, Men, or Kids, whenever you like ----
function AdminAddDress(){
 const {customDesigns,addCustomDesign,removeCustomDesign}=useContext(CustomDesignsContext);
 const {uploadImage}=useContext(ImageStoreContext);
 const blank={group:'Women',category:'',name:'',fabric:'Cotton',price:'',desc:''};
 const [form,setForm]=useState(blank);
 const [photo,setPhoto]=useState(null);
 const [photoPreview,setPhotoPreview]=useState(null);
 const [status,setStatus]=useState(null);
 const [saving,setSaving]=useState(false);
 const set=(k,v)=>setForm(f=>({...f,[k]:v}));
 const onPhoto=e=>{
  const file=e.target.files?.[0];
  e.target.value='';
  if(!file)return;
  setPhoto(file);
  setPhotoPreview(URL.createObjectURL(file));
 };
 const submit=async()=>{
  if(!form.category.trim()||!form.name.trim()||!form.price){setStatus({type:'error',text:'Please fill in dress type, design name, and price.'});return}
  setSaving(true);
  const slug=slugify(form.category)+'-custom-'+Date.now().toString(36);
  const design={
   id:'custom-'+Date.now(),
   name:form.name.trim(),category:form.category.trim(),group:form.group,
   fabric:form.fabric,price:Number(form.price)||0,
   desc:form.desc.trim()||`Custom ${form.category} added by the shop`,
   slug,variant:1,custom:true
  };
  if(photo){
   try{await uploadImage(design,null,photo)}
   catch(err){setStatus({type:'error',text:`Design saved, but the photo failed: ${err.message}`});}
  }
  addCustomDesign(design);
  setStatus(s=>s||{type:'success',text:`✓ Added "${design.name}" under ${design.group==='Women'?"Women's":design.group==='Men'?"Men's":"Kids'"} Wear.`});
  setForm(blank);setPhoto(null);setPhotoPreview(null);
  setSaving(false);
 };
 return <><SectionTitle title="Add New Dress" subtitle="Create any dress type you want, for Women, Men, or Kids — it shows up in Browse Designs and Customize right away."/>
  {status&&<div className={status.type==='error'?'upload-status error':'upload-status success'}>{status.text}</div>}
  <div className="form-card add-dress-form">
   <label>Category<div className="fabric-toggle">{['Women','Men','Kids'].map(g=><button type="button" key={g} className={form.group===g?'fabric-toggle-btn on':'fabric-toggle-btn'} onClick={()=>set('group',g)}>{g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}</button>)}</div></label>
   <label>Dress Type / Category Name<input value={form.category} onChange={e=>set('category',e.target.value)} placeholder="e.g. Angrakha, Cape Gown, Indo-Western Suit"/></label>
   <label>Design Name<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Festive Angrakha Set"/></label>
   <div className="grid2">
    <label>Fabric<select value={form.fabric} onChange={e=>set('fabric',e.target.value)}>{['Cotton','Silk','Linen','Rayon','Chiffon','Georgette','Velvet','Denim','Wool Blend'].map(o=><option key={o}>{o}</option>)}</select></label>
    <label>Starting Price (₹)<input type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="1299"/></label>
   </div>
   <label>Description<textarea value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder="Short description shown to customers"/></label>
   <label>Photo (optional — you can add this later in Photos too)
    {photoPreview?<div className="fabric-preview-row"><img src={photoPreview} alt="" className="fabric-thumb"/><button type="button" className="remove-photo-btn small" onClick={()=>{setPhoto(null);setPhotoPreview(null)}}>Remove</button></div>:<label className="upload-btn" style={{display:'inline-block'}}>Choose Photo<input type="file" accept="image/*" hidden onChange={onPhoto}/></label>}
   </label>
   <button className="primary full" disabled={saving} onClick={submit}>{saving?'Adding…':'Add Design'}</button>
  </div>

  {customDesigns.length>0&&<><SectionTitle title="Your Custom Designs" subtitle="Designs you've added yourself."/>
   <div className="design-grid">
    {customDesigns.map(d=><div className="design-card" key={d.id}>
     <div className="design-image"><PhotoFrame design={d} expectHint={false}/></div>
     <div className="tag">{d.category}</div>
     <h3>{d.name}</h3>
     <p>{d.desc}</p>
     <div className="price">Starting from ₹{d.price}</div>
     <button type="button" className="remove-photo-btn full" onClick={()=>removeCustomDesign(d.id)}>Remove Design</button>
    </div>)}
   </div></>}
 </>;
}

// ---- Admin Photos: upload/replace/remove a real photo for any design, right from the browser ----
// ---- Quick bulk upload: pick many photos at once, assign each to a design in one screen ----
function QuickPhotoUpload({onSaved}){
 const ALL=useCombinedDesigns();
 const [pending,setPending]=useState([]);
 const [saving,setSaving]=useState(false);
 const [status,setStatus]=useState(null);
 useEffect(()=>{if(status){const t=setTimeout(()=>setStatus(null),9000);return()=>clearTimeout(t)}},[status]);
 const guessDesign=name=>{
  const n=name.toLowerCase();
  return ALL.find(d=>n.includes(d.slug))||ALL.find(d=>n.includes(slugify(d.category)))||null;
 };
 const onSelectFiles=e=>{
  const files=Array.from(e.target.files||[]);
  const rows=files.map(file=>{const guess=guessDesign(file.name);return {file,previewUrl:URL.createObjectURL(file),designId:guess?guess.id:'',color:''}});
  setPending(p=>[...p,...rows]);
  setStatus(null);
  e.target.value='';
 };
 const updateRow=(i,patch)=>setPending(p=>p.map((r,idx)=>idx===i?{...r,...patch}:r));
 const removeRow=i=>setPending(p=>p.filter((_,idx)=>idx!==i));
 const saveAll=async()=>{
  const ready=pending.filter(r=>r.designId);
  if(!ready.length){setStatus({type:'error',text:'Pick a dress type for at least one photo first (use the dropdown under each photo).'});return}
  setSaving(true);
  setStatus(null);
  const failed=[];
  for(const row of pending){
   if(!row.designId)continue;
   const design=ALL.find(d=>d.id===row.designId);
   try{
    await onSaved(design,row.color||null,row.file);
   }catch(err){
    failed.push({name:row.file.name,msg:err?.message||'could not process this image'});
   }
  }
  setSaving(false);
  const okCount=ready.length-failed.length;
  if(failed.length){
   setPending(p=>p.filter(r=>r.designId&&failed.some(f=>f.name===r.file.name)));
   setStatus({type:'error',text:`Saved ${okCount} photo${okCount===1?'':'s'}. ${failed.length} failed — ${failed.map(f=>`${f.name}: ${f.msg}`).join('; ')}`});
  }else{
   setPending([]);
   setStatus({type:'success',text:`✓ Saved ${okCount} photo${okCount===1?'':'s'}. Scroll down to see them on the design cards.`});
  }
 };
 return <div className="quick-upload-card">
  <b>Quick Upload — add many photos at once</b>
  <p className="muted" style={{margin:'4px 0 12px'}}>Select all your photos together, then match each one to its dress type below.</p>
  {status&&<div className={status.type==='error'?'upload-status error':'upload-status success'}>{status.text}</div>}
  <label className="upload-btn" style={{display:'inline-block',maxWidth:220}}>Choose Photos
   <input type="file" accept="image/*" multiple hidden onChange={onSelectFiles}/>
  </label>
  {pending.length>0&&<div className="quick-upload-rows">
   {pending.map((row,i)=>{
    const design=ALL.find(d=>d.id===row.designId);
    const colors=design?colorsForCategory(design.category):[];
    return <div className="quick-upload-row" key={i}>
     <img src={row.previewUrl} alt="" className="quick-upload-thumb"/>
     <div className="quick-upload-fields">
      <span className="muted" style={{fontSize:11}}>{row.file.name}</span>
      <select value={row.designId} onChange={e=>updateRow(i,{designId:e.target.value,color:''})}>
       <option value="">Select dress type…</option>
       {CATEGORY_GROUPS.map(g=><optgroup key={g} label={g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}>{ALL.filter(d=>d.group===g).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</optgroup>)}
      </select>
      {design&&<select value={row.color} onChange={e=>updateRow(i,{color:e.target.value})}>
       <option value="">Main photo</option>
       {colors.map(c=><option key={c} value={c}>{c} (color variant)</option>)}
      </select>}
     </div>
     <button type="button" className="remove-photo-btn small" onClick={()=>removeRow(i)}>✕</button>
    </div>;
   })}
   <button type="button" className="primary full" disabled={saving} onClick={saveAll}>{saving?'Saving…':`Save All (${pending.length})`}</button>
  </div>}
 </div>;
}

function AdminPhotos(){
 const {uploads,uploadImage,removeImage}=useContext(ImageStoreContext);
 const ALL=useCombinedDesigns();
 const [busy,setBusy]=useState(null);
 const [openColor,setOpenColor]=useState(null);
 const [error,setError]=useState('');
 const onPick=async(design,color,file)=>{
  if(!file)return;
  if(!file.type.startsWith('image/')){setError('Please choose an image file.');return}
  setBusy(imageKeyFor(design,color));
  setError('');
  try{await uploadImage(design,color,file)}
  catch(err){setError(`Could not save "${file.name}": ${err.message}`)}
  setBusy(null);
 };
 const totalUploaded=Object.keys(uploads).length;
 // ---- Image validation: catches the exact failure modes the "strict image" requirements care about ----
 const validation=useMemo(()=>{
  const mainKeys=ALL.map(d=>imageKeyFor(d));
  const withPhoto=mainKeys.filter(k=>uploads[k]).length;
  // Duplicate detection: same uploaded file (by content) used for two different design/color keys.
  const byValue={};
  Object.entries(uploads).forEach(([key,val])=>{(byValue[val]=byValue[val]||[]).push(key)});
  const duplicateGroups=Object.values(byValue).filter(keys=>keys.length>1);
  const keyToLabel=key=>{
   const [slug,variant,...colorParts]=key.split('-');
   const d=ALL.find(x=>x.slug===slug&&String(x.variant).padStart(2,'0')===variant);
   const color=colorParts.join('-');
   return d?`${d.name}${color?` (${color})`:''}`:key;
  };
  return {withPhoto,total:mainKeys.length,duplicateGroups,keyToLabel};
 },[uploads,ALL]);
 return <><SectionTitle title="Manage Product Photos" subtitle={`Upload real photos straight from your browser — no code or rebuild needed. ${totalUploaded} photo${totalUploaded===1?'':'s'} uploaded so far.`}/>
  <div className="validation-card">
   <b>✓ Image Validation</b>
   <div className="validation-row"><span>Dress types with a real photo</span><b>{validation.withPhoto} / {validation.total}</b></div>
   <div className="validation-row"><span>Still showing "Photo coming soon"</span><b>{validation.total-validation.withPhoto}</b></div>
   {validation.duplicateGroups.length>0?<div className="validation-warning">
    <b>⚠️ Same photo used for more than one product:</b>
    <ul>{validation.duplicateGroups.map((keys,i)=><li key={i}>{keys.map(validation.keyToLabel).join('  ↔  ')}</li>)}</ul>
    <small>Each product should have its own unique photo — replace one of these.</small>
   </div>:<div className="validation-ok">✓ No duplicate photos detected — every uploaded photo is unique to its product.</div>}
   <small className="muted" style={{display:'block',marginTop:8}}>Broken or corrupted photos never show a broken-image icon — the app automatically falls back to another photo of the same product, or to the "Photo coming soon" placeholder, and never borrows a photo from a different product.</small>
  </div>
  {error&&<div className="upload-status error">{error}</div>}
  <QuickPhotoUpload onSaved={uploadImage}/>
  {CATEGORY_GROUPS.map(g=><div key={g} className="category-group">
   <h3>{g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}</h3>
   <div className="design-grid">
    {ALL.filter(d=>d.group===g).map(d=>{
     const colors=colorsForCategory(d.category);
     const key=imageKeyFor(d);
     const hasMain=!!uploads[key];
     return <div className="design-card photo-manage-card" key={d.id}>
      <div className="design-image"><PhotoFrame design={d} expectHint={false}/></div>
      <h3>{d.name}</h3>
      <p className="muted" style={{minHeight:'auto'}}>{d.category} · {d.fabric}</p>
      <div className="photo-manage-actions">
       <label className="upload-btn">{busy===key?'Uploading…':hasMain?'Replace Main Photo':'Upload Main Photo'}
        <input type="file" accept="image/*" hidden disabled={busy===key} onChange={e=>onPick(d,null,e.target.files?.[0])}/>
       </label>
       {hasMain&&<button type="button" className="remove-photo-btn" onClick={()=>removeImage(d,null)}>Remove</button>}
      </div>
      <button type="button" className="link" style={{marginTop:8}} onClick={()=>setOpenColor(openColor===d.id?null:d.id)}>{openColor===d.id?'Hide color photos':'+ Add a color-specific photo'}</button>
      {openColor===d.id&&<div className="color-upload-grid">
       {colors.map(c=>{
        const ckey=imageKeyFor(d,c);
        const has=!!uploads[ckey];
        return <div className="color-upload-row" key={c}>
         <span>{c}</span>
         <label className="upload-btn small">{busy===ckey?'…':has?'Replace':'Upload'}
          <input type="file" accept="image/*" hidden disabled={busy===ckey} onChange={e=>onPick(d,c,e.target.files?.[0])}/>
         </label>
         {has&&<button type="button" className="remove-photo-btn small" onClick={()=>removeImage(d,c)}>✕</button>}
        </div>;
       })}
      </div>}
     </div>;
    })}
   </div>
  </div>)}
 </>;
}
function AdminNotifications({emailLog}){return <><SectionTitle title="Order Notifications" subtitle="Every order-confirmation email sent to customers."/>{!emailLog?.length?<div className="empty">No notifications sent yet.</div>:emailLog.map(m=><div className="admin-order" key={m.id}><div><b>{m.subject}</b><span>{m.to}</span><small>{m.date}</small></div></div>)}</>}
function AdminDashboard({customers,orders,setPage}){const active=orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length;const revenue=orders.reduce((s,o)=>s+o.total,0);return <><section className="hero admin"><div><div className="eyebrow">TAILOR SHOP OWNER</div><h1>Shop Dashboard</h1><p>Manage customers, measurements, stitching work, delivery and revenue.</p></div><div className="shop-icon">✂</div></section><div className="cards"><Metric title="Customers" value={customers.length}/><Metric title="Active Orders" value={active}/><Metric title="Delivered" value={orders.filter(o=>o.status==='Delivered').length}/><Metric title="Revenue" value={'₹'+revenue}/></div><SectionTitle title="Quick Actions"/><div className="quick"><button onClick={()=>setPage('admin-customers')}>＋ Add Customer</button><button onClick={()=>setPage('admin-measurements')}>📏 Review Measurements</button><button onClick={()=>setPage('admin-orders')}>📋 Manage Orders</button></div></>}
function AdminCustomers({customers,setCustomers}){const [form,setForm]=useState({name:'',phone:'',email:''});const add=()=>{if(!form.name)return alert('Enter customer name');setCustomers([...customers,{id:'CUS'+String(customers.length+1).padStart(3,'0'),...form,measurements:{},created:new Date().toLocaleDateString('en-IN')}]);setForm({name:'',phone:'',email:''})};return <><SectionTitle title="Customer Management" subtitle="Register customers who visit your tailoring shop."/><div className="form-card add-grid"><input placeholder="Customer name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><button className="primary" onClick={add}>＋ Add Customer</button></div><Table headers={['ID','Customer','Phone','Email','Created']} rows={customers.map(c=>[c.id,c.name,c.phone||'—',c.email||'—',c.created||'—'])}/></>}
function AdminMeasurements({customers}){return <><SectionTitle title="Measurement Management" subtitle="Check customer measurements before cutting cloth."/><Table headers={['Customer','Chest','Waist','Shoulder','Sleeve','Length','Status']} rows={customers.map(c=>[c.name,c.measurements?.chest||'—',c.measurements?.waist||'—',c.measurements?.shoulder||'—',c.measurements?.sleeve||'—',c.measurements?.length||'—',Object.values(c.measurements||{}).filter(Boolean).length?'Verified':'Pending'])}/></>}
function AdminOrders({orders,updateStatus}){return <><SectionTitle title="Order & Stitching Management" subtitle="Move every order through the tailoring workflow."/>{orders.length?orders.map(o=>{const fabricItems=o.items.filter(x=>x.customization?.ownFabric&&x.customization?.fabricImage);return <div className="admin-order" key={o.id}><div><b>{o.id}</b><strong>{o.customer}</strong><span>{o.items.map(x=>x.name).join(', ')}</span><small>₹{o.total} · {o.payment}</small>
 {fabricItems.length>0&&<div className="fabric-supplied-row"><small className="own-fabric-tag">📷 Customer-supplied fabric:</small>{fabricItems.map((x,i)=><img key={i} src={x.customization.fabricImage} alt="Customer fabric" className="fabric-thumb small" title={x.name}/>)}</div>}
 </div><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>;}):<div className="empty">No orders received yet.</div>}</>}
function AdminCategories(){const ALL=useCombinedDesigns();return <><SectionTitle title="Dress Categories" subtitle="Manage the shop's real-world tailoring categories."/>{CATEGORY_GROUPS.map(g=><div key={g} className="category-group"><h3>{g==='Women'?"Women's Wear":g==='Men'?"Men's Wear":'Kids Wear'}</h3><div className="category-grid">{[...new Set(ALL.filter(d=>d.group===g).map(d=>d.category))].map(c=><div key={c}><b>{c}</b><span>{ALL.filter(d=>d.category===c).length} design{ALL.filter(d=>d.category===c).length>1?'s':''}</span><button>Edit</button></div>)}</div></div>)}</>}
function AdminWorkload({orders}){const counts=STATUSES.reduce((a,s)=>({...a,[s]:orders.filter(o=>o.status===s).length}),{});return <><SectionTitle title="Tailoring Workload" subtitle="See how many orders are at each stage."/><div className="workload">{STATUSES.map(s=><div key={s}><span>{s}</span><b>{counts[s]}</b><div><i style={{width:Math.min(100,counts[s]*12)+'%'}}/></div></div>)}</div></>}
function AdminRevenue({orders}){const revenue=orders.reduce((s,o)=>s+o.total,0);const avg=orders.length?Math.round(revenue/orders.length):0;return <><SectionTitle title="Revenue & Reports" subtitle="Simple business analytics for the tailoring shop."/><div className="cards"><Metric title="Total Revenue" value={'₹'+revenue}/><Metric title="Orders" value={orders.length}/><Metric title="Average Order" value={'₹'+avg}/><Metric title="Paid Orders" value={orders.filter(o=>o.payment?.includes('Paid')).length}/></div><Table headers={['Order','Customer','Amount','Status','Date']} rows={orders.map(o=>[o.id,o.customer,'₹'+o.total,o.status,o.date])}/></>}

function SectionTitle({title,subtitle}){return <div className="section-title"><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>}
function Metric({title,value}){return <div className="metric"><span>{title}</span><b>{value}</b></div>}
function Table({headers,rows}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div>}

createRoot(document.getElementById('root')).render(<App/>);
