// script.js
// npm i axios

const axios = require('axios');

const SHOP = 'imprivic-shop.myshopify.com';  
const PRODUCT_ID = '9475954606394';         
const PREFIX = 'Default_cpc_';              

const ACCESS_TOKEN = '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';

const API_VERSION = '2024-04';
const headers = {
  'X-Shopify-Access-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getAllVariants(productId) {
  // Intentamos traer hasta 250 por llamada (límite REST). Si tuvieras >250, habría que paginar con page_info.
  const limit = 250;
  const url = `https://${SHOP}/admin/api/${API_VERSION}/products/${productId}/variants.json?limit=${limit}`;
  const { data } = await axios.get(url, { headers });
  return data.variants || [];
}

async function deleteVariant(variantId, title) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}/variants/${variantId}.json`;
  await axios.delete(url, { headers });
  console.log(`✅ Variante eliminada: ${title} (${variantId})`);
  await sleep(300); // pequeña pausa para ser amable con el rate limit
}

(async function eliminarVariantesConPrefijo() {
  try {
    const variants = await getAllVariants(PRODUCT_ID);
    console.log(`🟢 Producto con ${variants.length} variantes`);

    // Detectar variantes a eliminar: por título o por cualquiera de las opciones
    const matches = [];
    for (const v of variants) {
      const opciones = [v.option1, v.option2, v.option3].filter(Boolean);
      const coincide =
        (typeof v.title === 'string' && v.title.startsWith(PREFIX)) ||
        opciones.some(opt => opt.startsWith(PREFIX));

      if (coincide) matches.push(v);
    }

    if (matches.length === 0) {
      console.log(`⚠️ No se encontraron variantes que empiecen por "${PREFIX}".`);
      return;
    }

    // Evitar dejar el producto sin variantes (Shopify no lo permite)
    const total = variants.length;
    let eliminables = matches;

    if (matches.length >= total) {
      // Si TODAS coinciden, conservamos 1 para no dejar el producto sin variantes
      console.log('⚠️ Todas las variantes coinciden con el prefijo. Conservaré 1 para evitar dejar el producto sin variantes.');
      eliminables = matches.slice(1); // conserva la primera
    } else if (total - matches.length < 1) {
      // Redundante por el caso anterior, pero explicita la intención
      eliminables = matches.slice(0, total - 1);
    }

    let eliminadas = 0;
    for (const v of eliminables) {
      try {
        console.log(`🧹 Eliminando variante: ${v.title} (${v.id})`);
        await deleteVariant(v.id, v.title);
        eliminadas++;
      } catch (e) {
        console.error(`❌ Error al eliminar ${v.id}:`, e.response?.data || e.message);
      }
    }

    if (eliminadas === 0) {
      console.log('ℹ️ No se eliminó ninguna variante (posible protección de última variante).');
    } else {
      console.log(`🎯 Proceso terminado. Variantes eliminadas: ${eliminadas}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
})();
