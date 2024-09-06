import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { DiscountType as discountType } from "../../Utils/index.js";
import { CategoryType } from "./index.js";
import { Category } from "../../../DB/Models/index.js";

export const ImageType = new GraphQLObjectType({
  name: "ImageType",
  description: "Image Type",
  fields: {
    customId: { type: GraphQLString },
    URLS: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "URLType",
          description: "URL Type",
          fields: {
            secure_url: { type: GraphQLString },
            public_id: { type: GraphQLString },
            _id: { type: GraphQLID },
          },
        })
      ),
    },
  },
});
export const ProductType = new GraphQLObjectType({
  name: "ProductType",
  description: "Product Type",
  fields: () => ({
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    slug: { type: GraphQLString },
    price: { type: GraphQLFloat },
    appliedPrice: { type: GraphQLFloat },
    stock: { type: GraphQLFloat },
    rating: { type: GraphQLFloat },
    description: { type: GraphQLString },
    category: { type: GraphQLID },
    categoryData: {
      type: CategoryType,
      resolve: async(parent) => Category.findById(parent.category),  
    },
    subCategory: { type: GraphQLID },
    brand: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    Images: { type: ImageType },
    appliedDiscount: { type: DiscountType },
  }),
});

const DiscountType = new GraphQLObjectType({
  name: "DiscountType",
  fields: {
    amount: { type: GraphQLFloat },
    type: {
      type: new GraphQLEnumType({
        name: "DiscountTypeEnum",
        values: {
          PERCENTAGE: { value: discountType.PERCENTAGE },
          FIXED: { value: discountType.FIXED },
        },
      }),
    },
  },
});
