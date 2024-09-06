import { DiscountType } from '../../src/Utils/index.js';
import mangoose from '../global-setup.js';
import mongoose from "../global-setup.js";
const { model, Schema, Types } = mongoose;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        unique: true,
        required: true,
    },
    couponAmount: {
        type: Number,
        required: true,
    },
    couponType: {
        type: String,
        required: true,
        enum: Object.values(DiscountType),
    },
    from: {
        type: Date,
        required: true,
    },
    till: {
        type: Date,
        required: true,
    },
    Users: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            maxCount: {
                type: Number,
                required: true,
                min: 1
            },
            usageCount: {
                type: Number,
                default: 0,
            },
        }
    ],

    isEnabled: {
        type: Boolean,
        default: true,
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "User",
    }

}, {
    timestamps: true,
    // ...schemaModels
})
export const CouponModel = mongoose.models.CouponModel || model("CouponModel", couponSchema);


// create coupon change log table
// couponId, userId, changes:{}

const couponChangeLogSchema = new Schema({
    couponId:{
        type: Schema.Types.ObjectId,
        ref: "CouponModel",
        required: true
    },
    updatedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    changes:{
        type: Object,
        required: true
    }

}, {
    timestamps: true,
    // ...schemaModels
})

export const CouponChangeLog = mangoose.models.CouponChangeLog || model("CouponChangeLog",couponChangeLogSchema)




// cron job to disable unused coupon