import { Product } from "../../../../DB/Models/index.js";

export const checkProductStock = async (productId, quantity) => {
  return await Product.findOne({ _id: productId, stock: { $gt: quantity } });
};

export const calculateCartSubTotal = async (products) => {
  let subTotal = 0;
  products.forEach((e) => {
    subTotal += e.price * e.quantity;
  });
  console.log("subTotal", subTotal);
  return subTotal;
};
