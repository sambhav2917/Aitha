from pydantic import BaseModel, EmailStr, Field, validator
from datetime import date, datetime
from typing import Optional, List

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

    class Config:
        from_attributes = True

class CompanyListResponse(BaseModel):
    total: int
    active_licenses: int
    expiring_soon: int
    non_active: int
    companies: List[CompanyResponse]

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

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True

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