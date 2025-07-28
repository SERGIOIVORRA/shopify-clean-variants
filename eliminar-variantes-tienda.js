const axios = require('axios');

const SHOP = 'demostracion-de-uso.myshopify.com';
const ACCESS_TOKEN = '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';
const TARGET_PREFIX = 'Tefwefwefewg24325';

const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': ACCESS_TOKEN,
};

async function eliminarYActualizar() {
  const query = {
    query: `
      {
        products(first: 50) {
          edges {
            node {
              id
              title
              options {
                name
                values
              }
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
      const productId = product.node.id;
      const productTitle = product.node.title;
      const options = product.node.options;
      const variants = product.node.variants.edges;

      let variantesEliminadas = 0;

      for (const variant of variants) {
        const { id, title, option1, option2, option3 } = variant.node;

        if ([option1, option2, option3].some(val => val?.startsWith(TARGET_PREFIX))) {
          console.log(`🧹 Eliminando variante "${title}" (${id}) del producto "${productTitle}"`);

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
            console.error('❌ Error al eliminar variante:', errors);
          } else {
            variantesEliminadas++;
          }
        }
      }

      if (variantesEliminadas > 0) {
        const updatedOptions = options.map(opt => {
          const newValues = opt.values.filter(val => !val.startsWith(TARGET_PREFIX));
          return { name: opt.name, values: newValues };
        });

        const mutationUpdate = {
          query: `
            mutation productUpdate($input: ProductInput!) {
              productUpdate(input: $input) {
                product {
                  id
                  title
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              id: productId,
              options: updatedOptions
            },
          },
        };

        const updateRes = await axios.post(
          `https://${SHOP}/admin/api/2024-04/graphql.json`,
          mutationUpdate,
          { headers }
        );

        const updateErrors = updateRes.data.data.productUpdate.userErrors;
        if (updateErrors.length) {
          console.error('❌ Error al actualizar opciones del producto:', updateErrors);
        } else {
          console.log(`✅ Opciones del producto "${productTitle}" actualizadas correctamente`);
        }
      }
    }

    console.log('🎯 Proceso completo');
  } catch (err) {
    console.error('❌ Error general:', err.response?.data || err.message);
  }
}

eliminarYActualizar();
