import { ErrorClass } from "../../Utils/index.js";
// models
import { Cart, Product } from "../../../DB/Models/index.js";
import { checkProductStock , calculateCartSubTotal} from "./Utils/cart.utils.js";
/**
 * @api {POST} /cart/create  create a  new cart
 */

export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // const product = await Product.findOne({_id: productId, stock: {$gt: quantity}})
  const product = await checkProductStock(productId, quantity);
  if (!product) return next(new ErrorClass("Product not Available", 404));

  const cart = await Cart.findOne({ userId: userId });
  if (!cart) {
    // const subTotal = product.appliedPrice * quantity;
    const newCart = new Cart({
      userId: userId,
      products: [
        {
          productId: product._id,
          quantity,
          price: product.appliedPrice,
        },
      ],
    });

    await newCart.save();
    return res.status(201).json({ message: "Success", cart: newCart });
  }

  const isProductExist = cart.products.find((p) => p.productId == productId);

  if (isProductExist)
    return next(new ErrorClass("Product in Cart already", 404));

  cart.products.push({
    productId: product._id,
    quantity,
    price: product.appliedPrice,
  });
//   cart.subTotal += product.appliedPrice * quantity;
  await cart.save();
  res.status(200).json({ message: "Success", cart: cart });
};

/**
 * @api {Put} /cart/remove/:productId  remove product from cart
 */

export const removeFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(new ErrorClass("Product not Cart", 404));
  }
  cart.products = cart.products.filter((p) => p.productId != productId);
//   if (cart.products.length == 0) {
//     await cart.deleteOne({ userId });
//     return res.status(200).json({ message: "Success" });
//   }
//   cart.subTotal = 0;
//   cart.products.forEach((p) => {
//     cart.subTotal += p.price * p.quantity;
//   });
  await cart.save();
  res.status(200).json({ message: "Success", cart: cart });
};

/**
 * @api {Put} /cart/update/:productId  update product from cart
 */

export const updateCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(new ErrorClass("Product not Cart", 404));
  }

  const product = await Product.findOne({
    _id: productId,
    stock: { $gt: quantity },
  });
  if (!product) return next(new ErrorClass("Product not Available", 404));
  tIndex = cart.products.findIndex((p) => p.productId == product._id);
  // cart.products
  // const produc[productIndex].quantity = quantity
  cart.products = cart.products.map((p) => {
    if (p.productId == productId) {
      p.quantity = quantity;
    }
    return p;
  });
//   cart.subTotal = 0;
//   cart.products.forEach((p) => {
//     cart.subTotal += p.price * p.quantity;
//   });

  await cart.save();
  res.status(200).json({ message: "Success", cart: cart });
};

/**
 * @api {GET} /cart  get cart
 */
export const getCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const cart = await Cart.findOne({ userId });

  res.status(200).json({ message: "success", cart });
};
