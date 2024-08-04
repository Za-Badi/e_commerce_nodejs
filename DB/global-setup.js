import mangoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mangoose.plugin(mongoosePaginate);
export default mangoose;