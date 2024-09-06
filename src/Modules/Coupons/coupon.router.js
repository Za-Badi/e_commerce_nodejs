import { Router } from "express";
// controllers
import * as controller from "./coupon.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema.js";
// models

export const couponRouter = Router();
const { errorHandler, auth, validationMiddleware } = Middlewares;

couponRouter.route("/").get(auth(), errorHandler(controller.getCoupones));

couponRouter
  .route("/details/:couponId")
  .get(auth(), errorHandler(controller.getCouponById));

//     .post(auth, errorHandler(controller.addAddress));
couponRouter.post(
  "/create",
  auth(),
  validationMiddleware(createCouponSchema),
  errorHandler(controller.createCoupons)
);
couponRouter.put(
    "/update/:couponId",
    auth(),
    validationMiddleware(updateCouponSchema),
    errorHandler(controller.updateCoupon)
  );
  couponRouter.patch(
    "/enable/:couponId",
    auth(),
    errorHandler(controller.disableEnableCoupon)
  );