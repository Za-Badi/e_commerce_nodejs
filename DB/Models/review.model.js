import { ReviewStatus } from "../../src/Utils/enum.utils.js";
import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // TODO: Change to true after adding authentication
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reviewRating:{
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reviewBody: String,
    reviewStatus: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: "pending",
    },
    actionDoneBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || model("Review", reviewSchema );
