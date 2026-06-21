# simple_forecast_service.py
"""
Simple FastAPI Forecasting Service - Start Here
"""

import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pickle
from pathlib import Path
import json
import os

app = FastAPI(title="AI Forecasting Service", description="Sales Forecasting API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models directory
MODELS_DIR = Path("trained_models")
MODELS_DIR.mkdir(exist_ok=True)

# Data file path
DATA_PATH = "/Users/home/Desktop/VScode_project/Aitha/Aitha/backend/app/upload/demo/sale_data.xlsx"

# ============================================
# Request/Response Models
# ============================================

class ForecastRequest(BaseModel):
    use_saved_model: bool = False
    model_name: Optional[str] = None
    horizon: int = 12
    geography: Optional[str] = None
    material_groups: Optional[List[str]] = None
    algorithm: str = "Seasonal AI"

class ForecastResponse(BaseModel):
    success: bool
    algorithm: str
    forecast_periods: List[str]
    forecast_values: List[float]
    confidence_intervals: Dict[str, List[float]]
    metrics: Dict[str, float]
    model_used: str
    message: Optional[str] = None

# ============================================
# Helper Functions
# ============================================

def load_sales_data():
    """Load and aggregate sales data"""
    try:
        if os.path.exists(DATA_PATH):
            df = pd.read_excel(DATA_PATH)
            df['month_period'] = pd.to_datetime(df['month_period'])
            
            # Filter planable products
            df = df[df['is_plannable'] == True]
            
            # Aggregate by month
            monthly_sales = df.groupby('month_period')['sales_qty'].sum().reset_index()
            monthly_sales = monthly_sales.sort_values('month_period')
            
            return monthly_sales
        else:
            print(f"Data file not found: {DATA_PATH}")
            return None
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def simple_forecast(historical_values, horizon=12):
    """Generate simple forecast using moving average"""
    if len(historical_values) == 0:
        return [1000] * horizon
    
    # Calculate moving average of last 3 months
    window = min(3, len(historical_values))
    last_avg = np.mean(historical_values[-window:])
    
    # Generate forecast with slight trend
    forecast = []
    for i in range(horizon):
        # Add small dampening effect
        value = last_avg * (1 - i * 0.02)
        forecast.append(max(0, value))
    
    return forecast

# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Forecasting Service is running!",
        "status": "active",
        "endpoints": {
            "health": "GET /health",
            "forecast": "POST /forecast",
            "models": "GET /models",
            "data": "GET /data"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    models_dir_exists = MODELS_DIR.exists()
    models_count = len(list(MODELS_DIR.glob("*.pkl"))) if models_dir_exists else 0
    
    return {
        "status": "healthy",
        "service": "Forecasting Service",
        "timestamp": datetime.now().isoformat(),
        "models_available": models_count,
        "models_directory": str(MODELS_DIR.absolute()),
        "data_file_exists": os.path.exists(DATA_PATH)
    }

@app.get("/models")
async def list_models():
    """List all available trained models"""
    models = []
    
    if MODELS_DIR.exists():
        for model_path in MODELS_DIR.glob("*.pkl"):
            try:
                with open(model_path, 'rb') as f:
                    model_package = pickle.load(f)
                
                models.append({
                    "name": model_path.stem,
                    "algorithm": model_package.get('metadata', {}).get('algorithm', 'Unknown'),
                    "created_at": model_package.get('metadata', {}).get('created_at', 'Unknown'),
                    "file_size_kb": round(model_path.stat().st_size / 1024, 2)
                })
            except:
                models.append({
                    "name": model_path.stem,
                    "algorithm": "Unknown",
                    "error": "Cannot read model file"
                })
    
    return {
        "total_models": len(models),
        "models": models,
        "models_directory": str(MODELS_DIR.absolute())
    }

@app.get("/data")
async def get_data_summary():
    """Get data summary"""
    monthly_sales = load_sales_data()
    
    if monthly_sales is None:
        return {"error": "Could not load data"}
    
    return {
        "total_months": len(monthly_sales),
        "date_range": {
            "start": monthly_sales['month_period'].min().strftime("%Y-%m"),
            "end": monthly_sales['month_period'].max().strftime("%Y-%m")
        },
        "total_sales": int(monthly_sales['sales_qty'].sum()),
        "avg_monthly_sales": float(monthly_sales['sales_qty'].mean()),
        "data_preview": monthly_sales.tail(6).to_dict('records')
    }

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """Generate forecast using saved model or simple method"""
    
    try:
        # Load historical data
        monthly_sales = load_sales_data()
        
        if monthly_sales is None or len(monthly_sales) == 0:
            # Generate dummy forecast if no data
            forecast_values = [1000 + i * 50 for i in range(request.horizon)]
            forecast_periods = [(datetime.now() + timedelta(days=30*i)).strftime("%Y-%m") 
                               for i in range(1, request.horizon + 1)]
            
            return ForecastResponse(
                success=True,
                algorithm="Simple Forecast (No Data)",
                forecast_periods=forecast_periods,
                forecast_values=forecast_values,
                confidence_intervals={
                    "lower": [v * 0.8 for v in forecast_values],
                    "upper": [v * 1.2 for v in forecast_values]
                },
                metrics={
                    "total_forecast": sum(forecast_values),
                    "mean_forecast": np.mean(forecast_values),
                    "mape": 15.0,
                    "rmse": 0
                },
                model_used="fallback",
                message="No historical data found, using sample forecast"
            )
        
        # Get historical values
        historical_values = monthly_sales['sales_qty'].values
        historical_dates = monthly_sales['month_period']
        
        # Generate forecast based on request
        if request.use_saved_model and request.model_name:
            # Try to load saved model
            model_path = MODELS_DIR / f"{request.model_name}.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    model_package = pickle.load(f)
                algorithm = model_package.get('metadata', {}).get('algorithm', request.algorithm)
                model_used = request.model_name
                
                # Extract forecast from model if available
                if 'forecast_sample' in model_package.get('metadata', {}):
                    # Use the forecast from model metadata
                    forecast_sample = model_package['metadata']['forecast_sample']
                    # Extend or truncate to match horizon
                    if len(forecast_sample) >= request.horizon:
                        forecast_values = forecast_sample[:request.horizon]
                    else:
                        # Repeat pattern
                        repeats = request.horizon // len(forecast_sample) + 1
                        forecast_values = (forecast_sample * repeats)[:request.horizon]
                else:
                    # Generate forecast based on model type
                    forecast_values = simple_forecast(historical_values, request.horizon)
            else:
                # Model not found, use simple forecast
                forecast_values = simple_forecast(historical_values, request.horizon)
                algorithm = "Simple Moving Average (Fallback)"
                model_used = "fallback (model not found)"
        else:
            # Use simple forecasting method
            forecast_values = simple_forecast(historical_values, request.horizon)
            algorithm = request.algorithm
            model_used = "simple_forecast"
        
        # Generate forecast periods
        last_date = historical_dates.iloc[-1]
        forecast_periods = []
        for i in range(1, request.horizon + 1):
            next_month = last_date + timedelta(days=30 * i)
            forecast_periods.append(next_month.strftime("%Y-%m"))
        
        # Calculate confidence intervals (95% prediction interval)
        std_dev = np.std(historical_values) if len(historical_values) > 1 else np.mean(historical_values) * 0.1
        margin = 1.96 * std_dev
        
        confidence_intervals = {
            "lower": [max(0, v - margin) for v in forecast_values],
            "upper": [v + margin for v in forecast_values]
        }
        
        # Calculate metrics
        metrics = {
            "total_forecast": sum(forecast_values),
            "mean_forecast": np.mean(forecast_values),
            "std_forecast": np.std(forecast_values),
            "min_forecast": min(forecast_values),
            "max_forecast": max(forecast_values)
        }
        
        return ForecastResponse(
            success=True,
            algorithm=algorithm,
            forecast_periods=forecast_periods,
            forecast_values=[round(v, 2) for v in forecast_values],
            confidence_intervals={
                "lower": [round(v, 2) for v in confidence_intervals["lower"]],
                "upper": [round(v, 2) for v in confidence_intervals["upper"]]
            },
            metrics=metrics,
            model_used=model_used,
            message="Forecast generated successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# Run the application
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🚀 AI FORECASTING SERVICE")
    print("="*60)
    print(f"📁 Models directory: {MODELS_DIR.absolute()}")
    print(f"📊 Data file: {DATA_PATH}")
    print(f"✅ Data loaded: {load_sales_data() is not None}")
    print("="*60)
    print("\n📍 Server will run at: http://localhost:8015")
    print("📚 API Documentation: http://localhost:8015/docs")
    print("🔧 Health Check: http://localhost:8015/health")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(
        "simple_forecast_service:app",
        host="0.0.0.0",
        port=8015,
        reload=True,
        log_level="info"
    )