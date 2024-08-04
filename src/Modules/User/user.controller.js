import { hashSync } from "bcrypt";
import { ErrorClass } from "../../Utils/index.js";
import { User } from "../../../DB/Models/user.model.js";

/**
 * @api (post) /users/register registration a new user
 */

export const registerUser = async (req, res, next) => {
  const { username, email, password, gender, age, phone, userType } = req.body;

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return next(new ErrorClass("email already exist", 400));
  }
  // const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);

  // send email to do

  const userObject = {
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
  };
  //create user in db
  const newUser = await User.create(userObject);
  //send the res
  res.status(201).json({ message: "rejistration successfully", data: newUser });
};

export const updateAccount = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, gender, age, phone, userType } = req.body;
  const user = await User.findById(id);
  if(!user){
    return next(new ErrorClass("User not found",404));
  }
  // if (password) {
  //   const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  // }
  const userObject = {
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
  };
  const updatedUser = await User.findByIdAndUpdate(id, userObject, { new: true });
  res.status(200).json({ message: "account updated", data: updatedUser });
};
