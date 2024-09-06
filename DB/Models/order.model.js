import mongoose from "../global-setup.js";
import { PaymentMenthods, OrderStatus } from "../../src/Utils/index.js";
import {Product, CouponModel} from "../Models/index.js"

const { model, Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  fromCart: {
    type: Boolean,
    default: true,
  },
  address: {
    type: String,
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },
  contactNumber: {
    type: String,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: true,
  },
  VAT: {
    type: Number,
    required: true,
  },
  couponId: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
  },
  total: {
    type: Number,
    required: true,
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true,
  },
  // estimatedDeliveryDate: {
  //     type: Date,
  //     required: true
  // },
  paymentMethod: {
    type: String,
    required: true,
    enum: Object.values(PaymentMenthods),
  },
  orderStatus: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
  },

  deliveredBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  deliveredAt: Date,
  cancelledAt: Date,
  payment_intent: String
},
{timestamps: true});

orderSchema.post("save", async function(){
  for(const product of this.products){
    await Product.updateOne({ _id: product.productId }, { $inc: { stock: -product.quantity } });
  }
if(this.couponId){
 const coupon = await CouponModel.findById({ _id: this.couponId });
 coupon.Users.find((user) => user.userId.toString() === this.userId.toString()).usageCount++;
 await coupon.save();
}
});

export const Order =
  mongoose.models.Order || model("Order", orderSchema);
