const axios = require('axios');

const SHOP = 'demostracion-de-uso.myshopify.com';
const ACCESS_TOKEN = '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';
const PRODUCT_ID = '10199200825687'; // ID numérico sin GID
const PREFIX = 'FLP'; // <-- Cambia esto por lo que quieras eliminar

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

    console.log('🎯 Proceso terminado');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

eliminarVariantesConPrefijo();
