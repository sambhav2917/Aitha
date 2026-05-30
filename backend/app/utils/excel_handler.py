import pandas as pd
import io
from fastapi import UploadFile, HTTPException
from typing import List, Dict, Any, Tuple
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

def validate_excel_file(file: UploadFile) -> None:
    """Validate that the uploaded file is an Excel file"""
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xls files allowed")

def read_excel_file(file: UploadFile) -> pd.DataFrame:
    """Read Excel file and return DataFrame"""
    try:
        # Read the file content into bytes
        contents = file.file.read()
        
        # Create a BytesIO object from the contents
        excel_file = io.BytesIO(contents)
        
        # Read the Excel file using pandas
        df = pd.read_excel(excel_file)
        
        logger.info(f"Successfully read Excel file with {len(df)} rows")
        return df
    except Exception as e:
        logger.error(f"Error reading Excel file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")
    finally:
        # Reset file pointer for potential re-use
        file.file.seek(0)

async def process_excel_file(file: UploadFile) -> Tuple[pd.DataFrame, List[str]]:
    """Process uploaded Excel file and return DataFrame and any errors"""
    validate_excel_file(file)
    
    # Read file content
    content = await file.read()
    
    # Create BytesIO object
    excel_buffer = io.BytesIO(content)
    
    # Read Excel file
    try:
        df = pd.read_excel(excel_buffer)
        logger.info(f"Successfully read Excel file with {len(df)} rows")
        
        # Normalize columns
        df = normalize_columns(df)
        
        return df, []
    except Exception as e:
        logger.error(f"Error reading Excel file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names to lowercase and strip whitespace"""
    df.columns = df.columns.str.strip().str.lower()
    return df

def validate_required_columns(df: pd.DataFrame, required_columns: set) -> None:
    """Validate that all required columns are present"""
    missing = required_columns - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing columns in Excel: {missing}. Found: {list(df.columns)}"
        )

def safe_int(value, default=0):
    """Safely convert value to int"""
    if pd.isna(value):
        return default
    try:
        return int(value)
    except (ValueError, OverflowError):
        return default

def safe_str(value, default=""):
    """Safely convert value to string"""
    if pd.isna(value):
        return default
    return str(value)

def safe_date(value):
    """Safely convert value to date"""
    if isinstance(value, (datetime, date)):
        return value.date() if isinstance(value, datetime) else value
    try:
        return pd.to_datetime(value).date()
    except:
        return None

def process_products_excel(df: pd.DataFrame) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Process products Excel DataFrame and return products list"""
    products = []
    errors = []
    
    for idx, row in df.iterrows():
        try:
            if pd.isna(row.get("product_id")):
                errors.append(f"Row {idx+2}: Missing product_id")
                continue
            
            product_data = {
                "product_id": int(row["product_id"]),
                "old_product_id": safe_int(row.get("old_product_id")),
                "product_description": safe_str(row.get("product_description")),
                "locale": safe_str(row.get("locale")),
                "group_name": safe_str(row.get("group_name")),
                "sales_region": safe_str(row.get("sales_region")),
                "product_type": safe_str(row.get("product_type")),
                "is_plannable": safe_str(row.get("is_plannable", "No")),
                "abc_cat": safe_str(row.get("abc_cat")),
                "nlvl": safe_str(row.get("nlv")),  # Note: nlvl in DB, nlv in Excel
                "lead_time": safe_int(row.get("lead_time")),
                "min_lot_size": safe_int(row.get("min_lot_size")),
                "max_lot_size": safe_int(row.get("max_lot_size"))
            }
            products.append(product_data)
        except Exception as e:
            error_msg = f"Row {idx+2}: {str(e)}"
            errors.append(error_msg)
            logger.error(error_msg)
    
    return products, errors

def process_sales_excel(df: pd.DataFrame, existing_product_ids: set) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Process sales Excel DataFrame and return sales list and errors"""
    sales_data = []
    errors = []
    
    for idx, row in df.iterrows():
        try:
            if pd.isna(row.get("product_id")):
                errors.append(f"Row {idx+2}: Missing product_id")
                continue
            
            product_id = safe_int(row["product_id"])
            
            if product_id not in existing_product_ids:
                errors.append(f"Row {idx+2}: product_id {product_id} not found in products")
                continue
            
            # Parse date
            month_period = safe_date(row.get("month_period"))
            if month_period is None:
                errors.append(f"Row {idx+2}: Invalid month_period format")
                continue
            
            sales_qty = safe_int(row.get("sales_qty"))
            
            if sales_qty < 0:
                errors.append(f"Row {idx+2}: Negative sales_qty")
                continue
            
            sales_data.append({
                "product_id": product_id,
                "product_description": safe_str(row.get("product_description")),
                "sales_region": safe_str(row.get("sales_region")),
                "month_period": month_period,
                "sales_qty": sales_qty
            })
        except Exception as e:
            errors.append(f"Row {idx+2}: {str(e)}")
            logger.error(f"Error processing row {idx+2}: {str(e)}")
    
    return sales_data, errors