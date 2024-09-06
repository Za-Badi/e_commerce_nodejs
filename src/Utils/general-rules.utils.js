import Joi from "joi"
import { Types } from "mongoose"


export const idValid = (val, helper) => {
    return Types.ObjectId.isValid(val) ? val : helper.message("id mustbe valid")
}

export const generalRules = {
    _id: Joi.custom(idValid),
    my_headers: {
        "content-type": Joi.string().optional(),
        "user-agent": Joi.string().optional(),
        accept: Joi.string().optional(),
        "postman-token": Joi.string().optional(),
        host: Joi.string().optional(),
        "accept-encoding": Joi.string().optional(),
        connection: Joi.string().optional(),
        "content-length": Joi.string().optional(),
    },
    mails: Joi.string().required().email({
        // tlds: { allow: ["com", "net"], deny: ["bhaa"] }
        tlds: { allow: true, deny: ["bhaa", "com", "net"] },
        minDomainSegments: 3, // 3 section @a.a.a   
        maxDomainSegments: 3,
    }).messages({
        "any.required": "Mail field is required field",
        "string.email": "Mail field must be a valid email"
    }),
}