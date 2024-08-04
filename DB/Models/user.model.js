import mongoose from "../global-setup.js";
import { hashSync } from "bcrypt";

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
        unique: true
    },
    userType: {
        type: String,
        required: true,
        enum:["Buyer","Admin"]
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
    }, phone: {
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
    }

}, { timestamps: true });
userSchema.pre("save",  function (next) {
  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
  }
  return next();
});

export const User = mongoose.models.User || model("User", userSchema);

