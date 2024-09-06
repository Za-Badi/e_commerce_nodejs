import { Product } from "../../../DB/Models/index.js";



export const listProductsResolver = async () => {
    const products = await Product.find({});
    return products;
}