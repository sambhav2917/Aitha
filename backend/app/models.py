from sqlalchemy import Column, Integer, String, Date, Boolean, Text, DateTime, JSON, ForeignKey,BigInteger,TIMESTAMP, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    company_code = Column(String(50), unique=True, nullable=False)
    account_type = Column(String(50), nullable=False)
    address_line1 = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    country = Column(String(100), default="USA")
    primary_contact_name = Column(String(255), nullable=False)
    business_email = Column(String(255), unique=True, nullable=False)
    mobile_phone = Column(String(50), nullable=False)
    user_id = Column(String(50), unique=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    old_data = Column(JSON)
    new_data = Column(JSON)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    license_key = Column(String(100), unique=True, nullable=False)
    license_type = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"

    # Remove 'id' column - use product_id as primary key
    product_id = Column(BigInteger, primary_key=True, index=True)  # This is the PK
    old_product_id = Column(BigInteger, default=0)
    product_description = Column(Text)
    locale = Column(String(50))
    group_name = Column(String(100))
    sales_region = Column(String(100))
    product_type = Column(String(100))
    is_plannable = Column(String(10), default="No")
    abc_cat = Column(String(10))
    nlv = Column(String(50))  # Note: nlvl, not nlv
    lead_time = Column(Integer, default=0)
    min_lot_size = Column(Integer, default=0)
    max_lot_size = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Sales(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(BigInteger, nullable=False, index=True)
    product_description = Column(Text)
    sales_region = Column(String(100))
    month_period = Column(DateTime, nullable=False)
    sales_qty = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationship
    #product = relationship("Product", back_populates="sales")