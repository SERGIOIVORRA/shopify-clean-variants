// npm i axios
const axios = require('axios');

const SHOP = 'imprivic-shop.myshopify.com';
const ACCESS_TOKEN = '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'; 
const PRODUCT_ID = '9475954606394';
const PREFIX = 'Default_cpc_';

const headers = {
  'X-Shopify-Access-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function eliminarVariantesConPrefijo() {
  try {
    const res = await axios.get(
      `https://${SHOP}/admin/api/2024-04/products/${PRODUCT_ID}/variants.json`,
      { headers }
    );

    const variants = res.data.variants || [];
    console.log(`🟢 Producto con ${variants.length} variantes`);

    let eliminadas = 0;

    for (const v of variants) {
      // Coincidencia si el título de la variante o cualquiera de sus opciones empieza por el prefijo
      const opciones = [v.option1, v.option2, v.option3].filter(Boolean);
      const match =
        (typeof v.title === 'string' && v.title.startsWith(PREFIX)) ||
        opciones.some(opt => opt.startsWith(PREFIX));

      if (match) {
        console.log(`🧹 Eliminando variante: ${v.title} (${v.id})`);
        try {
          await axios.delete(
            `https://${SHOP}/admin/api/2024-04/variants/${v.id}.json`,
            { headers }
          );
          console.log(`✅ Variante eliminada: ${v.title}`);
          eliminadas++;
          await sleep(300); // pequeña pausa
        } catch (e) {
          console.error(`❌ Error al eliminar ${v.id}:`, e.response?.data || e.message);
        }
      }
    }

    if (eliminadas === 0) {
      console.log('⚠️ No se encontraron variantes que empiecen por "Default_cpc_".');
    } else {
      console.log(`🎯 Proceso terminado. Variantes eliminadas: ${eliminadas}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo variantes:', error.response?.data || error.message);
  }
}

eliminarVariantesConPrefijo();

