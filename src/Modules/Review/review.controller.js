// utils
import {
  ErrorClass,
  OrderStatus,
  ReviewStatus,
  cloudinaryConfig,
  uploadFile,
} from "../../Utils/index.js";
// models
import { Order, Review, Product } from "../../../DB/Models/index.js";

export const addReview = async (req, res, next) => {
  const { productId, rate, body } = req.body;
  const userId = req.authUser._id;

  // check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404, "Product not found"));
  }

  // check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    userId,
    productId,
  });
  if (alreadyReviewed) {
    return next(
      new ErrorClass(
        "You already reviewed this product",
        400,
        "You already reviewed this product"
      )
    );
  }
  // check if user bought this product
  const isBought = await Order.findOne({
    userId,
    "products.productId": productId,
    orderStatus: OrderStatus.Delivered,
  });
  if (!isBought) {
    return next(
      new ErrorClass(
        "You must buy this product first",
        400,
        "You must buy this product first"
      )
    );
  }

  const review = await Review.create({
    userId,
    productId,
    reviewRating: rate,
    reviewBody: body,
  });
  res.status(201).json({ message: "Review added successfully", review });
};

export const listReviews = async (req, res, next) => {
  const reviews = await Review.find().populate([
    {
      path: "userId",
      select: "username email -_id",
    },
    {
      path: "productId",
      select: "title rating",
    },
  ]);

  res.status(200).json({ message: "success", reviews });
};

export const approveOrRejectReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { accept, reject } = req.body;
  if (accept && reject) {
    return next(
      new ErrorClass(
        "You can only accept or reject one review at a time",
        400,
        "You can only accept or reject one review at a time"
      )
    );
  }
  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      reviewStatus: accept
        ? ReviewStatus.Approved
        : reject
        ? ReviewStatus.Rejected
        : ReviewStatus.Pending,
    },
    { new: true }
  );
  if (!review) {
    return next(new ErrorClass("Review not found", 404, "Review not found"));
  }
  res.status(200).json({ message: "success", review });
};
