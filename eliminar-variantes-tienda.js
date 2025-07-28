const axios = require('axios');

// 👉 Pega aquí tus datos reales (hazlo solo localmente, NO los publiques)
const SHOP = 'demostracion-de-uso.myshopify.com';
const ACCESS_TOKEN = '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';
const TARGET_OPTION_VALUE = 'Tefwefwefewg24325';

const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': ACCESS_TOKEN,
};

async function eliminarVariantes() {
  const query = {
    query: `
      {
        products(first: 50) {
          edges {
            node {
              title
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    option1
                    option2
                    option3
                  }
                }
              }
            }
          }
        }
      }
    `,
  };

  try {
    const res = await axios.post(
      `https://${SHOP}/admin/api/2024-04/graphql.json`,
      query,
      { headers }
    );

    const products = res.data.data.products.edges;

    for (const product of products) {
      const variants = product.node.variants.edges;

      for (const variant of variants) {
        const { id, option1, option2, option3, title } = variant.node;

        if ([option1, option2, option3].includes(TARGET_OPTION_VALUE)) {
          console.log(`🧹 Eliminando variante: ${title} (${id})`);

          const mutation = {
            query: `
              mutation {
                productVariantDelete(id: "${id}") {
                  deletedProductVariantId
                  userErrors {
                    field
                    message
                  }
                }
              }
            `,
          };

          const deleteRes = await axios.post(
            `https://${SHOP}/admin/api/2024-04/graphql.json`,
            mutation,
            { headers }
          );

          const errors = deleteRes.data.data.productVariantDelete.userErrors;
          if (errors.length) {
            console.error('❌ Error:', errors);
          } else {
            console.log('✅ Variante eliminada con éxito');
          }
        }
      }
    }

    console.log('🎯 Proceso terminado');
  } catch (err) {
    console.error('❌ Error general:', err.response?.data || err.message);
  }
}

eliminarVariantes();
