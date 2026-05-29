from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/companies", tags=["Company Management"])

@router.post("/", response_model=schemas.CompanyResponse, status_code=201)
def register_company(
    company: schemas.CompanyCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new company (onboard multi-tenant instance)"""
    # Check if email already exists
    existing_email = crud.get_company_by_email(db, company.business_email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Business email already registered")
    
    # Check if user_id already exists
    existing_user = crud.get_company_by_user_id(db, company.user_id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    # Create company
    db_company = crud.create_company(db, company)
    
    # Create audit log
    crud.create_audit_log(
        db=db,
        user_id=company.user_id,
        action="CREATE",
        entity_type="company",
        entity_id=db_company.id,
        new_data=company.model_dump(),
        ip_address=request.client.host if request.client else None
    )
    
    return db_company

@router.get("/", response_model=schemas.CompanyListResponse)
def list_companies(
    search: Optional[str] = Query(None, description="Search by name, ID, or type"),
    account_type: Optional[str] = Query(None, description="Filter by account type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all companies with filtering and pagination"""
    skip = (page - 1) * page_size
    total, companies = crud.get_companies(
        db, skip=skip, limit=page_size, 
        search=search, account_type=account_type, status=status
    )
    
    # Get dashboard stats
    stats = crud.get_dashboard_stats(db)
    
    return schemas.CompanyListResponse(
        total=total,
        active_licenses=stats.active_licenses,
        expiring_soon=stats.expiring_soon,
        non_active=stats.non_active,
        companies=companies
    )

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Get dashboard statistics (total companies, active licenses, expiring soon, non-active)"""
    return crud.get_dashboard_stats(db)

@router.get("/{company_id}", response_model=schemas.CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company by ID"""
    db_company = crud.get_company(db, company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.put("/{company_id}", response_model=schemas.CompanyResponse)
def update_company(
    company_id: int, 
    company_update: schemas.CompanyUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update company information"""
    # Get old data for audit log
    old_company = crud.get_company(db, company_id)
    if not old_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    old_data = {c.name: getattr(old_company, c.name) for c in old_company.__table__.columns}
    
    # Update company
    db_company = crud.update_company(db, company_id, company_update)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Create audit log
    crud.create_audit_log(
        db=db,
        user_id=db_company.user_id,
        action="UPDATE",
        entity_type="company",
        entity_id=company_id,
        old_data=old_data,
        new_data=company_update.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None
    )
    
    return db_company

@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company"""
    success = crud.delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return None