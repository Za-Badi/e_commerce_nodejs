import { DateTime } from "luxon";
import { Cart, Address, Order, Product } from "../../../DB/Models/index.js";
import { ErrorClass, OrderStatus, PaymentMenthods } from "../../Utils/index.js";
import { calculateCartSubTotal } from "../Cart/Utils/cart.utils.js";
import { validateCoupon, applyCoupon } from "./utils/order.utils.js";
import { ApiFeatures } from "../../Utils/api_features.utils.js";
import {
  confirm,
  createCheckoutSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPaymentStripeData,
} from "../../payment-handler/stripe.js";
import { generateQrCode } from "../../Utils/qr-coe.js";

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    address,
    addressId,
    contactNumber,
    shippingFee,
    couponCode,
    VAT,
    paymentMethod,
  } = req.body;

  // find loggin user cart with products
  const cart = await Cart.findOne({ userId }).populate({
    path: "products.productId",
    model: "Product",
  });

  if (!cart || !cart.products.length)
    return next(new ErrorClass("Empty Cart", 404, "Empty Cart"));
  const isSoldOut = cart.products.find((p) => p.productId.stock < p.quantity);

  if (isSoldOut)
    return next(
      new ErrorClass(
        " Product ${isSoldOut.productId.title} Sold Out",
        400,
        "Sold Out"
      )
    );

  const subTotal = await calculateCartSubTotal(cart.products);
  let total = subTotal + shippingFee + VAT;

  let coupon = null;

  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);
    if (isCouponValid.error)
      return next(
        new ErrorClass(isCouponValid.message, 400, isCouponValid.message)
      );
    coupon = isCouponValid.coupon;

    total = applyCoupon(subTotal, coupon);
  }

  if (!address && !addressId) {
    return next(
      new ErrorClass("Please provide address", 400, "Please provide address")
    );
  }
  if (addressId) {
    const addressInfo = await Address.findById({
      _id: addressId,
      userId,
    });
    if (!addressId)
      return next(new ErrorClass("Invalid Address", 400, "invalid Address"));
  }

  let orderStatus = OrderStatus.Pending;
  if (paymentMethod === PaymentMenthods.Cash) orderStatus.Placed;

  const orderObj = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber,
    subTotal,
    shippingFee,
    VAT,
    couponId: coupon?._id,
    total,
    orderStatus,
    paymentMethod,
    estimatedDeliveryTime: DateTime.now()
      .plus({ days: 2 })
      .toFormat("yyyy-MM-dd"),
  });

  await orderObj.save();

  cart.products = [];
  await cart.save();
  // generate QR COde
  const qrCode = await generateQrCode([orderObj.total, orderObj._id, orderObj.products]);
  res.status(201).json({ message: "Order Created", order: orderObj, qrCode });
};

export const cancelOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Pending, OrderStatus.Placed, OrderStatus.Confirmed],
    },
  });
  if (!order)
    return next(new ErrorClass("Invalid Order", 400, "Invalid Order"));
  const orderDate = DateTime.fromJSDate(order.createdAt);
  const currentDate = DateTime.now();
  const diff = Math.ceil(
    Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
  );

  if (diff > 3)
    return next(
      new ErrorClass(
        "Cannt cancel order after 3 days",
        400,
        "Cannt cancel order after 3 days"
      )
    );

  order.orderStatus = OrderStatus.Cancelled;
  order.cancelledAt = DateTime.now();
  order.cancelledBy = userId;

  await Order.updateOne({ _id: orderId }, order);

  for (const product of order.products) {
    await Product.updateOne(
      { _id: product.productId },
      {
        $in: { stock: product.quantity },
      }
    );
  }

  res.status(200).json({ message: "Order Cancelled" });
};

export const deliverOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Placed, OrderStatus.Confirmed],
    },
  });
  if (!order)
    return next(new ErrorClass("Invalid Order", 400, "Invalid Order"));

  order.orderStatus = OrderStatus.Delivered;
  order.deliveredAt = DateTime.now();
  order.deliveredBy = userId;

  await Order.updateOne({ _id: orderId }, order);

  res.status(200).json({ message: "Order Delivered", order });
};

export const listOrders = async (req, res, next) => {
  const userId = req.authUser._id;
  const mangooseQuery = Order;
  const query = { userId, ...req.query };
  const populate = {
    path: "products.productId",
    select: "title Images rating appliedPrice",
  };

  const apiFeatureInstance = new ApiFeatures(mangooseQuery, query, populate)
    .sorting()
    .filter()
    .pagination();
  const orders = await apiFeatureInstance.mangooseQuery;

  res.status(200).json({ message: "Order List", orders });
};

export const paymentWithStripe = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Pending],
    },
  });
  if (!order)
    return next(new ErrorClass("Invalid Order", 400, "Invalid Order"));

  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: {
      orderId: order._id.toString(),
    },
    discounts: [],
    line_items: order.products.map((product) => {
      return {
        price_data: {
          currency: "egp",
          unit_amount: product.price * 100,
          product_data: {
            name: req.authUser.username,
          },
        },
        quantity: product.quantity,
      };
    }),
  };

  if (order.couponId) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.couponId });
    if (stripeCoupon.status) {
      return next(
        new ErrorClass(stripeCoupon.message, 400, stripeCoupon.message)
      );
    }
    paymentObject.discounts = [{ coupon: stripeCoupon.id }];
  }
  const checkoutSession = await createCheckoutSession(paymentObject);
  const paymentIntent = await createPaymentIntent({
    amount: order.total,
    currency: "egp",
  });
  order.payment_intent = paymentIntent.id;

  await order.save();
  res.status(200).json({ message: "Payment initiated", checkoutSession });
};

export const stripeWebhookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;
  const confirmedOrder = await Order.findByIdAndUpdate(orderId, {
    orderStatus: OrderStatus.Confirmed,
  });

  const confirmPaymentIntent = await confirm({
    paymentIntentId: confirmedOrder.payment_intent,
  });

  res.status(200).json({ message: "success" });
};

export const refundPayment = async (req, res, next) => {
  const { orderId } = req.params;
  const findOrder = await Order.findOne({
    _id: orderId,
    orderStatus: OrderStatus.Confirmed,
  });
  if (!findOrder)
    return next(ErrorClass("Order not found", 404, "Order not found"));

  const refund = await refundPaymentStripeData({paymentIntentId: findOrder.payment_intent});

  if(refund.status){
    return next(new ErrorClass(refund.message, 400, refund.message))
  }
  findOrder.orderStatus = OrderStatus.Refunded;
  await findOrder.save();
  res.status(200).json({message: "Payment Refunded Sucessfully"});
};
