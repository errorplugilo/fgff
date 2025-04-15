# src/app/apis/companies_api/__init__.py

# --- Start of Added Utilities ---
import psycopg2
import psycopg2.extras
import databutton as db
from contextlib import contextmanager
import uuid
import re
from datetime import date, datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = None
    db_url = db.secrets.get("POSTGRES_URL")
    if not db_url:
        print("ERROR: POSTGRES_URL secret not found.")
        raise ValueError("Database connection URL not configured.")
    try:
        # print("Attempting to connect to PostgreSQL...") # Reduced logging noise
        conn = psycopg2.connect(db_url)
        # print("PostgreSQL connection successful.")
        yield conn
    except Exception as e:
        print(f"ERROR: PostgreSQL connection failed: {e}")
        raise
    finally:
        if conn is not None:
            conn.close()
            # print("PostgreSQL connection closed.")

@contextmanager
def get_db_cursor(commit=False):
    """Context manager for database cursors using RealDictCursor."""
    conn_exception = None
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                yield cursor
                if commit:
                    conn.commit()
                    # print("DB transaction committed.")
            finally:
                cursor.close()
    except Exception as e:
        conn_exception = e # Capture exception

    # Raise exception outside the context manager block if connection failed
    if conn_exception:
         print(f"ERROR: Database cursor operation failed: {conn_exception}")
         # Raise a generic HTTPException for DB errors to be caught by FastAPI
         raise HTTPException(status_code=500, detail="Database operation failed.")

def snake_to_camel(snake_str):
    """Convert snake_case string to camelCase."""
    if not isinstance(snake_str, str): return snake_str
    return re.sub(r'_([a-z0-9])', lambda match: match.group(1).upper(), snake_str)

def row_to_camel_dict(row):
    """Convert DB row (dict) from snake_case keys to camelCase keys for API."""
    if row is None: return None
    camel_dict = {}
    for k, v in dict(row).items():
        camel_key = snake_to_camel(k)
        if isinstance(v, uuid.UUID): camel_dict[camel_key] = str(v)
        elif isinstance(v, (datetime, date)): camel_dict[camel_key] = v.isoformat()
        else: camel_dict[camel_key] = v
    return camel_dict

def camel_to_snake_dict(camel_dict):
    """Convert API dict from camelCase keys to snake_case keys for DB."""
    if camel_dict is None: return None
    snake_dict = {}
    for k, v in camel_dict.items():
        snake_key = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
        # Map specific UI fields to DB fields if names differ significantly
        if k == 'location': # Map UI 'location' to DB 'address' or 'city' ? Let's use address for now
            snake_key = 'address'
        elif k == 'employees': # Map UI 'employees' to DB 'employee_estimate'
             snake_key = 'employee_estimate'
        # Add other mappings if needed

        snake_dict[snake_key] = v
    return snake_dict
# --- End of Added Utilities ---


# --- Updated Models ---
# Define Company model based on actual DB columns needed by UI
# Use Field(alias=...) if Pydantic model names differ from camelCase DB names
class Company(BaseModel):
    id: uuid.UUID # Keep as UUID, will be stringified by row_to_camel_dict
    name: str
    industry: Optional[str] = None
    location: Optional[str] = Field(None, alias='address') # Map 'address' from DB to 'location' in API
    logoUrl: Optional[str] = Field(None, alias='logoUrl') # DB is logo_url -> logoUrl
    revenue: Optional[int] = None # DB is bigint
    employees: Optional[int] = Field(None, alias='employeeEstimate') # Map 'employeeEstimate' from DB
    # Add other fields from your DB schema if needed by the UI later
    # e.g., websiteUrl: Optional[str] = Field(None, alias='websiteUrl')
    # city: Optional[str] = None
    # countryName: Optional[str] = Field(None, alias='countryName')
    createdAt: datetime # Keep as datetime, will be stringified
    updatedAt: datetime # Keep as datetime, will be stringified

    class Config:
        populate_by_name = True # Allow using alias for population

