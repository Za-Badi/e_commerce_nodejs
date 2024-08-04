// export class ApiFeatures {
//     constructor(query, queryStr) {
//         this.query = query;
//         this.queryStr = queryStr;
//     }
// }

export class ApiFeatures {
  // mangooseQuery : product.paginate()
  // query req.query
  constructor(mangooseQuery, query) {
    this.mangooseQuery = mangooseQuery;
    this.query = query;
  }

  //   sort
  sort() {
   
    const options = {

    sort: { price: -1 }};
    const sort = { price: -1 }
    this.mangooseQuery =  this.mangooseQuery.sort( this.query.sort);
    return this;
  }
  // pagination
   pagination() {
    const { page = 1, limit = 5 } = this.query;
    const skip = (page - 1) * limit;
    const options = {
      page,
      limit,
      skip,
      //   select: "-Images --spescs -categoryId -subCategoryId -brandId",
      //   sort: { appliedPrice: 1 },
    };
    console.log(options);
    this.mangooseQuery =  this.mangooseQuery.limit(options.limit).skip(options.skip);
    // .paginate({}, options);
    return this;
  }
  // filters
  filter() {
    const { page = 1, limit = 5, sort, ...filters } = this.query;

      const filtersAsString = JSON.stringify(filters);
  const replacedFilters = (filtersAsString).replaceAll(/lt|gt|lte|gte|regex|ne|eq/g, (element)=> `$${element}`); 
  const parsedFilters = JSON.parse(replacedFilters);
  this.mangooseQuery.find(parsedFilters);
return this;
  }
}
