import { nanoid } from "nanoid";
import slugify from "slugify";
// models
import { Product } from "../../../DB/Models/index.js";
// utils
import {
  calculateProductPrice,
  cloudinaryConfig,
  ErrorClass,
  uploadFile,
} from "../../Utils/index.js";
import { ApiFeatures } from "../../Utils/api_features.utils.js";

/**
 * @api {post} /products/add  Add Product
 */
export const addProduct = async (req, res, next) => {
  // destructuring the request body

  const { title, overview, specs, price, discountAmount, discountType, stock } =
    req.body;

  // const { category, subCategory, brand } = req.query;

  if (!req.files.length) {
    return next(new ErrorClass("Please Upload Images", { status: 400 }));
  }
  const brandDocument = req.document;

  //   Images

  const brandCustomId = brandDocument.customId;
  const cateoryCustomId = brandDocument.categoryId.customId;
  const subCategoryCustomId = brandDocument.subCategoryId.customId;
  const customId = nanoid(4);
  const folder = `${process.env.UPLOADS_FOLDER}/Categories/${cateoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;
  const URLs = [];
  // for (const file of req.files) {
  //  const { secure_url, public_id } = await uploadFile({ file: file.path, folder });
  //  URLs.push({ secure_url, public_id });
  // }
  await req.files.map(async (files) => {
    const { secure_url, public_id } = await uploadFile({
      file: files.path,
      folder,
    });
    URLs.push({ secure_url, public_id });
  });
  const productObjecy = {
    title,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    stock,
    Images: {
      URLs,
      customId,
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
  };

  const newProduct = await Product.create(productObjecy);
  res.status(201).json({
    status: "success",
    message: "Product created Successfully",
    data: newProduct,
  });
};

/**
 * @api {put} /products/update/:productId  Update Product
 * @todo Upload images to cloudinary and db
 */
export const updateProduct = async (req, res, next) => {
  // productId from params
  const { productId } = req.params;
  // destructuring the request body
  const {
    title,
    stock,
    overview,
    badge,
    price,
    discountAmount,
    discountType,
    specs,
  } = req.body;

  // check if the product is exist
  const product = await Product.findById(productId).populate([
    { path: "categoryId", select: "customId" },
    { path: "subCategoryId", select: "customId" },
    { path: "brandId", select: "customId" },
  ]);
  if (!product)
    return next(new ErrorClass("Product not found", { status: 404 }));

  // update the product title and slug
  if (title) {
    product.title = title;
    product.slug = slugify(title, {
      replacement: "_",
      lower: true,
    });
  }
  // update the product stock, overview, badge
  if (stock) product.stock = stock;
  if (overview) product.overview = overview;
  if (badge) product.badge = badge;

  // update the product price and discount
  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculateProductPrice(newPrice, discount);

    product.price = newPrice;
    product.appliedDiscount = discount;
  }

  // update the product specs
  /**
   * @todo when updating the Images field , you need to apply JSON.parse() method for specs before updating it in db
   */
  if (specs) product.specs = JSON.parse(specs);
  if (req.files) {
    const splitedPublicId = product.Images.URLs[0].public_id.split(
      `${product.Images.customId}/`
    )[0];
    const URLs = [];

    await cloudinaryConfig().api.delete_resources_by_prefix(
      `${splitedPublicId}${product.Images.customId}`
    );

    for (const file of req.files) {
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder: `${splitedPublicId}/${product.Images.customId}`,
      });
      URLs.push({ secure_url, public_id });
    }
    if (URLs) product.Images.URLs = URLs;
  }
  //
  // save the product changes
  await product.save();

  // send the response
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: product,
  });
};
/**
 * @todo @api {delete} /products/delete/:productId  Delete Product
 */
export const deleteProduct = async (req, res, next) => {
  // get the sub-category id
  const { _id } = req.params;

  // find the sub-category by id
  const product = await Product.findByIdAndDelete(_id).populate([
    { path: "categoryId", select: "customId" },
    { path: "subCategoryId", select: "customId" },
    { path: "brandId", select: "customId" },
  ]);
  if (!product) {
    return next(new ErrorClass("product not found", 404, "product not found"));
  }
  // const brandDocument = req.document;
  const brandCustomId = product.brandId.customId;
  const categoryCustomId = product.categoryId.customId;
  const subCategoryCustomId = product.subCategoryId.customId;
  console.log(brandCustomId, " ", categoryCustomId, " ", subCategoryCustomId);
  // delete the related image from cloudinary
  const productPath = `${process.env.UPLOADS_FOLDER}/Categories/${categoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${product.Images.customId}`;
  await cloudinaryConfig().api.delete_resources_by_prefix(productPath);
  await cloudinaryConfig().api.delete_folder(productPath);

  // delete the related brands from db
  await Product.findByIdAndDelete(product._id);
  res.status(200).json({
    status: "success",
    message: "SubCategory deleted successfully",
  });
};

/**
 * @api {get} /products/list  list all Products
 *
 */
export const listProducts = async (req, res, next) => {
  // find all products
  // const { page = 1, limit = 5, ...filters } = req.query;
  // const skip = (page - 1) * limit;
  

  // const filtersAsString = JSON.stringify(filters);
  // const replacedFilters = (filtersAsString).replaceAll(/lt|gt|lte|gte|regex|ne|eq/g, (element)=> `$${element}`); 
  // const parsedFilters = JSON.parse(replacedFilters);

  /**
   * @way 1 using find , limit , skip methods
   */
  // const data = await Product.find()
  //   .limit(limit)
  //   .skip(skip)
  //   .select("-Images --spescs -categoryId -subCategoryId -brandId");

  /**
   * @way 2 using paginate method from mongoose-paginate-v2 as schema plugin
   */

  const mangooseQuery = Product.find();
    const apiFeatureInstance = new ApiFeatures(mangooseQuery, req.query).pagination()
    .sort().filter();

  const products = await apiFeatureInstance.mangooseQuery;
  // const products = await Product.paginate(parsedFilters,
  //   {
  //     page,
  //     limit,
  //     skip,
  //     select: "-Images --spescs -categoryId -subCategoryId -brandId",
  //     sort: { appliedPrice: 1 },
  //   }
  // );
  // send the response
  res.status(200).json({
    status: "success",
    message: "Products list",
    data: products,
  });
};

// page  1 , 2 , 3 , 4 ,...
// limit 50 , 50  , 50 , 50 ,...
// skip 0 , 50 , 100 , 150 , ... (page - 1) * limit
