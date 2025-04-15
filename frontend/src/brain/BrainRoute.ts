import {
  CheckHealthData,
  CreateCompanyData,
  CreateCompanyRequest,
  DeleteCompanyData,
  GetCompanyData,
  ListCompaniesData,
  UpdateCompanyData,
  UpdateCompanyRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Retrieves a list of companies from the database. Fetches fields relevant for the list/grid view.
   * @tags Companies, dbtn/module:companies_api
   * @name list_companies
   * @summary List Companies
   * @request GET:/routes/companies
   */
  export namespace list_companies {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCompaniesData;
  }

  /**
   * @description Creates a new company entry in the database. Generates a new UUID for the company.
   * @tags Companies, dbtn/module:companies_api
   * @name create_company
   * @summary Create Company
   * @request POST:/routes/companies
   */
  export namespace create_company {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateCompanyRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCompanyData;
  }

  /**
   * @description Retrieves details for a specific company by its UUID from the database.
   * @tags Companies, dbtn/module:companies_api
   * @name get_company
   * @summary Get Company
   * @request GET:/routes/companies/{company_id}
   */
  export namespace get_company {
    export type RequestParams = {
      /**
       * Company Id
       * @format uuid
       */
      companyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCompanyData;
  }

  /**
   * @description Updates an existing company entry in the database by its UUID.
   * @tags Companies, dbtn/module:companies_api
   * @name update_company
   * @summary Update Company
   * @request PUT:/routes/companies/{company_id}
   */
  export namespace update_company {
    export type RequestParams = {
      /**
       * Company Id
       * @format uuid
       */
      companyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateCompanyRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCompanyData;
  }

  /**
   * @description Deletes a company entry from the database by its UUID. Returns No Content (204) on success.
   * @tags Companies, dbtn/module:companies_api
   * @name delete_company
   * @summary Delete Company
   * @request DELETE:/routes/companies/{company_id}
   */
  export namespace delete_company {
    export type RequestParams = {
      /**
       * Company Id
       * @format uuid
       */
      companyId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCompanyData;
  }
}
