import { CouponChangeLog, CouponModel, User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {POST} /coupons/create  create coupon
 */

export const createCoupons = async (req, res, next) => {
  const { couponCode, couponAmount, couponType, from, till, Users } = req.body;

  const couponExists = await CouponModel.findOne({ couponCode });
  if (couponExists) return next(new ErrorClass("Coupon already exists", 400));
  const userIds = Users.map((u) => u.userId);

  const usersExists = await User.find({ _id: { $in: userIds } });

  if (usersExists.length != Users.length || !usersExists)
    return next(new ErrorClass("InValid Users Ids", 400));

  const Coupon = new CouponModel({
    couponCode,
    couponAmount,
    couponType,
    from,
    till,
    Users,
    createdBy: req.authUser._id,
  });
  await Coupon.save();

  res.json({ message: "Coupon Created", Coupon });
};

/**
 * @api {GET} /coupons  get all  coupon
 */
export const getCoupones = async (req, res, next) => {
  const { isEnabled } = req.query;
  const filters = {};
  if (isEnabled) filters.isEnabled = isEnabled === "true" ? true : false;
  const coupones = await CouponModel.find(filters);
  res.status(200).json({ count: coupones.length, coupones });
};

/**
 * @api {GET} /coupons/:couponId  get   coupon by id
 */
export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  const coupon = await CouponModel.findById(couponId);
  if (!coupon) return next(new ErrorClass("Invalid Coupon Id", 400));
  res.status(200).json({ message: "Success", coupon });
};

/**
 * @api {PUT} /coupons/:couponId  update coupon by id
 */
export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { couponCode, couponAmount, couponType, from, till, Users } = req.body;

  const coupon = await CouponModel.findById(couponId);
  if (!coupon) return next(new ErrorClass("Invalid Coupon Id", 400));
  const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

  if (couponCode) {
    const isCouponCodeExist = await CouponModel.findOne({ couponCode });
    if (isCouponCodeExist)
      return next(new ErrorClass("Coupon Code already exists", 400));
    coupon.couponCode = couponCode;
    logUpdatedObject.changes.couponCode = couponCode;
  }
  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    logUpdatedObject.changes.couponAmount = couponAmount;
  }
  if (from) {
    coupon.from = from;
    logUpdatedObject.changes.from = from;
  }
  if (till) {
    coupon.till = till;
    logUpdatedObject.changes.till = till;
  }
  if (couponType) {
    coupon.couponType = couponType;
    logUpdatedObject.changes.couponType = couponType;
  }

  if (Users) {
    const userIds = Users.map((u) => u.userId);
    const usersExists = await User.find({ _id: { $in: userIds } });

    if (usersExists.length != Users.length || !usersExists)
      return next(new ErrorClass("InValid Users Ids", 400));
    coupon.Users = Users;
    logUpdatedObject.changes.Users = Users;
  }

  await coupon.save();

  const log = new CouponChangeLog(logUpdatedObject);
  await log.save();

  res.status(200).json({ message: "Coupon Updated", coupon, log });
};


/**
 * @api {Patch} /coupons/:couponId  Disable or Enable coupon
 */
export const disableEnableCoupon = async (req, res, next) => {
    const { couponId } = req.params;
  const userId = req.authUser._id;
  const {enable} = req.body;

  const coupon = await CouponModel.findById(couponId);

  if (!coupon) return next(new ErrorClass("Invalid Coupon Id", 400));
  const logUpdatedObject = { couponId, updatedBy: userId, changes: {} };

 
  if (enable === true) {
    coupon.isEnabled = true;
    logUpdatedObject.changes.isEnabled = true;
  }
  if (enable === false) {
    coupon.isEnabled = false;
    logUpdatedObject.changes.isEnabled = false;
  }
  await coupon.save();
  const log = new CouponChangeLog(logUpdatedObject);
  await log.save();
  res.status(200).json({ message: "Coupon Updated", coupon, log });
}


/**
 * @todo apply after creating order
 * @api {Post} /coupons/apply
 */
