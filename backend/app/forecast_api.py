# forecast_api.py
"""
FastAPI service for UI integration
Matches exactly with your UI screenshot
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import pickle
from pathlib import Path
import json

# Import the forecasting orchestrator
from complete_forecasting_model import ForecastingOrchestrator

app = FastAPI(title="Aitha Enterprise Forecasting API")

# Enable CORS for Node.js UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
DATA_PATH = "/Users/home/Desktop/VScode_project/Aitha/Aitha/backend/app/upload/demo/sale_data.xlsx"
orchestrator = ForecastingOrchestrator(DATA_PATH)

# Models directory for saving templates
MODELS_DIR = Path("saved_templates")
MODELS_DIR.mkdir(exist_ok=True)

# ============================================
# Request/Response Models
# ============================================

class ForecastRequest(BaseModel):
    horizon: int = 12
    frequency: str = "Monthly"
    historical_baseline: int = 12
    geography: Optional[str] = None  # "Global Overview", "North America (NA)", "EMEA"
    material_groups: Optional[List[str]] = None
    algorithm: str = "Seasonal AI"  # "Seasonal AI", "Linear Reg.", "Moving Avg."

class SaveTemplateRequest(BaseModel):
    template_name: str
    horizon: int = 12
    frequency: str = "Monthly"
    historical_baseline: int = 12
    geography: Optional[str] = None
    material_groups: Optional[List[str]] = None
    algorithm: str = "Seasonal AI"

class ForecastResponse(BaseModel):
    success: bool
    configuration: Dict[str, Any]
    historical_summary: Dict[str, Any]
    forecast_periods: List[str]
    forecast_values: List[float]
    confidence_intervals: Dict[str, List[float]]
    metrics: Dict[str, float]
    message: str

# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    return {
        "service": "Aitha Enterprise Forecasting API",
        "version": "1.0",
        "models": ["Seasonal AI", "Linear Reg.", "Moving Avg."]
    }

@app.get("/metadata")
async def get_metadata():
    """Get available options for UI dropdowns"""
    return {
        "geographies": [
            {"value": "Global Overview", "label": "Global Overview"},
            {"value": "North America (NA)", "label": "North America (NA)"},
            {"value": "EMEA", "label": "EMEA"}
        ],
        "material_groups": [
            {"value": "Electronics", "label": "Consumer Electronics"},
            {"value": "Smart Home Devices", "label": "Smart Home Devices"},
            {"value": "Books", "label": "Books"},
            {"value": "Toys", "label": "Toys"},
            {"value": "Furniture", "label": "Furniture"}
        ],
        "algorithms": [
            {"value": "Seasonal AI", "label": "Seasonal AI", 
             "description": "Machine learning model optimized for high-volatility and seasonal trends."},
            {"value": "Linear Reg.", "label": "Linear Reg.", 
             "description": "Traditional statistical approach best suited for stable, mature product lines."},
            {"value": "Moving Avg.", "label": "Moving Avg.", 
             "description": "Simple smoothing technique for short-term operational planning."}
        ],
        "forecast_horizons": [3, 6, 12, 18, 24],
        "historical_baselines": [6, 12, 18, 24],
        "generation_frequencies": ["Daily", "Weekly", "Monthly", "Quarterly"]
    }

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """Generate forecast based on UI parameters"""
    try:
        result = orchestrator.forecast(
            geography=request.geography,
            material_groups=request.material_groups,
            historical_baseline=request.historical_baseline,
            horizon=request.horizon,
            algorithm=request.algorithm
        )
        
        return ForecastResponse(
            success=True,
            configuration=result['configuration'],
            historical_summary=result['historical_data']['summary'],
            forecast_periods=result['forecast']['periods'],
            forecast_values=result['forecast']['values'],
            confidence_intervals={
                "lower": result['forecast']['lower_bound'],
                "upper": result['forecast']['upper_bound']
            },
            metrics=result['metrics'],
            message=f"Forecast generated successfully using {request.algorithm}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/templates/save")
async def save_template(request: SaveTemplateRequest):
    """Save current configuration as a template"""
    try:
        template_data = {
            "name": request.template_name,
            "created_at": datetime.now().isoformat(),
            "configuration": {
                "horizon": request.horizon,
                "frequency": request.frequency,
                "historical_baseline": request.historical_baseline,
                "geography": request.geography,
                "material_groups": request.material_groups,
                "algorithm": request.algorithm
            }
        }
        
        # Save template
        template_path = MODELS_DIR / f"{request.template_name}.json"
        with open(template_path, 'w') as f:
            json.dump(template_data, f, indent=2)
        
        return {
            "success": True,
            "message": f"Template '{request.template_name}' saved successfully",
            "template_path": str(template_path)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/templates")
async def list_templates():
    """List all saved templates"""
    templates = []
    for template_path in MODELS_DIR.glob("*.json"):
        with open(template_path, 'r') as f:
            template = json.load(f)
        templates.append({
            "name": template_path.stem,
            "created_at": template.get("created_at"),
            "configuration": template.get("configuration", {})
        })
    return {"templates": templates}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_available": ["Seasonal AI", "Linear Reg.", "Moving Avg."]
    }

# ============================================
# Run the application
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*70)
    print("🚀 AITHA ENTERPRISE FORECASTING API")
    print("="*70)
    print("📍 Server: http://localhost:8015")
    print("📚 Docs: http://localhost:8015/docs")
    print("🔧 Health: http://localhost:8015/health")
    print("\n📊 Available Models:")
    print("   • Seasonal AI - For high-volatility seasonal trends")
    print("   • Linear Reg. - For stable, mature product lines")
    print("   • Moving Avg. - For short-term operational planning")
    print("="*70 + "\n")
    
    uvicorn.run(
        "forecast_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )