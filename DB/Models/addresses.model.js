import mongoose from "../global-setup.js";
import slugify from "slugify";
import { Badges, DiscountType } from "../../src/Utils/index.js";
const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    // state: {
    //   type: String,
    //   required: true,
    // },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
    buildingNumber:{
        type: Number,
        required: true,
    },
    floorNumber: {
      type: Number,  
    },
    flatNumber:{
        type: Number,
    },
    addressLabel: {
      type: String,
    //   required: true,
    },
    isDefault:{
        type: Boolean,
         default: false
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false,
    },
  });

  export const Address =
  mongoose.models.Address || model("Address", addressSchema);
