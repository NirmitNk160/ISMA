import axios from "axios";

/* SIMPLE CACHE (session only) */
const cache = {};

function mergeProductData(...sources) {
  const result = {};

  for (const src of sources) {
    if (!src) continue;

    for (const key in src) {
      if (!result[key] && src[key]) {
        result[key] = src[key];
      }
    }
  }

  return result;
}

export async function fetchProductFromBarcode(code) {
  if (cache[code]) return cache[code];

  let foodData = null;
  let upcData = null;

  /* ========= OPEN FOOD FACTS ========= */
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`
    );

    if (res.data?.status === 1) {
      const p = res.data.product;

      foodData = {
        name: p.product_name,
        brand: p.brands,
        category: p.categories,
        description: p.generic_name,
        image_url: p.image_front_url,
        size: p.quantity,
      };
    }
  } catch {}

  /* ========= UPCitemDB ========= */
  try {
    const res = await axios.get(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`
    );

    const item = res.data?.items?.[0];

    if (item) {
      upcData = {
        name: item.title,
        brand: item.brand,
        category: item.category,
        description: item.description,
        image_url: item.images?.[0],
      };
    }
  } catch {}

  const merged = mergeProductData(foodData, upcData);

  cache[code] = merged;

  return Object.keys(merged).length ? merged : null;
}
