# complete_forecasting_model_fixed.py
"""
Complete Forecasting Model that loads and uses trained ML models
Integrates with models saved by ml_model_trainer_updated.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pickle
import json
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Path to saved models directory
SAVED_MODELS_DIR = Path("trained_models")
SAVED_MODELS_DIR.mkdir(exist_ok=True)

class ModelLoader:
    """Load and manage saved ML models"""
    
    @staticmethod
    def load_saved_model(model_name):
        """Load a saved model from trained_models directory"""
        model_path = SAVED_MODELS_DIR / f"{model_name}.pkl"
        
        if not model_path.exists():
            print(f"⚠️ Model not found: {model_path}")
            return None
        
        try:
            with open(model_path, 'rb') as f:
                model_package = pickle.load(f)
            
            print(f"✅ Loaded model: {model_name}")
            print(f"   Algorithm: {model_package['metadata']['algorithm']}")
            print(f"   Created: {model_package['metadata']['created_at']}")
            print(f"   MAPE: {model_package['metadata']['performance_metrics'].get('mape', 'N/A')}%")
            
            return model_package
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None
    
    @staticmethod
    def list_available_models():
        """List all saved models"""
        models = []
        for model_path in SAVED_MODELS_DIR.glob("*.pkl"):
            try:
                with open(model_path, 'rb') as f:
                    model_package = pickle.load(f)
                models.append({
                    'name': model_path.stem,
                    'algorithm': model_package['metadata']['algorithm'],
                    'created_at': model_package['metadata']['created_at'],
                    'mape': model_package['metadata']['performance_metrics'].get('mape', 'N/A'),
                    'geography': model_package['metadata'].get('geography', 'N/A'),
                    'material_groups': model_package['metadata'].get('material_groups', [])
                })
            except:
                models.append({'name': model_path.stem, 'error': 'Corrupted file'})
        return models

class SalesDataProcessor:
    """Process and prepare sales data for forecasting"""
    
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load sales data from Excel"""
        try:
            if os.path.exists(self.data_path):
                self.df = pd.read_excel(self.data_path)
                self.df['month_period'] = pd.to_datetime(self.df['month_period'])
                self.df = self.df.sort_values('month_period')
                print(f"✅ Loaded {len(self.df)} records from {self.data_path}")
                print(f"📅 Date range: {self.df['month_period'].min()} to {self.df['month_period'].max()}")
            else:
                print(f"⚠️ Data file not found: {self.data_path}")
                self.create_sample_data()
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample data for demonstration"""
        print("📝 Creating sample data...")
        dates = pd.date_range(start='2024-01-01', end='2025-12-01', freq='MS')
        np.random.seed(42)
        
        data = []
        for date in dates:
            for group in ['Electronics', 'Toys', 'Books', 'Furniture', 'Clothing']:
                for region in ['North America', 'EMEA', 'APAC', 'LATAM']:
                    base_sales = 5000 * (1 + 0.1 * np.sin(2 * np.pi * date.month / 12))
                    sales = int(base_sales * np.random.uniform(0.8, 1.2))
                    data.append({
                        'group_name': group,
                        'sales_region': region,
                        'sales_qty': sales,
                        'month_period': date,
                        'is_plannable': np.random.choice([True, False], p=[0.7, 0.3])
                    })
        
        self.df = pd.DataFrame(data)
        print(f"✅ Created {len(self.df)} sample records")
        
    def filter_data(self, geography=None, material_groups=None, 
                    historical_months=12, include_planable=True):
        """Filter data based on UI selections"""
        filtered_df = self.df.copy()
        
        # Filter by geography
        if geography and geography != "Global Overview":
            region_map = {
                "North America (NA)": "North America",
                "EMEA": "EMEA"
            }
            region = region_map.get(geography, geography)
            filtered_df = filtered_df[filtered_df['sales_region'] == region]
            print(f"   Filtered by region '{region}': {len(filtered_df)} records")
        
        # Filter by material groups
        if material_groups and len(material_groups) > 0:
            filtered_df = filtered_df[filtered_df['group_name'].isin(material_groups)]
            print(f"   Filtered by groups {material_groups}: {len(filtered_df)} records")
        
        # Filter planable products only
        if include_planable and 'is_plannable' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['is_plannable'] == True]
            print(f"   Filtered by planable: {len(filtered_df)} records")
        
        if len(filtered_df) == 0:
            print("   ⚠️ No data found for selected filters!")
            return pd.DataFrame()
        
        # Aggregate by month
        monthly_sales = filtered_df.groupby('month_period')['sales_qty'].sum().reset_index()
        
        # Take last N months for historical baseline
        if len(monthly_sales) > historical_months:
            monthly_sales = monthly_sales.tail(historical_months)
        
        return monthly_sales

class SeasonalAIPredictor:
    """Use trained Seasonal AI model for predictions"""
    
    @staticmethod
    def predict(model_package, horizon=12):
        """Generate forecast using saved Seasonal AI model"""
        print("\n🤖 Using Seasonal AI Model for forecasting...")
        
        model = model_package['model']
        metadata = model_package['metadata']
        
        try:
            # Check model type
            if isinstance(model, dict):
                # Fallback model from training
                if model.get('type') == 'seasonal_ai_fallback':
                    trend_coeff = model.get('trend_coeff', [0, 0])
                    seasonal_pattern = model.get('seasonal_pattern', [])
                    seasonal_period = model.get('seasonal_period', 12)
                    
                    n = metadata['training_data']['data_points']
                    future_x = np.arange(n, n + horizon)
                    future_trend = np.polyval(trend_coeff, future_x)
                    
                    if seasonal_pattern:
                        extended_seasonal = np.tile(seasonal_pattern, 
                                                   int(np.ceil(horizon / seasonal_period)))[:horizon]
                        forecast = future_trend + extended_seasonal
                    else:
                        forecast = future_trend
                else:
                    # Simple smoothing model
                    forecast = [metadata['training_data']['avg_monthly_sales']] * horizon
            else:
                # Holt-Winters model
                forecast = model.forecast(horizon)
            
            forecast = np.maximum(forecast, 0)
            
            # Calculate confidence intervals
            std_dev = metadata['training_data']['std_deviation']
            margin = 1.96 * std_dev
            
            print(f"   ✅ Forecast generated successfully")
            print(f"   📊 Total Forecast: {sum(forecast):,.0f} units")
            print(f"   📊 Avg Monthly: {np.mean(forecast):,.0f} units")
            
            return {
                'forecast': forecast.tolist(),
                'lower_bound': (forecast - margin).clip(min=0).tolist(),
                'upper_bound': (forecast + margin).tolist(),
                'metrics': metadata['performance_metrics']
            }
            
        except Exception as e:
            print(f"   ❌ Prediction error: {e}")
            return None

class LinearRegressionPredictor:
    """Use trained Linear Regression model for predictions"""
    
    @staticmethod
    def predict(model_package, horizon=12):
        """Generate forecast using saved Linear Regression model"""
        print("\n📈 Using Linear Regression Model for forecasting...")
        
        model = model_package['model']
        metadata = model_package['metadata']
        
        try:
            n = metadata['training_data']['data_points']
            future_X = np.arange(n, n + horizon).reshape(-1, 1)
            forecast = model.predict(future_X)
            forecast = np.maximum(forecast, 0)
            
            # Calculate confidence intervals
            std_dev = metadata['training_data']['std_deviation']
            margin = 1.96 * std_dev
            
            print(f"   ✅ Forecast generated successfully")
            print(f"   📊 Total Forecast: {sum(forecast):,.0f} units")
            print(f"   📊 Avg Monthly: {np.mean(forecast):,.0f} units")
            print(f"   📊 Trend: {metadata['performance_metrics'].get('slope', 0):.2f} units/month")
            
            return {
                'forecast': forecast.tolist(),
                'lower_bound': (forecast - margin).clip(min=0).tolist(),
                'upper_bound': (forecast + margin).tolist(),
                'metrics': metadata['performance_metrics']
            }
            
        except Exception as e:
            print(f"   ❌ Prediction error: {e}")
            return None

class MovingAveragePredictor:
    """Use trained Moving Average model for predictions"""
    
    @staticmethod
    def predict(model_package, horizon=12):
        """Generate forecast using saved Moving Average model"""
        print("\n📊 Using Moving Average Model for forecasting...")
        
        model = model_package['model']
        metadata = model_package['metadata']
        
        try:
            if isinstance(model, dict):
                last_ma = model.get('last_ma', metadata['training_data']['avg_monthly_sales'])
                window = model.get('window', 3)
            else:
                last_ma = metadata['training_data']['avg_monthly_sales']
                window = 3
            
            # Generate forecast with dampening
            forecast = np.full(horizon, last_ma)
            dampening = np.exp(-np.arange(horizon) / (horizon * 1.5))
            forecast = forecast * dampening
            
            # Calculate confidence intervals
            std_dev = metadata['training_data']['std_deviation']
            margins = 1.96 * std_dev * np.sqrt(np.arange(1, horizon + 1) / horizon)
            
            print(f"   ✅ Forecast generated successfully")
            print(f"   📊 Total Forecast: {sum(forecast):,.0f} units")
            print(f"   📊 Avg Monthly: {np.mean(forecast):,.0f} units")
            print(f"   📊 Window size: {window} months")
            
            return {
                'forecast': forecast.tolist(),
                'lower_bound': (forecast - margins).clip(min=0).tolist(),
                'upper_bound': (forecast + margins).tolist(),
                'metrics': metadata['performance_metrics']
            }
            
        except Exception as e:
            print(f"   ❌ Prediction error: {e}")
            return None

class SimpleForecaster:
    """Fallback forecaster when no saved model is available"""
    
    @staticmethod
    def forecast(historical_values, horizon=12, algorithm='Seasonal AI'):
        """Generate simple forecast based on historical data"""
        print(f"\n📊 Using Simple {algorithm} Forecast (Fallback)...")
        
        n = len(historical_values)
        
        if n == 0:
            forecast = [1000 * (0.95 ** i) for i in range(horizon)]
        elif n == 1:
            base = historical_values[0]
            forecast = [base * (0.97 ** i) for i in range(horizon)]
        elif algorithm == 'Seasonal AI':
            # Use last 3 months average with slight trend
            window = min(3, n)
            base = np.mean(historical_values[-window:])
            trend = (historical_values[-1] - historical_values[0]) / n if n > 1 else 0
            forecast = [base + trend * (i + 1) * 0.5 for i in range(horizon)]
        elif algorithm == 'Linear Reg.':
            # Linear regression on time
            x = np.arange(n)
            coeff = np.polyfit(x, historical_values, 1)
            future_x = np.arange(n, n + horizon)
            forecast = np.polyval(coeff, future_x)
        else:  # Moving Avg.
            window = min(3, n)
            base = np.mean(historical_values[-window:]) if n >= window else np.mean(historical_values)
            forecast = [base * (0.98 ** i) for i in range(horizon)]
        
        forecast = np.maximum(forecast, 0)
        
        # Calculate confidence intervals
        std_val = np.std(historical_values) if n > 1 else (historical_values[0] * 0.1 if n > 0 else 100)
        margins = 1.96 * std_val * np.sqrt(np.arange(1, horizon + 1) / horizon)
        
        metrics = {
            'mape': 15.0,
            'rmse': float(std_val),
            'model_type': 'simple_fallback',
            'warning': 'Using fallback forecast - no saved model found'
        }
        
        return {
            'forecast': forecast.tolist(),
            'lower_bound': (forecast - margins).clip(min=0).tolist(),
            'upper_bound': (forecast + margins).tolist(),
            'metrics': metrics
        }

class ForecastingOrchestrator:
    """Main orchestrator for forecasting using saved ML models"""
    
    def __init__(self, data_path):
        self.data_processor = SalesDataProcessor(data_path)
        self.model_loader = ModelLoader()
        self.predictors = {
            'Seasonal AI': SeasonalAIPredictor,
            'Linear Reg.': LinearRegressionPredictor,
            'Moving Avg.': MovingAveragePredictor
        }
    
    def find_matching_model(self, geography, material_groups, algorithm):
        """Find a saved model that matches the configuration"""
        available_models = self.model_loader.list_available_models()
        
        for model in available_models:
            # Check if algorithm matches
            if model['algorithm'] != algorithm:
                continue
            
            # Check if geography matches (if specified in model)
            model_geo = model.get('geography')
            if model_geo and model_geo != 'Global Overview':
                if geography != model_geo:
                    continue
            
            # Check if material groups match (if specified in model)
            model_groups = model.get('material_groups', [])
            if model_groups and material_groups:
                # Check if there's overlap
                if not set(model_groups).intersection(set(material_groups)):
                    continue
            
            # Found a matching model
            print(f"\n🔍 Found matching model: {model['name']}")
            return model['name']
        
        return None
    
    def forecast(self, geography=None, material_groups=None, 
                 historical_baseline=12, horizon=12, algorithm='Seasonal AI',
                 use_saved_model=True, model_name=None):
        """Generate forecast using saved models or fallback"""
        
        print("\n" + "="*70)
        print("📊 FORECASTING CONFIGURATION")
        print("="*70)
        print(f"🌍 Geography: {geography if geography else 'Global Overview'}")
        print(f"📦 Material Groups: {material_groups if material_groups else 'All Groups'}")
        print(f"📈 Historical Baseline: {historical_baseline} months")
        print(f"🎯 Forecast Horizon: {horizon} months")
        print(f"🤖 Algorithm: {algorithm}")
        print(f"💾 Use Saved Model: {use_saved_model}")
        print("="*70)
        
        # Get historical data for reference
        monthly_sales = self.data_processor.filter_data(
            geography=geography,
            material_groups=material_groups,
            historical_months=historical_baseline
        )
        
        historical_values = monthly_sales['sales_qty'].values if len(monthly_sales) > 0 else np.array([])
        historical_dates = monthly_sales['month_period'] if len(monthly_sales) > 0 else pd.Series()
        
        if len(historical_values) > 0:
            print(f"\n📊 Historical Data Summary:")
            print(f"   Period: {historical_dates.iloc[0].strftime('%Y-%m')} to {historical_dates.iloc[-1].strftime('%Y-%m')}")
            print(f"   Months: {len(historical_values)}")
            print(f"   Total Sales: {sum(historical_values):,.0f}")
            print(f"   Avg Monthly: {np.mean(historical_values):,.0f}")
        
        # Try to use saved model if requested
        model_used = None
        result = None
        
        if use_saved_model:
            # Find model name if not provided
            if not model_name:
                model_name = self.find_matching_model(geography, material_groups, algorithm)
            
            if model_name:
                # Load and use saved model
                model_package = self.model_loader.load_saved_model(model_name)
                if model_package:
                    predictor = self.predictors.get(algorithm)
                    if predictor:
                        result = predictor.predict(model_package, horizon)
                        model_used = model_name
        
        # Use fallback if no saved model or prediction failed
        if result is None:
            if len(historical_values) >= 2:
                result = SimpleForecaster.forecast(historical_values, horizon, algorithm)
                model_used = "fallback_simple_forecast"
            else:
                # Generate forecast periods without historical data
                last_date = datetime.now()
                forecast_periods = []
                for i in range(1, horizon + 1):
                    year = last_date.year + (last_date.month + i - 1) // 12
                    month = (last_date.month + i - 1) % 12 + 1
                    forecast_periods.append(f"{year}-{month:02d}")
                
                forecast_values = [1000 * (0.95 ** i) for i in range(horizon)]
                
                return {
                    'configuration': {
                        'geography': geography if geography else 'Global Overview',
                        'material_groups': material_groups if material_groups else ['All Groups'],
                        'historical_baseline': historical_baseline,
                        'horizon': horizon,
                        'algorithm': algorithm
                    },
                    'historical_data': {
                        'periods': [],
                        'values': [],
                        'summary': {
                            'total': 0,
                            'average': 0,
                            'std': 0,
                            'warning': 'No historical data available'
                        }
                    },
                    'forecast': {
                        'periods': forecast_periods,
                        'values': forecast_values,
                        'lower_bound': [v * 0.8 for v in forecast_values],
                        'upper_bound': [v * 1.2 for v in forecast_values]
                    },
                    'metrics': {
                        'mape': 15.0,
                        'warning': 'Sample forecast - no historical data'
                    },
                    'model_used': 'no_data_fallback'
                }
        
        # Generate forecast periods
        if len(historical_dates) > 0:
            last_date = historical_dates.iloc[-1]
            forecast_periods = []
            for i in range(1, horizon + 1):
                year = last_date.year + (last_date.month + i - 1) // 12
                month = (last_date.month + i - 1) % 12 + 1
                forecast_periods.append(f"{year}-{month:02d}")
        else:
            last_date = datetime.now()
            forecast_periods = []
            for i in range(1, horizon + 1):
                year = last_date.year + (last_date.month + i - 1) // 12
                month = (last_date.month + i - 1) % 12 + 1
                forecast_periods.append(f"{year}-{month:02d}")
        
        return {
            'configuration': {
                'geography': geography if geography else 'Global Overview',
                'material_groups': material_groups if material_groups else ['All Groups'],
                'historical_baseline': historical_baseline,
                'horizon': horizon,
                'algorithm': algorithm
            },
            'historical_data': {
                'periods': [d.strftime('%Y-%m') for d in historical_dates] if len(historical_dates) > 0 else [],
                'values': historical_values.tolist() if len(historical_values) > 0 else [],
                'summary': {
                    'total': int(sum(historical_values)) if len(historical_values) > 0 else 0,
                    'average': float(np.mean(historical_values)) if len(historical_values) > 0 else 0,
                    'std': float(np.std(historical_values)) if len(historical_values) > 0 else 0
                }
            },
            'forecast': {
                'periods': forecast_periods,
                'values': result['forecast'],
                'lower_bound': result['lower_bound'],
                'upper_bound': result['upper_bound']
            },
            'metrics': result['metrics'],
            'model_used': model_used if model_used else 'no_model_available'
        }

# ============================================
# MAIN EXECUTION
# ============================================

if __name__ == "__main__":
    # Update this path to your actual data file
    DATA_PATH = "/Users/home/Desktop/VScode_project/Aitha/Aitha/backend/app/upload/demo/sale_data.xlsx"
    
    # Initialize the forecasting orchestrator
    orchestrator = ForecastingOrchestrator(DATA_PATH)
    
    # List available saved models
    print("\n" + "="*70)
    print("📦 AVAILABLE SAVED MODELS")
    print("="*70)
    models = orchestrator.model_loader.list_available_models()
    
    if models:
        for model in models:
            print(f"\n📁 {model['name']}")
            print(f"   Algorithm: {model['algorithm']}")
            print(f"   Created: {model['created_at']}")
            print(f"   MAPE: {model['mape']}%")
            print(f"   Geography: {model.get('geography', 'N/A')}")
            print(f"   Material Groups: {model.get('material_groups', [])}")
    else:
        print("\n⚠️ No saved models found in 'trained_models' directory")
        print("   Please run ml_model_trainer_updated.py first to train and save models")
    
    # Example 1: Use saved model for forecasting
    if models:
        print("\n" + "="*70)
        print("🎯 EXAMPLE 1: Using Saved Model for Forecasting")
        print("="*70)
        
        # Use the first available model
        first_model = models[0]
        
        result = orchestrator.forecast(
            geography=first_model.get('geography', 'Global Overview'),
            material_groups=first_model.get('material_groups', None),
            historical_baseline=12,
            horizon=12,
            algorithm=first_model['algorithm'],
            use_saved_model=True,
            model_name=first_model['name']
        )
        
        print(f"\n📈 FORECAST RESULTS:")
        print(f"   Model Used: {result['model_used']}")
        print(f"   Algorithm: {result['configuration']['algorithm']}")
        print(f"   Total Forecast: {sum(result['forecast']['values']):,.0f} units")
        print(f"   Average Monthly: {np.mean(result['forecast']['values']):,.0f} units")
        
        if 'mape' in result['metrics']:
            print(f"   MAPE: {result['metrics']['mape']}%")
        
        print(f"\n📅 First 6 months forecast:")
        for i in range(min(6, len(result['forecast']['periods']))):
            print(f"   {result['forecast']['periods'][i]}: {result['forecast']['values'][i]:,.0f} units "
                  f"(CI: {result['forecast']['lower_bound'][i]:,.0f} - {result['forecast']['upper_bound'][i]:,.0f})")
    
    # Example 2: Compare all models using saved models
    print("\n" + "="*70)
    print("🎯 EXAMPLE 2: Compare All Available Models")
    print("="*70)
    
    for model in models:
        result = orchestrator.forecast(
            geography=model.get('geography', 'Global Overview'),
            material_groups=model.get('material_groups', None),
            historical_baseline=12,
            horizon=12,
            algorithm=model['algorithm'],
            use_saved_model=True,
            model_name=model['name']
        )
        
        total_forecast = sum(result['forecast']['values'])
        mape = result['metrics'].get('mape', 'N/A')
        print(f"\n   {model['name']}:")
        print(f"      Total Forecast: {total_forecast:,.0f} units")
        print(f"      MAPE: {mape}%")
    
    # Example 3: Fallback forecast (no saved model matching)
    print("\n" + "="*70)
    print("🎯 EXAMPLE 3: Fallback Forecast (No Matching Model)")
    print("="*70)
    
    result = orchestrator.forecast(
        geography="North America (NA)",
        material_groups=["Electronics", "Toys"],
        historical_baseline=12,
        horizon=12,
        algorithm="Seasonal AI",
        use_saved_model=False  # Force fallback
    )
    
    print(f"\n📈 FORECAST RESULTS:")
    print(f"   Model Used: {result['model_used']}")
    print(f"   Total Forecast: {sum(result['forecast']['values']):,.0f} units")
    
    print("\n" + "="*70)
    print("✅ FORECASTING COMPLETE")
    print("="*70)