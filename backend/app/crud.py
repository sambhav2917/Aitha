from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date, datetime, timedelta
from typing import Optional
from app import models, schemas

def convert_dates_to_str(obj):
    """Convert date/datetime objects to ISO format strings for JSON serialization"""
    if isinstance(obj, dict):
        return {k: convert_dates_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, (date, datetime)):
        return obj.isoformat()
    elif isinstance(obj, list):
        return [convert_dates_to_str(item) for item in obj]
    return obj

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_company_by_email(db: Session, email: str):
    return db.query(models.Company).filter(models.Company.business_email == email).first()

def get_company_by_user_id(db: Session, user_id: str):
    return db.query(models.Company).filter(models.Company.user_id == user_id).first()

def get_companies(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    account_type: Optional[str] = None,
    status: Optional[str] = None
):
    query = db.query(models.Company)
    
    if search:
        query = query.filter(
            or_(
                models.Company.company_name.ilike(f"%{search}%"),
                models.Company.user_id.ilike(f"%{search}%"),
                models.Company.business_email.ilike(f"%{search}%"),
                models.Company.company_code.ilike(f"%{search}%")
            )
        )
    
    if account_type:
        query = query.filter(models.Company.account_type == account_type)
    
    if status:
        query = query.filter(models.Company.status == status)
    
    total = query.count()
    companies = query.offset(skip).limit(limit).all()
    
    return total, companies

def update_company(db: Session, company_id: int, company_update: schemas.CompanyUpdate):
    db_company = get_company(db, company_id)
    if not db_company:
        return None
    
    update_data = company_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int):
    db_company = get_company(db, company_id)
    if db_company:
        db.delete(db_company)
        db.commit()
        return True
    return False

def get_dashboard_stats(db: Session):
    today = date.today()
    expiring_soon_date = today + timedelta(days=48)
    
    total_companies = db.query(models.Company).count()
    active_licenses = db.query(models.Company).filter(models.Company.status == "Active").count()
    expiring_soon = db.query(models.Company).filter(
        and_(
            models.Company.end_date <= expiring_soon_date,
            models.Company.end_date >= today,
            models.Company.status == "Active"
        )
    ).count()
    non_active = db.query(models.Company).filter(models.Company.status == "Non-Active").count()
    
    return schemas.DashboardStats(
        total_companies=total_companies,
        active_licenses=active_licenses,
        expiring_soon=expiring_soon,
        non_active=non_active
    )

def create_audit_log(
    db: Session, 
    user_id: str, 
    action: str, 
    entity_type: str, 
    entity_id: int,
    old_data: dict = None,
    new_data: dict = None,
    ip_address: str = None
):
    # Convert date objects to strings for JSON serialization
    if old_data:
        old_data = convert_dates_to_str(old_data)
    if new_data:
        new_data = convert_dates_to_str(new_data)
    
    audit_log = models.AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_data=old_data,
        new_data=new_data,
        ip_address=ip_address
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log

def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).offset(skip).limit(limit).all()