# Model for listing companies (might be simpler)
class CompanyListItem(BaseModel):
     id: uuid.UUID
     name: str
     industry: Optional[str] = None
     location: Optional[str] = Field(None, alias='address')
     logoUrl: Optional[str] = Field(None, alias='logoUrl')
     # Add employees/revenue if shown in list/grid view
     employees: Optional[int] = Field(None, alias='employeeEstimate')

     class Config:
        populate_by_name = True

# Request model for creating (maps UI fields to potential DB fields)
class CreateCompanyRequest(BaseModel):
    name: str # Maps to db 'name'
    industry: str # Maps to db 'industry'
    location: str # Maps to db 'address'
    logoUrl: Optional[str] = None # Maps to db 'logo_url'
    revenue: Optional[int] = None # Maps to db 'revenue'
    employees: Optional[int] = None # Maps to db 'employee_estimate'

# Request model for updating (all optional)
class UpdateCompanyRequest(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None # Will map to 'address' in DB via helper
    logoUrl: Optional[str] = None
    revenue: Optional[int] = None
    employees: Optional[int] = None # Will map to 'employee_estimate' in DB via helper

# Response models (can use the main Company model or specific ones)
class ListCompaniesResponse(BaseModel):
    companies: List[CompanyListItem]

class GetCompanyResponse(BaseModel):
    company: Company

class UpsertCompanyResponse(BaseModel):
    company: Company

# --- API Router ---
router = APIRouter(prefix="/companies", tags=["Companies"])

# --- (Endpoints will be added/modified in the next step) ---

# --- Mock data (to be removed) ---
# Remove the mock_companies_data list and Contact class if not used elsewhere


# --- API Endpoints ---

@router.get("", response_model=ListCompaniesResponse)
def list_companies() -> ListCompaniesResponse:
    """
    Retrieves a list of companies from the database.
    Fetches fields relevant for the list/grid view.
    """
    print("API: Fetching list of companies from database")
    # Select fields relevant for CompanyListItem
    query = """
        SELECT id, name, industry, address, logo_url, employee_estimate
        FROM companies
        ORDER BY name ASC;
    """
    companies_list = []
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            print(f"API: Found {len(results)} companies in DB.")
            # Convert each row using the alias-aware CompanyListItem model
            for row in results:
                 # Explicitly map DB columns to CompanyListItem fields using aliases
                 company_data = row_to_camel_dict(row)
                 # Validate and append (Pydantic handles alias mapping here)
                 companies_list.append(CompanyListItem.model_validate(company_data))

    except HTTPException as http_exc:
        raise http_exc # Re-raise HTTP exceptions from cursor context manager
    except Exception as e:
        print(f"API ERROR: Failed to fetch companies: {e}")
        # Consider raising HTTPException here too, or let the cursor manager handle it
        raise HTTPException(status_code=500, detail="Failed to retrieve companies from database.")

    return ListCompaniesResponse(companies=companies_list)


@router.get("/{company_id}", response_model=GetCompanyResponse)
def get_company(company_id: uuid.UUID) -> GetCompanyResponse:
    """
    Retrieves details for a specific company by its UUID from the database.
    """
    print(f"API: Fetching company with ID: {company_id} from database")
    # Select all relevant fields for the Company model
    query = """
        SELECT id, name, industry, address, logo_url, revenue, employee_estimate, created_at, updated_at
        FROM companies
        WHERE id = %s;
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, (str(company_id),)) # Pass ID as tuple
            result = cursor.fetchone()
            if result is None:
                print(f"API: Company with ID {company_id} not found in DB")
                raise HTTPException(status_code=404, detail="Company not found")

            # Convert row using the alias-aware Company model
            company_data = row_to_camel_dict(result)
            validated_company = Company.model_validate(company_data)
            print(f"API: Found company: {validated_company.name}")
            return GetCompanyResponse(company=validated_company)

    except HTTPException as http_exc:
        raise http_exc # Re-raise HTTP exceptions (404 or 500 from cursor)
    except Exception as e:
        print(f"API ERROR: Failed to fetch company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve company details from database.")


@router.post("", response_model=UpsertCompanyResponse, status_code=201)
def create_company(request: CreateCompanyRequest) -> UpsertCompanyResponse:
    """
    Creates a new company entry in the database.
    Generates a new UUID for the company.
    """
    print(f"API: Attempting to create company: {request.name}")
    new_id = uuid.uuid4()
    # Convert request (camelCase) to snake_case for DB insertion
    company_data_snake = camel_to_snake_dict(request.model_dump(exclude_unset=True))

    # Add required fields not in request (id, timestamps)
    company_data_snake['id'] = new_id
    # Use timezone-aware datetime if possible, otherwise naive
    now = datetime.now()
    company_data_snake['created_at'] = now
    company_data_snake['updated_at'] = now

    # Filter only columns present in the DB table based on user schema
    allowed_columns = [
        'id', 'name', 'logo_url', 'city', 'foundation_date', 'domain', 'employee_range',
        'categories', 'industry', 'address', 'contact_email', 'revenue', 'active',
        'catchall_email_domain', 'cleaned_phone_number', 'additional_industries',
        'alexa_rank', 'angel_list_profile_url', 'blog_url', 'business_industries',
        'country_name', 'crunchbase_url', 'employee_estimate', 'facebook_profile_url',
        'full_address', 'linkedin_id', 'linkedin_profile_url', 'main_domain',
        'main_phone_cleaned_number', 'main_phone_number', 'main_phone_source',
        'search_keywords', 'spoken_languages', 'state_name', 'stock_exchange',
        'stock_symbol', 'store_count', 'twitter_profile_url', 'website_url',
        'year_founded', 'zip_code', 'created_at', 'updated_at'
    ]
    # Filter the dict to only include keys that are allowed columns and have non-None values
    insert_data = {k: v for k, v in company_data_snake.items() if k in allowed_columns and v is not None}

    # Ensure essential columns have values if not provided and nullable
    if 'name' not in insert_data:
         raise HTTPException(status_code=400, detail="Company name is required.")
    if 'id' not in insert_data: insert_data['id'] = new_id # Should always be set
    if 'created_at' not in insert_data: insert_data['created_at'] = now
    if 'updated_at' not in insert_data: insert_data['updated_at'] = now


    # Construct dynamic INSERT query
    columns = insert_data.keys()
    values_placeholders = ', '.join(['%s'] * len(columns))
    columns_str = ', '.join(columns)
    query = f"INSERT INTO companies ({columns_str}) VALUES ({values_placeholders}) RETURNING id;"

    values = [insert_data[col] for col in columns] # Ensure order matches columns

    try:
        with get_db_cursor(commit=True) as cursor:
            print(f"Executing INSERT: {query} with values: {values}")
            cursor.execute(query, values)
            inserted_row = cursor.fetchone() # Fetch the returned id
            if not inserted_row:
                raise HTTPException(status_code=500, detail="Failed to retrieve created company ID.")
            inserted_id = inserted_row['id']

            print(f"API: Successfully created company with ID {inserted_id}")
            # Fetch the newly created company to return it
            return get_company(inserted_id) # Reuse get_company endpoint logic

    except HTTPException as http_exc:
        raise http_exc
    except psycopg2.Error as db_err: # Catch specific DB errors
        print(f"API DB ERROR (Create): {db_err}")
        raise HTTPException(status_code=500, detail=f"Database error during company creation: {db_err}")
    except Exception as e:
        print(f"API ERROR: Failed to create company {request.name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create company in database.")


@router.put("/{company_id}", response_model=UpsertCompanyResponse)
def update_company(company_id: uuid.UUID, request: UpdateCompanyRequest) -> UpsertCompanyResponse:
    """
    Updates an existing company entry in the database by its UUID.
    """
    print(f"API: Attempting to update company with ID: {company_id}")
    # Convert request (camelCase) to snake_case
    update_data_snake = camel_to_snake_dict(request.model_dump(exclude_unset=True))

    if not update_data_snake:
        raise HTTPException(status_code=400, detail="No update data provided.")

    # Add updated_at timestamp
    update_data_snake['updated_at'] = datetime.now()

    # Filter only columns present in the DB table that can be updated
    allowed_update_columns = [
        'name', 'logo_url', 'city', 'foundation_date', 'domain', 'employee_range',
        'categories', 'industry', 'address', 'contact_email', 'revenue', 'active',
        'catchall_email_domain', 'cleaned_phone_number', 'additional_industries',
        'alexa_rank', 'angel_list_profile_url', 'blog_url', 'business_industries',
        'country_name', 'crunchbase_url', 'employee_estimate', 'facebook_profile_url',
        'full_address', 'linkedin_id', 'linkedin_profile_url', 'main_domain',
        'main_phone_cleaned_number', 'main_phone_number', 'main_phone_source',
        'search_keywords', 'spoken_languages', 'state_name', 'stock_exchange',
        'stock_symbol', 'store_count', 'twitter_profile_url', 'website_url',
        'year_founded', 'zip_code', 'updated_at' # Include updated_at
    ]
    # Filter to allowed columns and non-None values
    update_fields = {k: v for k, v in update_data_snake.items() if k in allowed_update_columns and v is not None}

    # Check if only 'updated_at' is present or if dict is empty after filtering Nones
    if not update_fields or all(k == 'updated_at' for k in update_fields):
         raise HTTPException(status_code=400, detail="No valid fields provided for update.")

    # Construct dynamic UPDATE query
    set_clause = ', '.join([f"{col} = %s" for col in update_fields.keys()])
    query = f"UPDATE companies SET {set_clause} WHERE id = %s RETURNING id;"

    values = list(update_fields.values()) + [str(company_id)] # Values for SET clause + WHERE clause

    try:
        with get_db_cursor(commit=True) as cursor:
            print(f"Executing UPDATE for ID {company_id} with fields: {list(update_fields.keys())}")
            cursor.execute(query, values)
            result = cursor.fetchone()
            if result is None:
                 print(f"API: Company with ID {company_id} not found for update.")
                 raise HTTPException(status_code=404, detail="Company not found")

            updated_id = result['id']
            print(f"API: Successfully updated company with ID {updated_id}")
            # Fetch the updated company to return it
            return get_company(updated_id)

    except HTTPException as http_exc:
        raise http_exc
    except psycopg2.Error as db_err: # Catch specific DB errors
        print(f"API DB ERROR (Update): {db_err}")
        raise HTTPException(status_code=500, detail=f"Database error during company update: {db_err}")
    except Exception as e:
        print(f"API ERROR: Failed to update company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update company in database.")


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: uuid.UUID):
    """
    Deletes a company entry from the database by its UUID.
    Returns No Content (204) on success.
    """
    print(f"API: Attempting to delete company with ID: {company_id}")
    query = "DELETE FROM companies WHERE id = %s RETURNING id;"

    try:
        with get_db_cursor(commit=True) as cursor:
            cursor.execute(query, (str(company_id),))
            result = cursor.fetchone()
            if result is None:
                print(f"API: Company with ID {company_id} not found for deletion")
                raise HTTPException(status_code=404, detail="Company not found")

            deleted_id = result['id']
            print(f"API: Successfully deleted company with ID: {deleted_id}")
            # Need to return a Response for 204 No Content
            return Response(status_code=204)

    except HTTPException as http_exc:
        raise http_exc # Re-raise 404 or 500
    except psycopg2.Error as db_err: # Catch specific DB errors
        print(f"API DB ERROR (Delete): {db_err}")
        raise HTTPException(status_code=500, detail=f"Database error during company deletion: {db_err}")
    except Exception as e:
        print(f"API ERROR: Failed to delete company {company_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete company from database.")

# --- End of API Endpoints ---
