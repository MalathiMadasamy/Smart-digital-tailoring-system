# Real Dress Photos — Drop-in Folder

This app auto-detects any real photo you place in these folders (Vite 'import.meta.glob').
No code changes needed — just add the file with the exact name shown below and rebuild / refresh.

**Recommended photo style:** full or 3/4 body shot, human model wearing the dress, plain studio background, portrait orientation (about 3:4), good lighting — the classic Indian tailoring/fashion catalog look.

## Folders

- `saree/` — Saree
- `saree-blouse/` — Saree Blouse
- `chudidar/` — Chudidar
- `salwar-kameez/` — Salwar Kameez
- `anarkali/` — Anarkali
- `kurti/` — Kurti
- `lehenga/` — Lehenga
- `gown/` — Gown
- `skirt/` — Skirt
- `palazzo/` — Palazzo
- `crop-top/` — Crop Top
- `a-line-dress/` — A-Line Dress
- `night-dress/` — Night Dress
- `formal-shirt/` — Formal Shirt
- `casual-shirt/` — Casual Shirt
- `t-shirt/` — T-Shirt
- `formal-pant/` — Formal Pant
- `jeans/` — Jeans
- `kurta/` — Kurta
- `sherwani/` — Sherwani
- `dhoti/` — Dhoti
- `blazer/` — Blazer
- `girls-frock/` — Girls Frock
- `girls-lehenga/` — Girls Lehenga
- `boys-shirt/` — Boys Shirt
- `boys-pant/` — Boys Pant
- `kids-kurta/` — Kids Kurta

## How it works

- Every image here is picked up automatically at build time by `import.meta.glob` in `src/main.jsx` (see the "IMAGE SYSTEM" comment near the top).
- If a photo for a design is missing, the app shows a clean "Photo coming soon" placeholder with the exact filename it is expecting — so you always know exactly what to name the file.
- To add a brand-new design under an existing dress type: add an entry to that type's `variants` array inside `DRESS_CATALOG` in `src/main.jsx`, then drop a matching photo file here.
- To add a whole new dress type: add a new object to `DRESS_CATALOG` (category, group, desc, variants) and a matching folder here.

## Newly added categories

- `sharara/` — Sharara
- `pavadai-dhavani/` — Pavadai Dhavani
- `pyjama/` — Pyjama
- `veshti-shirt/` — Veshti + Shirt
- `shorts/` — Shorts
- `waistcoat/` — Waistcoat
- `nehru-jacket/` — Nehru Jacket
- `pavadai-sattai/` — Pavadai Sattai
- `kids-shorts/` — Kids Shorts
