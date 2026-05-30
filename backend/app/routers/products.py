from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app import crud, schemas
from app.database import get_db
from app.utils.excel_handler import (
    validate_excel_file, 
    read_excel_file, 
    normalize_columns,
    validate_required_columns, 
    process_products_excel
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/upload-excel", response_model=schemas.UploadResponse)
def upload_products_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload products from Excel file"""
    validate_excel_file(file)
    
    # Read and process the file
    df = read_excel_file(file)
    df = normalize_columns(df)
    
    required_columns = {
        "product_id", "product_description", "locale", "group_name", 
        "sales_region", "old_product_id", "product_type", "is_plannable",
        "abc_cat", "nlv", "lead_time", "min_lot_size", "max_lot_size"
    }
    
    validate_required_columns(df, required_columns)
    
    # Process products
    products_data, errors = process_products_excel(df)
    
    if not products_data:
        raise HTTPException(status_code=400, detail="No valid products found in Excel file")
    
    # Filter out existing products
    new_products = []
    skipped = 0
    
    for product_data in products_data:
        if crud.product_exists(db, product_data["product_id"]):
            skipped += 1
            continue
        new_products.append(product_data)
    
    # Insert new products
    inserted = 0
    if new_products:
        crud.create_products_bulk(db, new_products)
        inserted = len(new_products)
        logger.info(f"Successfully inserted {inserted} products")
    
    return schemas.UploadResponse(
        message="Products uploaded successfully",
        records_inserted=inserted,
        records_skipped=skipped,
        errors=errors if errors else None
    )

@router.get("/", response_model=List[schemas.ProductResponse])
def get_all_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None, description="Search by description or group name"),
    product_type: Optional[str] = Query(None, description="Filter by product type"),
    sales_region: Optional[str] = Query(None, description="Filter by sales region"),
    db: Session = Depends(get_db)
):
    """Get all products with pagination and filtering"""
    products = crud.get_products(
        db, 
        skip=skip, 
        limit=limit,
        search=search,
        product_type=product_type,
        sales_region=sales_region
    )
    
    return products

@router.get("/count", response_model=int)
def get_product_count(db: Session = Depends(get_db)):
    """Get total number of products"""
    return crud.get_product_count(db)

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product by ID"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductResponse, status_code=201)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product"""
    if crud.product_exists(db, product.product_id):
        raise HTTPException(status_code=400, detail="Product ID already exists")
    
    return crud.create_product(db, product)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product"""
    db_product = crud.update_product(db, product_id, product_update)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Delete a product"""
    success = crud.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None