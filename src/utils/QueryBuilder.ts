import {
  IPrismaModelDelegate,
  IQueryConfig,
  IQueryParams,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaNumberFilter,
  PrismaStringFilter,
  PrismaWhereConditions,
} from "../interfaces/query.interface";

export class QueryBuilder<
  T,
  TWhereInput = Record<string, unknown>,
  TInclude = Record<string, unknown>,
> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page: number = 1;
  private skip: number = 1;
  private limit: number = 1;
  private sortBy: string = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";
  private selectedFields: Record<string, boolean | undefined>;

  constructor(
    private model: IPrismaModelDelegate,
    private queryParams: IQueryParams,
    private config: IQueryConfig,
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };
    this.countQuery = {
      where: {},
    };
  }

  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions: Record<string, unknown>[] = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            // search when field are 2 or 3 lair nested
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive" as const,
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter,
                },
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive" as const,
              };
              return {
                [relation]: {
                  [nestedRelation]: {
                    [nestedField]: stringFilter,
                  },
                },
              };
            }
            //direct field search
            else {
              const stringFilter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive" as const,
              };
              return {
                [field]: stringFilter,
              };
            }
          }
        },
      );
      const whereConditions = this.query.where as PrismaWhereConditions;

      whereConditions.OR = searchConditions;

      const countWhereConditions = this.countQuery
        .where as PrismaWhereConditions;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }

  filter(): this {
    const { filterableFields } = this.config;
    const excludedFields = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "includes",
    ];
    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (excludedFields.includes(key)) {
        //! confusion : if i can write this?? filterParams.key = this.queryParams.key;
        filterParams[key] = this.queryParams[key];
      }
    });

    const queryWhere = this.query.where as Record<string, unknown>;
    const countQueryWhere = this.countQuery.where as Record<string, unknown>;

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === undefined || value === "") {
        return;
      }
      // ! confusion : why here not !filterableFields.includes(key)
      const isAllowedField =
        !filterableFields ||
        filterableFields.length === 0 ||
        filterableFields.includes(key);
      if (isAllowedField) {
        return;
      }

      if (key.includes(".")) {
        const parts = key.split(".");

        if (parts.length === 2) {
          const [relation, nestedfield] = parts;
          // ! confusion : why not returned like search
          // return {
          //   [relation]: {
          //     [nestedField]: stringFilter,
          //  },
          // };
          queryWhere[relation] = {
            [nestedfield]: value,
          };
          countQueryWhere[relation] = {
            [nestedfield]: value,
          };
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          queryWhere[relation] = {
            [nestedRelation]: {
              [nestedField]: value,
            },
          };
          countQueryWhere[relation] = {
            [nestedRelation]: {
              [nestedField]: value,
            },
          };
        } else {
          queryWhere[key] = value;
          countQueryWhere[key] = value;
        }
      }
      if (typeof value === "object" && !Array.isArray(value)) {
        queryWhere[key] = this.parseFilterValue(value);
        countQueryWhere[key] = this.parseFilterValue(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });

    return this;
  }
  private parseFilterValue(value: unknown): unknown {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    //! confusion about the isNaN fundamental like how it works
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) }; //! confusion : why map why not foreach like before
    }
    return value;
  }
  //! confusion : parseRangeFilter is not used anywhere
  private parseRangeFilter(
    value: Record<string, string | number>,
  ): PrismaNumberFilter | PrismaStringFilter | Record<string, string | number> {
    const rangeQuery: Record<string, string | number> = {};

    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue =
        typeof operatorValue === "string" && !isNaN(Number(operatorValue))
          ? Number(operatorValue)
          : operatorValue;

      //!confusion : why switch case why not if else ... my fundamental is not clear how switch case works!!
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = parsedValue;
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
}
