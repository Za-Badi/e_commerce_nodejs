import axios from "axios";
import { Address } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {post} /addresses/add  Create a brand
 */

export const addAddress = async (req, res, next) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    flatNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  console.log("bb ");
  const userId = req.authUser._id;

  //   TODO: city validation
  const cities =  await axios.get(`https://api.api-ninjas.com/v1/city?country=LY&limit=30`,{
    headers: {
      "X-Api-Key": process.env.CITY_API_KEY,
    }
  });

  const isCityExist = cities.data.find((city) => city.name === city);
  if(isCityExist) return next(new ErrorClass("Invalid city", 400))



  const newAddress = new Address({
    userId,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    flatNumber,
    addressLabel,
    isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
  });
  if (newAddress.isDefault) {
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
  }

  const address = await newAddress.save();
  res.status(201).json({ message: "Address has bee Added", address });
};

/**
 * @api {PUT} /addresses/edit/:id  Edit address by id
 */

export const editAddress = async (req, res, next) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    flatNumber,
    addressLabel,
    setAsDefault,
  } = req.body;
  const { addressId } = req.params;
  const userId = req.authUser._id;

  const address = await Address.findOne({
    _id: addressId,
    userId: userId,
    isMarkedAsDeleted: false,
  });

  if (!address) return next(new ErrorClass("This address is not found", 404));


  if (setAsDefault) {
    address.isDefault = [true, false].includes(setAsDefault)
      ? setAsDefault
      : false;
    await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
    console.log("jsj ", address.isDefault);
  }
  if (country) address.country = country;
  if (city) address.city = city;
  if (buildingNumber) address.buildingNumber = buildingNumber;
  if (postalCode) address.postalCode = postalCode;
  if (floorNumber) address.floorNumber = floorNumber;
  if (addressLabel) address.addressLabel = addressLabel;
  // if ( address.isDefault){
  //     await Address.updateOne({ userId, isDefault: true}, {isDefault: false})
  //   }

  await address.save();
  res.json({ message: "Update Success", address });
};

/**
 * @api {DELETE} /addresses/:id  Delete address by id
 */
export const deleteAddress = async (req, res, next) => {
  const { addressId } = req.params;
  const userId = req.authUser._id;

  const address = await Address.findOneAndUpdate(
    {
      _id: addressId,
      userId: userId,
      isMarkedAsDeleted: false,
    },
    {
      isMarkedAsDeleted: true,
      isDefault: false,
    },
    { new: true }
  );

  if (!address) return next(new ErrorApp("This address is not found", 404));

  await address.save();
  res.json({ message: "Address Deleted", address });
};


/**
 * @api {GET} /addresses/  Get addresses by id
 */
export const getAddresses = async (req, res, next) => {
    const userId = req.authUser._id;

    const address =  await Address.find({userId, isMarkedAsDeleted: false});
    res.status(200).json({message: "Success", address});


}