import Joi from "joi";
import { DiscountType, generalRules } from "../../Utils/index.js";

export const createCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().required(),
    couponType: Joi.string()
      .valid(...Object.values(DiscountType))
      .required(),
    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(DiscountType.PERCENTAGE),
        then: Joi.number().max(100).required(),
      })
      .required()
      .min(1)
      .message({
        "number.min": "must be greater than 0",
        "number.max": "must be less than 100",
      }),
    from: Joi.date().greater(Date.now()).required(),
    till: Joi.date().greater(Joi.ref("from")).required(),
    Users: Joi.array().items(
      Joi.object({
        userId: generalRules._id.required(),
        maxCount: Joi.number().min(1).required(),
      })
    ),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.my_headers,
  }),
};

export const updateCouponSchema = {
  body: Joi.object({
    couponCode: Joi.string().optional(),
    couponType: Joi.string()
      .valid(...Object.values(DiscountType))
      .optional(),
    couponAmount: Joi.number()
      .when("couponType", {
        is: Joi.string().valid(DiscountType.PERCENTAGE),
        then: Joi.number().max(100).optional(),
      })
      .optional()
      .min(1)
      .message({
        "number.min": "must be greater than 0",
        "number.max": "must be less than 100",
      }),
    from: Joi.date().greater(Date.now()).optional(),
    till: Joi.date().greater(Joi.ref("from")).optional(),
    Users: Joi.array().items(
      Joi.object({
        userId: generalRules._id.optional(),
        maxCount: Joi.number().min(1).optional(),
      })
    ),
  }),
  params: Joi.object({
    couponId: generalRules._id.required(),
  }),
  authUser: Joi.object({
    _id: generalRules._id.required() 
}).options({
    allowUnknown: true,
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.my_headers,
  }),
};
