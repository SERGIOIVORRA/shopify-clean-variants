const axios = require('axios');

const SHOP = 'demostracion-de-uso.myshopify.com';
const ACCESS_TOKEN = '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';
const PRODUCT_ID = '10199199973719';
const COLLECTION_ID = '659816284503';
const EXTRA_PRODUCT_ID = '10199584538967';
const PREFIX = 'FLP';

const headers = {
  'X-Shopify-Access-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

async function eliminarVariantesConPrefijo() {
  try {
    const res = await axios.get(
      `https://${SHOP}/admin/api/2024-04/products/${PRODUCT_ID}/variants.json`,
      { headers }
    );

    const variants = res.data.variants;
    console.log(`🟢 Producto con ${variants.length} variantes`);

    let eliminadas = 0;

    for (const variant of variants) {
      const match = [variant.option1, variant.option2, variant.option3].some(
        opt => opt && opt.startsWith(PREFIX)
      );

      if (match) {
        console.log(`🧹 Eliminando variante: ${variant.title} (${variant.id})`);
        await axios.delete(
          `https://${SHOP}/admin/api/2024-04/variants/${variant.id}.json`,
          { headers }
        );
        console.log(`✅ Variante eliminada: ${variant.title}`);
        eliminadas++;
      }
    }

    if (eliminadas === 0) {
      console.log('⚠️ No se encontraron variantes que coincidan con el prefijo.');
    }

    // Eliminar colección
    console.log(`🧺 Eliminando colección ID: ${COLLECTION_ID}`);
    await axios.delete(
      `https://${SHOP}/admin/api/2024-04/custom_collections/${COLLECTION_ID}.json`,
      { headers }
    );
    console.log(`✅ Colección eliminada`);

    // Eliminar producto adicional
    console.log(`🗑️ Eliminando producto ID: ${EXTRA_PRODUCT_ID}`);
    await axios.delete(
      `https://${SHOP}/admin/api/2024-04/products/${EXTRA_PRODUCT_ID}.json`,
      { headers }
    );
    console.log(`✅ Producto eliminado`);

    console.log('🎯 Proceso terminado');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

eliminarVariantesConPrefijo();
