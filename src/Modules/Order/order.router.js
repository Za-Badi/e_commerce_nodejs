import { Router } from "express";
// controllers
import * as controller from "./order.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// models

export const orderRouter = Router();
const { errorHandler, auth } = Middlewares;

orderRouter
  .route("/")
  .post(auth(), errorHandler(controller.createOrder))
  .get(auth(), errorHandler(controller.listOrders));

orderRouter
  .route("/cancel/:orderId")
  .put(auth(), errorHandler(controller.cancelOrder));
orderRouter
  .route("/deliver/:orderId")
  .put(auth(), errorHandler(controller.deliverOrder));

orderRouter
  .route("/stripePay/:orderId")
  .post(auth(), errorHandler(controller.paymentWithStripe));

orderRouter
  .route("/webhook")
  .post( errorHandler(controller.stripeWebhookLocal));

  orderRouter
  .route("/refund/:orderId")
  .post(auth(), errorHandler(controller.refundPayment));
