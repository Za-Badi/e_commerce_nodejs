// import { hashSync } from "bcrypt";
import { ErrorClass } from "../../Utils/index.js";
import { User } from "../../../DB/Models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmailService } from "../../services/send-email.service.js";
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

  const userInstance = new User({
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
  });

  const token = jwt.sign(
    { _id: userInstance._id },
    process.env.CONFIRMATION_SECRET,
    {
      expiresIn: "1h",
    }
  );

  const confirmationLink = `${req.protocol}://${req.headers.host}/users/confirm-email/${token}`;

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Welcome to our app",
    textMessage: "Hello, welcome to our app",
    htmlMessage: `<a href="${confirmationLink}">Click here to confirm your email</a>`,
  });

  if (isEmailSent.rejected.length) {
    return res.status(400).json({ message: "Email not sent" });
  }
  //create user in db
  const newUser = await userInstance.save();
  //send the res
  res.status(201).json({ message: "rejistration successfully", data: newUser });
};

export const updateAccount = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, gender, age, phone, userType } = req.body;
// const document = new User({_id: id});
// const user = await document.updateOne({username, email, password, gender, age, phone, userType});

  const user = await User.findById(id);
  // // const user = await User.updateOne({_id:id},{$set:{username, email, password, gender, age, phone, userType}});
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
  const updatedUser = await User.findOneAndUpdate({_id:id}, userObject, { new: true });
  res.status(200).json({ message: "account updated", data: user });
};
