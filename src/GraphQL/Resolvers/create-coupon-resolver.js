import { CouponModel } from "../../../DB/Models/index.js";
import { isAuthQL } from "../Middlewares/authentication.js";
import { Validation } from "../Middlewares/index.js";
import { createCouponValidator } from "../Validators/create-coupon-validator.js";


export const createCouponResolver = async (parent, args, ctx) => {
    const {couponCode, couponAmount, couponType, from, till} = args;
    const isArgValid =  await Validation(createCouponValidator, args);


    const user = await isAuthQL(ctx.headers.authorization);
    console.log("user ",user);
    if(!user) return new Error("Please Login First", {cause: 400});
    if(isArgValid !== true) return new Error(JSON.stringify(isArgValid));
    const coupon = await CouponModel.create({
        couponCode,
        couponAmount,
        couponType,
        from,
        till,
    })
   return coupon;
}