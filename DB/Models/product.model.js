import mongoose from "../global-setup.js";
import slugify from "slugify";
import { Badges, DiscountType } from "../../src/Utils/index.js";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      default: function () {
        return slugify(this.title, { lower: true, replacement: "_" });
      },
    },
    overview: {
      type: String,
    },
    specs: Object,
    badges: {
      type: String,
      enum: Object.values(Badges),
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },
    appliedDiscount: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE,
      },
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
        if (this.appliedDiscount.type === DiscountType.PERCENTAGE) {
          return this.price - (this.price * DiscountType.FIXED) / 100;
        } else if (this.appliedDiscount.type == "Fixed") {
          return this.price - this.appliedDiscount.amount;
        } else {
          return this.price;
        }
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 5,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },
    Images: {
      URLs: [],
      customId: {
        type: String,
        required: true,
        unique: true,
      },
    },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || model("Product", productSchema);
