# forecast_service.py
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.seasonal import seasonal_decompose
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="AI Forecasting Service", description="Multi-model forecasting for enterprise planning")

# CORS for Node.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],  # Your Node.js UI ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Pydantic Models ==========
class ForecastRequest(BaseModel):
    horizon: int = 12  # months
    frequency: str = "Monthly"
    historical_baseline: int = 12  # months
    geography: Optional[List[str]] = None
    material_groups: Optional[List[str]] = None
    algorithm: str = "Seasonal AI"  # "Seasonal AI", "Linear Reg.", "Moving Avg."
    
class ForecastResponse(BaseModel):
    algorithm: str
    forecast_periods: List[str]
    forecast_values: List[float]
    confidence_intervals: Optional[Dict[str, List[float]]]
    metrics: Dict[str, float]  # MAPE, RMSE, etc.
    
class BatchForecastRequest(BaseModel):
    requests: List[ForecastRequest]
    
# ========== Data Loading & Preprocessing ==========
class ForecastingEngine:
    def __init__(self, data_path: str = "/Users/home/Desktop/VScode_project/Aitha/Aitha/backend/app/upload/demo/sale_data.xlsx"):
        self.data_path = data_path
        self.df = None
        self.load_data()
        
    def load_data(self):
        """Load and preprocess sales data"""
        self.df = pd.read_excel(self.data_path)
        self.df['month_period'] = pd.to_datetime(self.df['month_period'])
        self.df = self.df.sort_values('month_period')
        
    def filter_data(self, geography: Optional[List[str]] = None, 
                   material_groups: Optional[List[str]] = None,
                   historical_months: int = 12):
        """Filter data based on UI selections"""
        filtered_df = self.df.copy()
        
        if geography and "Global Overview" not in geography:
            # Map UI regions to actual sales_region values
            region_mapping = {
                "North America (NA)": "North America",
                "EMEA": "EMEA"
            }
            mapped_geography = [region_mapping.get(g, g) for g in geography if g in region_mapping]
            if mapped_geography:
                filtered_df = filtered_df[filtered_df['sales_region'].isin(mapped_geography)]
                
        if material_groups and material_groups != ["All Groups"]:
            filtered_df = filtered_df[filtered_df['group_name'].isin(material_groups)]
            
        # Filter by planable products only
        filtered_df = filtered_df[filtered_df['is_plannable'] == True]
        
        # Aggregate sales by month
        monthly_sales = filtered_df.groupby('month_period')['sales_qty'].sum().reset_index()
        
        # Take last N months for historical baseline
        if len(monthly_sales) > historical_months:
            monthly_sales = monthly_sales.tail(historical_months)
            
        return monthly_sales
    
    def prepare_time_series(self, monthly_sales):
        """Prepare time series data for forecasting"""
        if len(monthly_sales) < 6:
            raise HTTPException(status_code=400, detail="Insufficient historical data (minimum 6 months required)")
            
        dates = monthly_sales['month_period']
        values = monthly_sales['sales_qty'].values
        
        return dates, values

