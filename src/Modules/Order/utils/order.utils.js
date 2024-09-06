import { CouponModel } from "../../../../DB/Models/index.js";
import { DateTime } from "luxon";
import { DiscountType } from "../../../Utils/index.js";

/**
 * @param {*} couponCode
 * @param {*} userId
 * @returns { message: string, error: Boolean, coupon: Object }
 */
export const validateCoupon = async (couponCode, userId) => {
  const coupon = await CouponModel.findOne({ couponCode });
  if (!coupon) {
    return { message: "Invalid Coupon Code", error: true };
  }
  if (!coupon.isEnabled || DateTime.fromJSDate(coupon.till) < Date.now()) {
    return { message: "Coupon Not Enabled", error: true };
  }
  if (DateTime.fromJSDate(coupon.from) > Date.now()) {
    return {
      message: `Coupon is not yet available, will be available on ${coupon.from}`,
      error: true,
    };
  }
  const isUserNotValid = coupon.Users.some(
    (user) =>
      user.userId.toString() !== userId.toString() ||
      (user.userId.toString() === userId.toString() &&
        user.maxCount <= user.usageCount)
  );
  if (isUserNotValid) {
    return {
      message: "User is not eligible to use this coupon or Coupon Already Used",
      error: true,
    };
  }

  return { coupon, error: false };
};

export const applyCoupon = (subtotal, coupon) => {
  let total = subtotal;
  const { couponAmount: couponAmount, couponType: couponType } = coupon;

  if (couponAmount && couponType) {
    if (couponType == DiscountType.PERCENTAGE) {
      total = subtotal - (subtotal * couponAmount) / 100;
    } else if (couponType == couponType.FIXED) {
      if (couponAmount > subtotal) {
        return total;
      }
      total = subtotal - couponAmount;
    }

    return total;
  }
};
