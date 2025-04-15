/** Company */
export interface Company {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Industry */
  industry?: string | null;
  /** Address */
  address?: string | null;
  /** Logourl */
  logoUrl?: string | null;
  /** Revenue */
  revenue?: number | null;
  /** Employeeestimate */
  employeeEstimate?: number | null;
  /**
   * Createdat
   * @format date-time
   */
  createdAt: string;
  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string;
}

/** CompanyListItem */
export interface CompanyListItem {
  /**
   * Id
   * @format uuid
   */
  id: string;
  /** Name */
  name: string;
  /** Industry */
  industry?: string | null;
  /** Address */
  address?: string | null;
  /** Logourl */
  logoUrl?: string | null;
  /** Employeeestimate */
  employeeEstimate?: number | null;
}

/** CreateCompanyRequest */
export interface CreateCompanyRequest {
  /** Name */
  name: string;
  /** Industry */
  industry: string;
  /** Location */
  location: string;
  /** Logourl */
  logoUrl?: string | null;
  /** Revenue */
  revenue?: number | null;
  /** Employees */
  employees?: number | null;
}

/** GetCompanyResponse */
export interface GetCompanyResponse {
  company: Company;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ListCompaniesResponse */
export interface ListCompaniesResponse {
  /** Companies */
  companies: CompanyListItem[];
}

/** UpdateCompanyRequest */
export interface UpdateCompanyRequest {
  /** Name */
  name?: string | null;
  /** Industry */
  industry?: string | null;
  /** Location */
  location?: string | null;
  /** Logourl */
  logoUrl?: string | null;
  /** Revenue */
  revenue?: number | null;
  /** Employees */
  employees?: number | null;
}

/** UpsertCompanyResponse */
export interface UpsertCompanyResponse {
  company: Company;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type ListCompaniesData = ListCompaniesResponse;

export type CreateCompanyData = UpsertCompanyResponse;

export type CreateCompanyError = HTTPValidationError;

export interface GetCompanyParams {
  /**
   * Company Id
   * @format uuid
   */
  companyId: string;
}

export type GetCompanyData = GetCompanyResponse;

export type GetCompanyError = HTTPValidationError;

export interface UpdateCompanyParams {
  /**
   * Company Id
   * @format uuid
   */
  companyId: string;
}

export type UpdateCompanyData = UpsertCompanyResponse;

export type UpdateCompanyError = HTTPValidationError;

export interface DeleteCompanyParams {
  /**
   * Company Id
   * @format uuid
   */
  companyId: string;
}

export type DeleteCompanyData = any;

export type DeleteCompanyError = HTTPValidationError;