# ========== Model Implementations ==========
class SeasonalAIModel:
    """Machine learning model for high-volatility seasonal trends"""
    
    @staticmethod
    def forecast(historical_values, horizon=12, seasonal_periods=12):
        """Generate forecast using Holt-Winters exponential smoothing with seasonality"""
        try:
            # Fit Holt-Winters model with additive seasonality
            model = ExponentialSmoothing(
                historical_values,
                seasonal_periods=min(seasonal_periods, len(historical_values) // 2),
                trend='add',
                seasonal='add',
                initialization_method='estimated'
            )
            fitted_model = model.fit()
            
            # Generate forecast
            forecast = fitted_model.forecast(horizon)
            
            # Calculate confidence intervals (95%)
            residuals = fitted_model.resid
            std_residuals = np.std(residuals) if len(residuals) > 0 else np.std(historical_values) * 0.1
            margin = 1.96 * std_residuals
            
            lower_bound = forecast - margin
            upper_bound = forecast + margin
            
            # Calculate metrics
            mape = SeasonalAIModel.calculate_mape(historical_values, fitted_model.fittedvalues)
            rmse = np.sqrt(np.mean((historical_values - fitted_model.fittedvalues) ** 2))
            
            return {
                'forecast': forecast.clip(min=0).tolist(),
                'lower_bound': lower_bound.clip(min=0).tolist(),
                'upper_bound': upper_bound.tolist(),
                'mape': mape,
                'rmse': rmse
            }
        except Exception as e:
            # Fallback to simple seasonal decomposition
            return SeasonalAIModel.seasonal_decomposition_forecast(historical_values, horizon)
    
    @staticmethod
    def seasonal_decomposition_forecast(historical_values, horizon):
        """Fallback method using seasonal decomposition"""
        n = len(historical_values)
        seasonal_period = min(12, n // 2 if n // 2 > 0 else n)
        
        # Decompose seasonality
        if n >= 2 * seasonal_period:
            decomposition = seasonal_decompose(historical_values, model='additive', period=seasonal_period)
            seasonal_pattern = decomposition.seasonal[-seasonal_period:]
        else:
            # Simple seasonal indices
            seasonal_pattern = np.tile(historical_values[:seasonal_period], 
                                      int(np.ceil(horizon / seasonal_period)))[:horizon]
        
        # Trend component (linear regression)
        x = np.arange(len(historical_values)).reshape(-1, 1)
        reg = LinearRegression()
        reg.fit(x, historical_values)
        trend = reg.predict(x)
        trend_slope = reg.coef_[0]
        
        # Extend trend
        future_x = np.arange(len(historical_values), len(historical_values) + horizon).reshape(-1, 1)
        future_trend = reg.predict(future_x)
        
        # Repeat seasonal pattern
        extended_seasonal = np.tile(seasonal_pattern, int(np.ceil(horizon / len(seasonal_pattern))))[:horizon]
        
        forecast = future_trend + extended_seasonal
        forecast = np.maximum(forecast, 0)  # No negative sales
        
        return {
            'forecast': forecast.tolist(),
            'lower_bound': (forecast * 0.8).tolist(),
            'upper_bound': (forecast * 1.2).tolist(),
            'mape': 15.0,  # Estimated
            'rmse': np.std(historical_values) * 0.15
        }
    
    @staticmethod
    def calculate_mape(actual, predicted):
        """Calculate Mean Absolute Percentage Error"""
        actual = np.array(actual)
        predicted = np.array(predicted[:len(actual)])
        non_zero_mask = actual != 0
        if np.sum(non_zero_mask) == 0:
            return 100.0
        return np.mean(np.abs((actual[non_zero_mask] - predicted[non_zero_mask]) / actual[non_zero_mask])) * 100

class LinearRegressionModel:
    """Traditional statistical approach for stable product lines"""
    
    @staticmethod
    def forecast(historical_values, horizon=12):
        n = len(historical_values)
        X = np.arange(n).reshape(-1, 1)
        y = historical_values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate future time steps
        future_X = np.arange(n, n + horizon).reshape(-1, 1)
        forecast = model.predict(future_X)
        forecast = np.maximum(forecast, 0)
        
        # Calculate prediction intervals
        residuals = y - model.predict(X)
        std_residuals = np.std(residuals)
        margin = 1.96 * std_residuals
        
        # Calculate metrics
        mape = SeasonalAIModel.calculate_mape(y, model.predict(X))
        rmse = np.sqrt(np.mean(residuals ** 2))
        
        return {
            'forecast': forecast.tolist(),
            'lower_bound': (forecast - margin).clip(min=0).tolist(),
            'upper_bound': (forecast + margin).tolist(),
            'mape': mape,
            'rmse': rmse
        }

class MovingAverageModel:
    """Simple smoothing technique for short-term operational planning"""
    
    @staticmethod
    def forecast(historical_values, horizon=12, window=3):
        n = len(historical_values)
        
        # Calculate moving average
        if n >= window:
            ma = np.convolve(historical_values, np.ones(window)/window, mode='valid')
            last_ma = ma[-1] if len(ma) > 0 else np.mean(historical_values)
        else:
            last_ma = np.mean(historical_values)
        
        # Simple forecast: extend last moving average
        forecast = np.full(horizon, last_ma)
        
        # Add slight dampening for longer horizons
        dampening_factor = np.exp(-np.arange(horizon) / (horizon * 2))
        forecast = forecast * dampening_factor
        
        # Calculate prediction intervals based on historical volatility
        volatility = np.std(historical_values)
        margin = 1.96 * volatility * np.sqrt(np.arange(1, horizon + 1) / horizon)
        
        # Calculate metrics
        if n >= window + 1:
            predictions = []
            for i in range(window, n):
                pred = np.mean(historical_values[i-window:i])
                predictions.append(pred)
            predictions = np.array(predictions)
            actuals = historical_values[window:]
            mape = SeasonalAIModel.calculate_mape(actuals, predictions)
            rmse = np.sqrt(np.mean((actuals - predictions) ** 2))
        else:
            mape = 20.0
            rmse = np.std(historical_values) * 0.2
        
        return {
            'forecast': forecast.tolist(),
            'lower_bound': (forecast - margin).clip(min=0).tolist(),
            'upper_bound': (forecast + margin).tolist(),
            'mape': mape,
            'rmse': rmse
        }

# ========== FastAPI Endpoints ==========
engine = ForecastingEngine()

@app.get("/")
async def root():
    return {"message": "AI Forecasting Service", "status": "operational"}

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """Generate forecast based on selected parameters"""
    try:
        # Filter data based on UI selections
        monthly_sales = engine.filter_data(
            geography=request.geography,
            material_groups=request.material_groups,
            historical_months=request.historical_baseline
        )
        
        dates, values = engine.prepare_time_series(monthly_sales)
        
        # Select model based on algorithm
        if request.algorithm == "Seasonal AI":
            result = SeasonalAIModel.forecast(values, request.horizon)
        elif request.algorithm == "Linear Reg.":
            result = LinearRegressionModel.forecast(values, request.horizon)
        elif request.algorithm == "Moving Avg.":
            result = MovingAverageModel.forecast(values, request.horizon)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {request.algorithm}")
        
        # Generate forecast period labels
        last_date = dates.iloc[-1] if hasattr(dates, 'iloc') else dates[-1]
        forecast_periods = []
        for i in range(1, request.horizon + 1):
            next_month = last_date + timedelta(days=30 * i)
            forecast_periods.append(next_month.strftime("%Y-%m"))
        
        return ForecastResponse(
            algorithm=request.algorithm,
            forecast_periods=forecast_periods,
            forecast_values=result['forecast'],
            confidence_intervals={
                "lower": result['lower_bound'],
                "upper": result['upper_bound']
            },
            metrics={
                "mape": round(result['mape'], 2),
                "rmse": round(result['rmse'], 2),
                "mean_forecast": round(np.mean(result['forecast']), 2),
                "total_forecast": round(sum(result['forecast']), 2)
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast/batch")
async def batch_forecast(request: BatchForecastRequest):
    """Generate multiple forecasts for different scenarios"""
    results = []
    for req in request.requests:
        result = await generate_forecast(req)
        results.append(result)
    return {"batch_results": results}

@app.post("/forecast/compare")
async def compare_models(
    geography: Optional[List[str]] = Form(None),
    material_groups: Optional[List[str]] = Form(None),
    horizon: int = Form(12)
):
    """Compare all three forecasting models"""
    monthly_sales = engine.filter_data(geography, material_groups)
    dates, values = engine.prepare_time_series(monthly_sales)
    
    models = {
        "Seasonal AI": SeasonalAIModel.forecast(values, horizon),
        "Linear Reg.": LinearRegressionModel.forecast(values, horizon),
        "Moving Avg.": MovingAverageModel.forecast(values, horizon)
    }
    
    comparison = {}
    for model_name, result in models.items():
        comparison[model_name] = {
            "forecast": result['forecast'],
            "metrics": {
                "mape": round(result['mape'], 2),
                "rmse": round(result['rmse'], 2)
            }
        }
    
    return {
        "historical_data": values.tolist(),
        "historical_dates": [d.strftime("%Y-%m") for d in dates],
        "model_comparison": comparison
    }

@app.get("/metadata")
async def get_metadata():
    """Get available filters for UI dropdowns"""
    engine.load_data()  # Reload to ensure fresh data
    
    # Get unique values for filters
    geographies = ["Global Overview"] + sorted(engine.df['sales_region'].unique().tolist())
    material_groups = sorted(engine.df['group_name'].unique().tolist())
    algorithms = ["Seasonal AI", "Linear Reg.", "Moving Avg."]
    
    # Add friendly names
    geography_options = [
        {"value": "Global Overview", "label": "Global Overview"},
        {"value": "North America (NA)", "label": "North America (NA)"},
        {"value": "EMEA", "label": "EMEA"}
    ]
    
    return {
        "geographies": geography_options,
        "material_groups": [{"value": g, "label": g} for g in material_groups],
        "algorithms": [{"value": a, "label": a} for a in algorithms],
        "forecast_horizons": [3, 6, 12, 18, 24],
        "generation_frequencies": ["Daily", "Weekly", "Monthly", "Quarterly"],
        "historical_baselines": [6, 12, 18, 24]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "data_loaded": engine.df is not None}

# ========== Run with: uvicorn forecast_service:app --reload --host 0.0.0.0 --port 8000 ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("forecast_service:app", host="0.0.0.0", port=8015, reload=True)