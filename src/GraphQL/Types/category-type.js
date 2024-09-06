import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";

export const CategoryType = new GraphQLObjectType({
  name: "CategoryType",
  description: "This cargeory Type",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    slug: { type: GraphQLString },
    image: {
      type: new GraphQLObjectType({
        name: "Image",
        fields: {
          secure_url: { type: GraphQLString },
          public_id: { type: GraphQLString },
        },
      }),
    },
    customId: { type: GraphQLString },
  },
});
