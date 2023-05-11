const { Sale, SaleProduct, Product, sequelize } = require('../../database/models');

const getById = async (id) => {
  const result = await Sale.findByPk(id, {
     include: [
      { 
        model: Product,
        as: 'products',
      },
    ], 
    });
  return result;
};

const getAll = () => Sale.findAll({
     include: [
      { 
        model: Product,
        as: 'products',
      },
    ], 
});

const createSaleProduct = async (products, quantities, sale) => {
  const saleProducts = products.map((product, index) => ({
    saleId: sale.id,
    productId: product.id,
    quantity: quantities[index],
  }));
  await SaleProduct.bulkCreate(saleProducts);
};

const create = async ({ sale, productsIds, userId, quantities }) => {
  console.log(quantities);
  try {
    const result = await sequelize.transaction(async (t) => {
    const saleCreated = await Sale.create(
        { ...sale, saleDate: Date.now(), status: 'Pendente', userId },
        { transaction: t },
    );
    const products = await Product.findAll({ where: { id: productsIds } });
    createSaleProduct(products, quantities, saleCreated);      
    return saleCreated;
  });
  return { type: 201, message: result.id };
} catch (error) {
    throw new Error(error.message);
}
};

const destroy = async (id) => {
  await Sale.destroy({ where: { id } });
};

module.exports = { getAll, getById, destroy, create };
