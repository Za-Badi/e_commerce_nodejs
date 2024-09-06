import Joi from "joi"
import { DiscountType, generalRules } from "../../Utils/index.js"





export const createCouponValidator = Joi.object({
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
  });
