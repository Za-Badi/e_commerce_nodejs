import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { ProductType } from "../Types/producttype.js";
import { listProductsResolver, createCouponResolver } from "../Resolvers/index.js";
import { CouponType, CreateCouponInput } from "../Types/coupon.type.js";

export const mainSchema = new GraphQLSchema({  
    query: new GraphQLObjectType({
        name: "RootQuery",
        description: "RootQuery",
        fields: {
            // sendData:{
            //     name: "sendData",
            //     type: GraphQLString,
            //     args: {
            //         name: { type:new  GraphQLNonNull(GraphQLString) },
            //         age: { type: GraphQLInt },
            //     },
            //     resolve: () => "sendData",
            // },
            listProducts: {
                name: "listProducts",
                type: new GraphQLList(ProductType),
                resolve:  listProductsResolver,
            },
        
        },
    }),
    mutation: new GraphQLObjectType({
        name: "RootMutation",
        description: "Root Mutation",      
        fields: {
                createCoupon: {
                    name: "createCoupon",
                    type: CouponType,
                    description: "mutation to create coupon",
                    args: CreateCouponInput,                    
                    resolve: createCouponResolver              
                },
        
    },
    })
 });