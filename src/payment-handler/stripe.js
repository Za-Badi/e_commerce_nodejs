import Stripe from "stripe";
import { CouponModel } from "../../DB/Models/index.js";
import { DiscountType, ErrorClass } from "../Utils/index.js";
// import { env } from "../../env/server.mjs";

export const createCheckoutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentDate = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    metadata,
    discounts,
    line_items,
  });

  return paymentDate;
};

// create stripe coupon
export const createStripeCoupon = async ({ couponId }) => {
  const couponFind = await CouponModel.findById(couponId);
  if (!couponFind) {
    return new ErrorClass("Coupon Not Found", 404, "Coupon Not Found");
  }

  let couponObj = {};
  if (couponFind.couponType == DiscountType.AMOUNT) {
    couponObj = {
      name: couponFind.couponName,
      currency: "egp",
      amount_off: couponFind.couponAmount * 100,
      // duration: "once"
    };
  }
  if (couponFind.couponType == DiscountType.PERCENTAGE) {
    couponObj = {
      name: couponFind.couponName,
      percent_off: couponFind.couponAmount,
    };
  }
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const stripecoupon = await stripe.coupons.create(couponObj);
  return stripecoupon;
};

export const createPaymentMethod = async ({token}) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
     token,
    },
  });
  return paymentMethod;
};

export const createPaymentIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);

  const paymentMethod = await createPaymentMethod({token: "tok_visa"});
    console.log("zz ", paymentMethod.id, "amount: ", amount, "currency: ", currency);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: { 
        enabled: true,
        allow_redirects: "never"
     },
    payment_method: paymentMethod.id
  });
  return paymentIntent;
};

export const retrievePaymentIntent= async ({paymentIntentId})=>{
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    const paymentIntents = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntents;
}

export const confirm =  async({paymentIntentId})=>{
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    const paymentDetails =  await retrievePaymentIntent({paymentIntentId});
    const paymentIntent =  await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
            payment_method: paymentDetails.payment_method,

        }
    );    

    return paymentIntent;
}


export const refundPaymentStripeData = async({paymentIntentId})=>{
    const stripe = new Stripe(process.env.SECRET_STRIPE_KEY);
    const refund =  await stripe.refunds.create({
        payment_intent: paymentIntentId
    });
    return refund;
}   