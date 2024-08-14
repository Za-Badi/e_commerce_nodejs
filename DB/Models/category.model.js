// import mongoose from "mongoose";
import mangoose from "../global-setup.js";
import mongoose from "../global-setup.js";
// import { Brand } from "./brand.model.js";
// import { SubCategory } from "./sub-category.model.js";
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },
    Images: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
categorySchema.post("findByIdAndDelete", async function () {
  const _id = this.getQuery()._id;
    // delere relivant subcategories from db
    const deletedSubCategories = await mangoose.models.SubCategory.deleteMany({
      categoryId: _id,
    });
    // check if subcategories are deleted already
    if (deletedSubCategories.deletedCount) {
      // delete the relivant brands from db
      await mangoose.models.Brand.deleteMany({ categoryId: _id });
      /**
       * @todo  delete the related products from db
       */
    }
    // next();
});
export const Category =
  mongoose.models.Category || model("Category", categorySchema);
