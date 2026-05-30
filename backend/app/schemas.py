from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from datetime import date, datetime
from typing import Optional, List

# ==================== Company Schemas ====================
class CompanyBase(BaseModel):
    company_name: str = Field(..., description="Legal entity name")
    company_code: str = Field(..., description="Short identifier (e.g., TECH01)")
    account_type: str = Field(..., description="Account type: PAID POC, LICENSED, or ENTERPRISE")
    address_line1: str = Field(..., description="Street address, P.O. box, company name")
    city: str = Field(..., description="City")
    state_province: str = Field(..., description="State/Province")
    country: Optional[str] = Field("USA", description="Country")
    primary_contact_name: str = Field(..., description="Full legal name")
    business_email: EmailStr = Field(..., description="admin@company.com")
    mobile_phone: str = Field(..., description="Phone number with country code")
    user_id: str = Field(..., description="Unique user identifier")
    start_date: date = Field(..., description="License start date")
    end_date: date = Field(..., description="License end date")
    status: Optional[str] = Field("Active", description="Active or Non-Active")

    @validator('account_type')
    def validate_account_type(cls, v):
        allowed = ['PAID POC', 'LICENSED', 'ENTERPRISE']
        if v not in allowed:
            raise ValueError(f'Account type must be one of {allowed}')
        return v

    @validator('status')
    def validate_status(cls, v):
        if v:
            allowed = ['Active', 'Non-Active']
            if v not in allowed:
                raise ValueError(f'Status must be one of {allowed}')
        return v

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_code: Optional[str] = None
    account_type: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    country: Optional[str] = None
    primary_contact_name: Optional[str] = None
    business_email: Optional[EmailStr] = None
    mobile_phone: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CompanyListResponse(BaseModel):
    total: int
    active_licenses: int
    expiring_soon: int
    non_active: int
    companies: List[CompanyResponse]

# ==================== License Schemas ====================
class LicenseBase(BaseModel):
    company_id: int
    license_key: str
    license_type: str
    start_date: date
    end_date: date
    is_active: bool = True

class LicenseCreate(LicenseBase):
    pass

class LicenseResponse(LicenseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ==================== Audit Log Schemas ====================
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[str]
    action: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    old_data: Optional[dict]
    new_data: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ==================== Dashboard Schemas ====================
class DashboardStats(BaseModel):
    total_companies: int
    active_licenses: int
    expiring_soon: int
    non_active: int

class SearchFilters(BaseModel):
    search_term: Optional[str] = None
    account_type: Optional[str] = None
    status: Optional[str] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)

# ==================== Product Schemas ====================

# ==================== Product Schemas ====================
# ==================== Product Schemas ====================
class ProductBase(BaseModel):
    product_id: int = Field(..., description="Unique product identifier (primary key)")
    old_product_id: Optional[int] = Field(0, description="Old product identifier")
    product_description: Optional[str] = Field(None, description="Product description")
    locale: Optional[str] = Field(None, description="Locale")
    group_name: Optional[str] = Field(None, description="Product group name")
    sales_region: Optional[str] = Field(None, description="Sales region")
    product_type: Optional[str] = Field(None, description="Product category type")
    is_plannable: Optional[str] = Field("No", description="Is plannable (Yes/No)")
    abc_cat: Optional[str] = Field(None, description="ABC category")
    nlv: Optional[str] = Field(None, description="NLV value")
    lead_time: Optional[int] = Field(0, description="Lead time in days")
    min_lot_size: Optional[int] = Field(0, description="Minimum lot size")
    max_lot_size: Optional[int] = Field(0, description="Maximum lot size")

    @validator('is_plannable')
    def validate_is_plannable(cls, v):
        if v and v not in ['Yes', 'No']:
            raise ValueError('is_plannable must be Yes or No')
        return v

class ProductCreate(ProductBase):
    product_id: int = Field(..., description="Unique product identifier")
    product_description: str = Field(..., description="Product description is required")

class ProductUpdate(BaseModel):
    product_id: Optional[int] = None
    old_product_id: Optional[int] = None
    product_description: Optional[str] = None
    locale: Optional[str] = None
    group_name: Optional[str] = None
    sales_region: Optional[str] = None
    product_type: Optional[str] = None
    is_plannable: Optional[str] = None
    abc_cat: Optional[str] = None
    nlv: Optional[str] = None
    lead_time: Optional[int] = None
    min_lot_size: Optional[int] = None
    max_lot_size: Optional[int] = None

class ProductResponse(ProductBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ==================== Sales Schemas ====================
class SalesBase(BaseModel):
    product_id: int = Field(..., description="Product ID reference")
    product_description: Optional[str] = Field(None, description="Product description")
    sales_region: Optional[str] = Field(None, description="Sales region")
    month_period: date = Field(..., description="Month period (should be first day of month)")
    sales_qty: int = Field(..., ge=0, description="Sales quantity")

    @validator('month_period')
    def validate_month_period(cls, v):
        if v.day != 1:
            raise ValueError('Month period should be the first day of the month')
        return v

    @validator('sales_qty')
    def validate_sales_qty(cls, v):
        if v < 0:
            raise ValueError('Sales quantity cannot be negative')
        return v

class SalesCreate(SalesBase):
    pass

class SalesUpdate(BaseModel):
    product_description: Optional[str] = None
    sales_region: Optional[str] = None
    sales_qty: Optional[int] = Field(None, ge=0, description="Sales quantity")

class SalesResponse(SalesBase):
    id: int = Field(..., description="Database primary key")
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ==================== Upload Response Schema ====================
class UploadResponse(BaseModel):
    message: str
    records_inserted: int
    records_skipped: Optional[int] = 0
    errors: Optional[List[str]] = None
    total_in_db: Optional[int] = None

# ==================== Analytics Schemas ====================
class SalesAnalytics(BaseModel):
    product_id: int
    product_description: str
    total_sales: int
    average_sales: float
    max_sales: int
    min_sales: int
    months_count: int
    sales_region: Optional[str] = None

class DemandForecast(BaseModel):
    product_id: int
    product_description: str
    forecast_period: date
    forecasted_demand: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    based_on_months: int