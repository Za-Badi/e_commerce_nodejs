import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;
import bcrypt from "bcryptjs";
import {UserTypes} from "../../src/Utils/index.js"
// import { hashSync } from "bcrypt";


const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        default: UserTypes.Buyer,
        enum: Object.values(UserTypes),
    },
    age: {
        type: Number,
        required: true,
        min:10
    },
    gender: {
        type: String,
        required: true,
        enum:["Male","Female"]
    }, 
    phone: {
        type: String,
        required: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isMarkedAsDeleted: {
        type: Boolean,
        default: false,
    }, 
    provider:{
        type: String,
        enum: ["System", "GOOGLE", "FACEBOOK", "APPLE"],
        default: "System"
      
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });
userSchema.pre("save",  function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS);
  }
   next();
});
userSchema.pre(["updateOne", "findByIdAndUpdate"], {document: true, query : false} , function (next) {
    if (this.isModified("password")) {
      this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS);
    }
     next();
  });


export const User = mongoose.models.User || model("User", userSchema);

