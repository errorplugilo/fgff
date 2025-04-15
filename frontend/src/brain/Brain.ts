import {
  CheckHealthData,
  CreateCompanyData,
  CreateCompanyError,
  CreateCompanyRequest,
  DeleteCompanyData,
  DeleteCompanyError,
  DeleteCompanyParams,
  GetCompanyData,
  GetCompanyError,
  GetCompanyParams,
  ListCompaniesData,
  UpdateCompanyData,
  UpdateCompanyError,
  UpdateCompanyParams,
  UpdateCompanyRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Retrieves a list of companies from the database. Fetches fields relevant for the list/grid view.
   *
   * @tags Companies, dbtn/module:companies_api
   * @name list_companies
   * @summary List Companies
   * @request GET:/routes/companies
   */
  list_companies = (params: RequestParams = {}) =>
    this.request<ListCompaniesData, any>({
      path: `/routes/companies`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new company entry in the database. Generates a new UUID for the company.
   *
   * @tags Companies, dbtn/module:companies_api
   * @name create_company
   * @summary Create Company
   * @request POST:/routes/companies
   */
  create_company = (data: CreateCompanyRequest, params: RequestParams = {}) =>
    this.request<CreateCompanyData, CreateCompanyError>({
      path: `/routes/companies`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves details for a specific company by its UUID from the database.
   *
   * @tags Companies, dbtn/module:companies_api
   * @name get_company
   * @summary Get Company
   * @request GET:/routes/companies/{company_id}
   */
  get_company = ({ companyId, ...query }: GetCompanyParams, params: RequestParams = {}) =>
    this.request<GetCompanyData, GetCompanyError>({
      path: `/routes/companies/${companyId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Updates an existing company entry in the database by its UUID.
   *
   * @tags Companies, dbtn/module:companies_api
   * @name update_company
   * @summary Update Company
   * @request PUT:/routes/companies/{company_id}
   */
  update_company = (
    { companyId, ...query }: UpdateCompanyParams,
    data: UpdateCompanyRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCompanyData, UpdateCompanyError>({
      path: `/routes/companies/${companyId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Deletes a company entry from the database by its UUID. Returns No Content (204) on success.
   *
   * @tags Companies, dbtn/module:companies_api
   * @name delete_company
   * @summary Delete Company
   * @request DELETE:/routes/companies/{company_id}
   */
  delete_company = ({ companyId, ...query }: DeleteCompanyParams, params: RequestParams = {}) =>
    this.request<DeleteCompanyData, DeleteCompanyError>({
      path: `/routes/companies/${companyId}`,
      method: "DELETE",
      ...params,
    });
}
