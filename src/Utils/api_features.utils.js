export class ApiFeatures {
  constructor(mangooseQuery, query, populate) {
    this.mangooseQuery = mangooseQuery;
    this.query = query;
    this.options;
    this.populate = populate;
  }

  //   sort
  sorting() {
    if(this.query.sort){
      const sortQuery =JSON.parse(this.query.sort);
      this.options = {sort:  sortQuery};
    }
    // this.options = { sort: { price: 1 } };
    return this;
  }
  // pagination
  pagination() {
    const { page = 1, limit = 5 } = this.query;
    // const skip = (page - 1) * li/*  */mit;
    this.options = { ...this.options, page, limit };
    console.log(this.populate)
    if(this.populate){
      const populate = this.populate
      this.options = { ...this.options, populate };
    }
    this.mangooseQuery = this.mangooseQuery.paginate({}, this.options, this.populate);
    return this;
  }
  // filters
  filter() {
    const { page = 1, limit = 5, sort, ...filters } = this.query;

    const filtersAsString = JSON.stringify(filters);
    const replacedFilters = filtersAsString.replaceAll(
      /lt|gt|lte|gte|regex|ne|eq/g,
      (element) => `$${element}`
    );
    const parsedFilters = JSON.parse(replacedFilters);
    this.options = { options: this.options, filters: parsedFilters };
    // this.mangooseQuery.find(parsedFilters);
    return this;
  }
}
