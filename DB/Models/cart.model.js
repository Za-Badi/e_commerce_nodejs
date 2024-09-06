// import { calcSubTotal } from '../../src/Modules/Cart/cart.utils.js';
// import { schemaModels } from '../../src/Utils/index.js';
import { calculateCartSubTotal } from "../../src/Modules/Cart/Utils/cart.utils.js";
import mongoose from "../global-setup.js";
// const ObjectId = mongoose.Types.ObjectId;

const { model, Schema, Types } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Proudct",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    subTotal: Number,
  },
  {
    timestamps: true,
    // ...schemaModels
  }
);

cartSchema.pre("save", function (next) {
  if (this.products.length > 0) {
    this.subTotal = calculateCartSubTotal(this.products);
  }
  next();
});

cartSchema.post("save", async function (doc) {
    if(doc.products.length <= 0) {
        await Cart.deleteOne({ userId: doc.userId });
    }
})

export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
