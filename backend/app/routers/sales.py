from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from app import crud, schemas
from app.database import get_db
from app.utils.excel_handler import (
    validate_excel_file, read_excel_file, normalize_columns,
    validate_required_columns, process_sales_excel
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sales", tags=["Sales"])

@router.post("/upload-excel", response_model=schemas.UploadResponse)
def upload_sales_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload sales data from Excel file with bulk insert"""
    validate_excel_file(file)
    df = read_excel_file(file)
    df = normalize_columns(df)
    
    required_columns = {
        "product_id", "product_description", "sales_region", 
        "month_period", "sales_qty"
    }
    
    validate_required_columns(df, required_columns)
    
    # Get existing product IDs
    existing_product_ids = crud.get_all_product_ids(db)
    
    # Process sales data
    sales_data, errors = process_sales_excel(df, existing_product_ids)
    
    if not sales_data:
        raise HTTPException(status_code=400, detail="No valid sales records found in Excel file")
    
    # Bulk insert
    crud.create_sales_bulk(db, sales_data)
    
    total_sales = crud.get_sales_count(db)
    
    return schemas.UploadResponse(
        message="Sales data uploaded successfully",
        records_inserted=len(sales_data),
        errors=errors if errors else None,
        total_in_db=total_sales
    )

@router.get("/", response_model=List[schemas.SalesResponse])
def get_all_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    region: Optional[str] = Query(None, description="Filter by sales region"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Get all sales records with optional filters"""
    return crud.get_sales(
        db, skip=skip, limit=limit,
        product_id=product_id, region=region,
        start_date=start_date, end_date=end_date
    )

@router.get("/{product_id}/{month_period}", response_model=schemas.SalesResponse)
def get_sales_by_key(
    product_id: int,
    month_period: date,
    db: Session = Depends(get_db)
):
    """Get sales record by composite key (product_id and month_period)"""
    sales = crud.get_sales_by_composite_key(db, product_id, month_period)
    if not sales:
        raise HTTPException(status_code=404, detail="Sales record not found")
    return sales

@router.post("/", response_model=schemas.SalesResponse, status_code=201)
def create_sales_record(
    sales: schemas.SalesCreate,
    db: Session = Depends(get_db)
):
    """Create a new sales record"""
    # Check if product exists
    if not crud.product_exists(db, sales.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check for duplicate
    if crud.sales_record_exists(db, sales.product_id, sales.month_period):
        raise HTTPException(status_code=400, detail="Sales record already exists for this product and month")
    
    return crud.create_sales_record(db, sales)

@router.put("/{product_id}/{month_period}", response_model=schemas.SalesResponse)
def update_sales_record(
    product_id: int,
    month_period: date,
    sales_update: schemas.SalesUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing sales record"""
    db_sales = crud.update_sales_record(db, product_id, month_period, sales_update)
    if not db_sales:
        raise HTTPException(status_code=404, detail="Sales record not found")
    return db_sales

@router.delete("/{product_id}/{month_period}", status_code=204)
def delete_sales_record(
    product_id: int,
    month_period: date,
    db: Session = Depends(get_db)
):
    """Delete a sales record"""
    success = crud.delete_sales_record(db, product_id, month_period)
    if not success:
        raise HTTPException(status_code=404, detail="Sales record not found")
    return None

@router.get("/debug/count")
def get_sales_count(db: Session = Depends(get_db)):
    """Debug endpoint to check sales table count"""
    return {"total_sales_records": crud.get_sales_count(db)}