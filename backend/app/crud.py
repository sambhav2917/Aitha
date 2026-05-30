from sqlalchemy.orm import Session
from sqlalchemy import or_, and_,  func, desc
from datetime import date, datetime, timedelta
from typing import Optional, List, Tuple, Dict
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



from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List, Dict
from datetime import date
from app import models, schemas

# ==================== Product CRUD ====================
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List, Dict
from datetime import date
from app import models, schemas

# ==================== Product CRUD ====================
def create_product(db: Session, product: schemas.ProductCreate):
    """Create a single product"""
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def create_products_bulk(db: Session, products: List[Dict]):
    """Bulk create products"""
    if products:
        db.bulk_insert_mappings(models.Product, products)
        db.commit()

def get_product(db: Session, product_id: int):
    """Get product by product_id"""
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()

def get_product_by_db_id(db: Session, id: int):
    """Get product by database id"""
    return db.query(models.Product).filter(models.Product.id == id).first()

def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    product_type: Optional[str] = None,
    sales_region: Optional[str] = None
) -> List[models.Product]:
    """Get products with pagination and filtering"""
    query = db.query(models.Product)
    
    # Apply search filter
    if search:
        query = query.filter(
            or_(
                models.Product.product_description.ilike(f"%{search}%"),
                models.Product.group_name.ilike(f"%{search}%"),
                models.Product.product_type.ilike(f"%{search}%")
            )
        )
    
    # Apply product type filter
    if product_type:
        query = query.filter(models.Product.product_type == product_type)
    
    # Apply sales region filter
    if sales_region:
        query = query.filter(models.Product.sales_region == sales_region)
    
    # Order by product_id (primary key) instead of id
    products = query.order_by(models.Product.product_id).offset(skip).limit(limit).all()
    
    return products

def get_all_product_ids(db: Session) -> set:
    """Get all product_id values"""
    products = db.query(models.Product.product_id).all()
    return {p[0] for p in products}

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    """Update a product"""
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    """Delete a product"""
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    
    db.delete(db_product)
    db.commit()
    return True

def product_exists(db: Session, product_id: int) -> bool:
    """Check if product exists by product_id"""
    return db.query(models.Product).filter(models.Product.product_id == product_id).first() is not None

def get_product_count(db: Session) -> int:
    """Get total number of products"""
    return db.query(models.Product).count()

# ==================== Sales CRUD ====================
def create_sales_bulk(db: Session, sales_data: List[Dict]):
    """Bulk create sales records"""
    db.bulk_insert_mappings(models.Sales, sales_data)
    db.commit()

def create_sales_record(db: Session, sales: schemas.SalesCreate):
    """Create a single sales record"""
    db_sales = models.Sales(**sales.model_dump())
    db.add(db_sales)
    db.commit()
    db.refresh(db_sales)
    return db_sales

def get_sales(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    region: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[models.Sales]:
    """Get sales records with pagination and filtering"""
    query = db.query(models.Sales)
    
    if product_id:
        query = query.filter(models.Sales.product_id == product_id)
    
    if region:
        query = query.filter(models.Sales.sales_region == region)
    
    if start_date:
        query = query.filter(models.Sales.month_period >= start_date)
    
    if end_date:
        query = query.filter(models.Sales.month_period <= end_date)
    
    return query.order_by(desc(models.Sales.month_period)).offset(skip).limit(limit).all()

def get_sales_by_composite_key(db: Session, product_id: int, month_period: date):
    """Get sales record by composite key"""
    from sqlalchemy import and_
    return db.query(models.Sales).filter(
        and_(
            models.Sales.product_id == product_id,
            models.Sales.month_period == month_period
        )
    ).first()

def update_sales_record(db: Session, product_id: int, month_period: date, sales_update: schemas.SalesUpdate):
    """Update a sales record"""
    db_sales = get_sales_by_composite_key(db, product_id, month_period)
    if not db_sales:
        return None
    
    update_data = sales_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sales, field, value)
    
    db.commit()
    db.refresh(db_sales)
    return db_sales

def delete_sales_record(db: Session, product_id: int, month_period: date):
    """Delete a sales record"""
    db_sales = get_sales_by_composite_key(db, product_id, month_period)
    if not db_sales:
        return False
    
    db.delete(db_sales)
    db.commit()
    return True

def get_sales_count(db: Session) -> int:
    """Get total number of sales records"""
    return db.query(models.Sales).count()

def sales_record_exists(db: Session, product_id: int, month_period: date) -> bool:
    """Check if sales record exists"""
    return get_sales_by_composite_key(db, product_id, month_period) is not None