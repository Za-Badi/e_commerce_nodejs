import { GraphQLString,GraphQLFloat ,GraphQLBoolean, GraphQLInt, GraphQLObjectType,GraphQLID, GraphQLEnumType} from "graphql";
import { DiscountType } from "../../Utils/index.js";
import { FixedOffsetZone } from "luxon";


const CouponEnum = new GraphQLEnumType({
              name: "CouponEnumType",
              values: {
                PERCENTAGE: { value: DiscountType.PERCENTAGE },
                FixedOffsetZone: { value: DiscountType.FIXED },
              },
            });

export const CouponType = new GraphQLObjectType({
    name: "CouponType",
    description: "Coupon Type",
    fields: {
        _id: { type: GraphQLID },
        couponCode: { type: GraphQLString },
        couponAmount: { type: GraphQLFloat },
        couponType: { type: CouponEnum },
        from: { type: GraphQLString },
        till: { type: GraphQLString },
        isEnabled: { type: GraphQLBoolean },
        createdBy: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        // __v: { type: GraphQLInt },
    }
});


export const CreateCouponInput = {
    couponCode: { type: GraphQLString },
    couponAmount: { type: GraphQLFloat },
    couponType: { type: CouponEnum },
    from: { type: GraphQLString },
    till: { type: GraphQLString },
   
}