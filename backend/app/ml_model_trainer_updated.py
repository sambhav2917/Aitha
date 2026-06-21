# ml_model_trainer_fixed.py
"""
Complete ML Model Training for Sales Forecasting - Fixed Version
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.seasonal import seasonal_decompose
import warnings
warnings.filterwarnings('ignore')

# Create models directory
MODELS_DIR = Path("trained_models")
MODELS_DIR.mkdir(exist_ok=True)

print("="*70)
print("🎯 ML MODEL TRAINING FOR SALES FORECASTING")
print("="*70)

# ============================================
# DATA LOADING AND PREPROCESSING
# ============================================

class SalesDataLoader:
    """Load and preprocess sales data for training"""
    
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Load sales data from Excel file"""
        try:
            if os.path.exists(self.data_path):
                self.df = pd.read_excel(self.data_path)
                print(f"✅ Loaded data from: {self.data_path}")
                print(f"📊 Data shape: {self.df.shape}")
                
                # Convert date column
                if 'month_period' in self.df.columns:
                    self.df['month_period'] = pd.to_datetime(self.df['month_period'])
                    self.df = self.df.sort_values('month_period')
                    print(f"📅 Date range: {self.df['month_period'].min()} to {self.df['month_period'].max()}")
                
                # Display unique values for filters
                print(f"\n🏷️ Unique Groups: {self.df['group_name'].unique().tolist()}")
                print(f"🌍 Unique Regions: {self.df['sales_region'].unique().tolist()}")
                print(f"✅ Planable products: {self.df['is_plannable'].sum()} out of {len(self.df)}")
                
            else:
                print(f"❌ File not found: {self.data_path}")
                raise FileNotFoundError(f"Data file not found at {self.data_path}")
                
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            raise
    
    def filter_and_aggregate(self, geography=None, material_groups=None, 
                            historical_months=24, is_plannable=True):
        """Filter and aggregate data for training"""
        filtered_df = self.df.copy()
        
        # Filter by geography
        if geography and geography != "Global Overview":
            # Map UI geography names to actual sales_region values
            region_mapping = {
                "North America (NA)": "North America",
                "North America": "North America",
                "EMEA": "EMEA",
                "LATAM": "LATAM",
                "APAC": "APAC"
            }
            mapped_geo = region_mapping.get(geography, geography)
            filtered_df = filtered_df[filtered_df['sales_region'] == mapped_geo]
            print(f"   Filtered by region: {mapped_geo} -> {len(filtered_df)} records")
        
        # Filter by material groups
        if material_groups and len(material_groups) > 0:
            filtered_df = filtered_df[filtered_df['group_name'].isin(material_groups)]
            print(f"   Filtered by groups: {material_groups} -> {len(filtered_df)} records")
        
        # Filter by planability
        if is_plannable and 'is_plannable' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['is_plannable'] == True]
            print(f"   Filtered by planable: -> {len(filtered_df)} records")
        
        if len(filtered_df) == 0:
            print("   ⚠️ No data after filtering!")
            return pd.DataFrame()
        
        # Aggregate by month
        monthly_sales = filtered_df.groupby('month_period')['sales_qty'].sum().reset_index()
        monthly_sales = monthly_sales.sort_values('month_period')
        
        # Take last N months for historical baseline
        if len(monthly_sales) > historical_months:
            monthly_sales = monthly_sales.tail(historical_months)
            print(f"   Using last {historical_months} months of data")
        
        print(f"   Final aggregated data: {len(monthly_sales)} months, total sales: {monthly_sales['sales_qty'].sum():,.0f}")
        
        return monthly_sales

# ============================================
# MODEL TRAINERS
# ============================================

class SeasonalAITrainer:
    """Train Seasonal AI model (Holt-Winters with seasonality)"""
    
    @staticmethod
    def train(historical_values, seasonal_periods=12, horizon=12):
        """Train Seasonal AI model"""
        print("\n🏋️ Training Seasonal AI Model...")
        
        try:
            n = len(historical_values)
            print(f"   Data points: {n}")
            
            if n < 3:
                print("   ⚠️ Insufficient data for Seasonal AI")
                return None
            
            # Determine appropriate seasonal period
            if n >= 24:
                seasonal_periods = 12
            elif n >= 12:
                seasonal_periods = 6
            else:
                seasonal_periods = max(2, n // 2)
            
            print(f"   Seasonal period: {seasonal_periods}")
            
            if n >= 2 * seasonal_periods:
                # Fit Holt-Winters model
                model = ExponentialSmoothing(
                    historical_values,
                    seasonal_periods=seasonal_periods,
                    trend='add',
                    seasonal='add',
                    initialization_method='estimated'
                )
                fitted_model = model.fit()
                
                # Generate forecast
                forecast = fitted_model.forecast(horizon)
                
                # Calculate metrics on training data
                train_pred = fitted_model.fittedvalues
                mape = SeasonalAITrainer.calculate_mape(historical_values, train_pred)
                rmse = np.sqrt(np.mean((historical_values - train_pred) ** 2))
                mae = np.mean(np.abs(historical_values - train_pred))
                
                # Calculate confidence intervals
                residuals = historical_values - train_pred[:len(historical_values)]
                std_residuals = np.std(residuals) if len(residuals) > 0 else np.std(historical_values) * 0.1
                margin = 1.96 * std_residuals
                
                model_info = {
                    'type': 'seasonal_ai_holtwinters',
                    'model': fitted_model,
                    'seasonal_periods': seasonal_periods
                }
                
                print(f"   ✅ Model trained successfully")
                print(f"   📊 MAPE: {mape:.2f}%")
                print(f"   📊 RMSE: {rmse:.2f}")
                print(f"   📊 MAE: {mae:.2f}")
                
            else:
                # Fallback to simple exponential smoothing
                from statsmodels.tsa.holtwinters import SimpleExpSmoothing
                model = SimpleExpSmoothing(historical_values).fit()
                forecast = model.forecast(horizon)
                train_pred = model.fittedvalues
                
                mape = SeasonalAITrainer.calculate_mape(historical_values, train_pred)
                rmse = np.sqrt(np.mean((historical_values - train_pred) ** 2))
                mae = np.mean(np.abs(historical_values - train_pred))
                
                residuals = historical_values - train_pred[:len(historical_values)]
                std_residuals = np.std(residuals) if len(residuals) > 0 else np.std(historical_values) * 0.1
                margin = 1.96 * std_residuals
                
                model_info = {
                    'type': 'seasonal_ai_simple',
                    'model': model
                }
                
                print(f"   ✅ Simple Exponential Smoothing trained")
                print(f"   📊 MAPE: {mape:.2f}%")
                print(f"   📊 RMSE: {rmse:.2f}")
            
            return {
                'model': model_info,
                'forecast': np.maximum(forecast, 0).tolist(),
                'lower_bound': np.maximum(forecast - margin, 0).tolist(),
                'upper_bound': (forecast + margin).tolist(),
                'metrics': {
                    'mape': round(mape, 2),
                    'rmse': round(rmse, 2),
                    'mae': round(mae, 2)
                }
            }
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return SeasonalAITrainer.fallback_train(historical_values, horizon)
    
    @staticmethod
    def fallback_train(historical_values, horizon):
        """Fallback training using linear trend"""
        n = len(historical_values)
        x = np.arange(n)
        z = np.polyfit(x, historical_values, 1)
        trend = np.polyval(z, x)
        
        model = {
            'type': 'seasonal_ai_fallback',
            'slope': float(z[0]),
            'intercept': float(z[1]),
            'last_value': float(historical_values[-1])
        }
        
        # Generate forecast
        future_x = np.arange(n, n + horizon)
        forecast = np.polyval(z, future_x)
        forecast = np.maximum(forecast, 0)
        
        train_pred = trend
        mape = SeasonalAITrainer.calculate_mape(historical_values, train_pred)
        rmse = np.sqrt(np.mean((historical_values - train_pred) ** 2))
        
        return {
            'model': model,
            'forecast': forecast.tolist(),
            'lower_bound': (forecast * 0.85).tolist(),
            'upper_bound': (forecast * 1.15).tolist(),
            'metrics': {
                'mape': round(mape, 2),
                'rmse': round(rmse, 2),
                'mae': None
            }
        }
    
    @staticmethod
    def calculate_mape(actual, predicted):
        """Calculate Mean Absolute Percentage Error"""
        actual = np.array(actual)
        predicted = np.array(predicted[:len(actual)])
        non_zero_mask = actual != 0
        if np.sum(non_zero_mask) == 0:
            return 100.0
        return np.mean(np.abs((actual[non_zero_mask] - predicted[non_zero_mask]) / 
                             actual[non_zero_mask])) * 100

class LinearRegressionTrainer:
    """Train Linear Regression model"""
    
    @staticmethod
    def train(historical_values, horizon=12):
        """Train Linear Regression model"""
        print("\n🏋️ Training Linear Regression Model...")
        
        try:
            n = len(historical_values)
            print(f"   Data points: {n}")
            
            if n < 2:
                print("   ⚠️ Insufficient data for Linear Regression")
                return None
            
            # Create time index feature
            X = np.arange(n).reshape(-1, 1)
            y = historical_values
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Generate forecast
            future_X = np.arange(n, n + horizon).reshape(-1, 1)
            forecast = model.predict(future_X)
            forecast = np.maximum(forecast, 0)
            
            # Calculate metrics
            train_pred = model.predict(X)
            mape = LinearRegressionTrainer.calculate_mape(y, train_pred)
            rmse = np.sqrt(np.mean((y - train_pred) ** 2))
            mae = np.mean(np.abs(y - train_pred))
            r2 = r2_score(y, train_pred) if len(y) > 1 else 0
            
            # Calculate confidence intervals
            residuals = y - train_pred
            std_residuals = np.std(residuals)
            margin = 1.96 * std_residuals
            
            print(f"   ✅ Model trained successfully")
            print(f"   📊 R² Score: {r2:.4f}")
            print(f"   📊 MAPE: {mape:.2f}%")
            print(f"   📊 RMSE: {rmse:.2f}")
            print(f"   📊 Slope: {model.coef_[0]:.2f} per month")
            
            return {
                'model': model,
                'forecast': forecast.tolist(),
                'lower_bound': (forecast - margin).clip(min=0).tolist(),
                'upper_bound': (forecast + margin).tolist(),
                'metrics': {
                    'mape': round(mape, 2),
                    'rmse': round(rmse, 2),
                    'mae': round(mae, 2),
                    'r2': round(r2, 4),
                    'slope': round(model.coef_[0], 2)
                }
            }
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return None
    
    @staticmethod
    def calculate_mape(actual, predicted):
        actual = np.array(actual)
        predicted = np.array(predicted[:len(actual)])
        non_zero_mask = actual != 0
        if np.sum(non_zero_mask) == 0:
            return 100.0
        return np.mean(np.abs((actual[non_zero_mask] - predicted[non_zero_mask]) / 
                             actual[non_zero_mask])) * 100

class MovingAverageTrainer:
    """Train Moving Average model"""
    
    @staticmethod
    def train(historical_values, horizon=12):
        """Train Moving Average model"""
        print("\n🏋️ Training Moving Average Model...")
        
        try:
            n = len(historical_values)
            print(f"   Data points: {n}")
            
            if n < 2:
                print("   ⚠️ Insufficient data for Moving Average")
                return None
            
            # Find optimal window size
            windows = [2, 3, 4, 6]
            windows = [w for w in windows if w < n]
            
            if windows:
                best_window = windows[0]
                best_mape = float('inf')
                
                for window in windows:
                    if n > window:
                        predictions = []
                        actuals = []
                        for i in range(window, n):
                            pred = np.mean(historical_values[i-window:i])
                            predictions.append(pred)
                            actuals.append(historical_values[i])
                        
                        if len(actuals) > 0:
                            mape = MovingAverageTrainer.calculate_mape(np.array(actuals), np.array(predictions))
                            if mape < best_mape:
                                best_mape = mape
                                best_window = window
                
                window = best_window
                print(f"   Optimal window size: {window}")
            else:
                window = min(2, n)
                print(f"   Using window size: {window}")
            
            # Calculate moving average
            if n >= window:
                ma = np.convolve(historical_values, np.ones(window)/window, mode='valid')
                last_ma = ma[-1] if len(ma) > 0 else np.mean(historical_values)
            else:
                last_ma = np.mean(historical_values)
            
            # Create model object
            model = {
                'type': 'moving_average',
                'window': window,
                'last_ma': float(last_ma),
                'historical_mean': float(np.mean(historical_values)),
                'historical_std': float(np.std(historical_values))
            }
            
            # Generate forecast with dampening
            forecast = np.full(horizon, last_ma)
            dampening_factor = np.exp(-np.arange(horizon) / (horizon))
            forecast = forecast * dampening_factor
            
            # Calculate confidence intervals
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
                mape = MovingAverageTrainer.calculate_mape(actuals, predictions)
                rmse = np.sqrt(np.mean((actuals - predictions) ** 2))
                mae = np.mean(np.abs(actuals - predictions))
            else:
                mape = 20.0
                rmse = float(np.std(historical_values) * 0.2)
                mae = float(np.std(historical_values) * 0.15)
            
            print(f"   ✅ Model trained successfully")
            print(f"   📊 MAPE: {mape:.2f}%")
            print(f"   📊 RMSE: {rmse:.2f}")
            
            return {
                'model': model,
                'forecast': forecast.tolist(),
                'lower_bound': (forecast - margin).clip(min=0).tolist(),
                'upper_bound': (forecast + margin).tolist(),
                'metrics': {
                    'mape': round(mape, 2),
                    'rmse': round(rmse, 2),
                    'mae': round(mae, 2) if mae else None,
                    'window': window
                }
            }
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return None
    
    @staticmethod
    def calculate_mape(actual, predicted):
        actual = np.array(actual)
        predicted = np.array(predicted[:len(actual)])
        non_zero_mask = actual != 0
        if np.sum(non_zero_mask) == 0:
            return 100.0
        return np.mean(np.abs((actual[non_zero_mask] - predicted[non_zero_mask]) / 
                             actual[non_zero_mask])) * 100

# ============================================
# MODEL SAVING UTILITIES
# ============================================

class ModelSaver:
    """Save trained models with metadata"""
    
    @staticmethod
    def save_model(model_data, model_name, config, training_data_info):
        """Save model to disk with complete metadata"""
        
        if model_data is None:
            print(f"⚠️ No model data to save for {model_name}")
            return None
        
        model_package = {
            'model': model_data['model'],
            'metadata': {
                'model_name': model_name,
                'algorithm': config.get('algorithm', model_name.split('_')[-2] if '_' in model_name else 'Unknown'),
                'created_at': datetime.now().isoformat(),
                'geography': config.get('geography'),
                'material_groups': config.get('material_groups', []),
                'historical_baseline': config.get('historical_baseline', 24),
                'horizon': config.get('horizon', 12),
                'training_data': training_data_info,
                'performance_metrics': model_data['metrics'],
                'forecast_sample': model_data['forecast'][:6]
            }
        }
        
        # Save to file
        model_path = MODELS_DIR / f"{model_name}.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model_package, f)
        
        print(f"\n💾 Model saved: {model_path}")
        print(f"   File size: {model_path.stat().st_size / 1024:.2f} KB")
        
        return str(model_path)

# ============================================
# MAIN TRAINING PIPELINE
# ============================================

def train_models_for_config(data_loader, config):
    """Train models for a specific configuration"""
    
    print("\n" + "="*70)
    print(f"📊 TRAINING MODELS: {config['name']}")
    print("="*70)
    print(f"🌍 Geography: {config.get('geography', 'Global Overview')}")
    print(f"📦 Material Groups: {config.get('material_groups', ['All'])}")
    print(f"📈 Historical Baseline: {config.get('historical_baseline', 24)} months")
    print(f"🎯 Forecast Horizon: {config.get('horizon', 12)} months")
    print("="*70)
    
    # Get filtered data
    monthly_sales = data_loader.filter_and_aggregate(
        geography=config.get('geography'),
        material_groups=config.get('material_groups'),
        historical_months=config.get('historical_baseline', 24),
        is_plannable=config.get('is_plannable', True)
    )
    
    if len(monthly_sales) < 2:
        print(f"❌ Insufficient data for training (only {len(monthly_sales)} months, need at least 2)")
        return None
    
    values = monthly_sales['sales_qty'].values
    dates = monthly_sales['month_period']
    
    training_info = {
        'start_date': dates.iloc[0].strftime("%Y-%m"),
        'end_date': dates.iloc[-1].strftime("%Y-%m"),
        'data_points': len(values),
        'total_sales': int(values.sum()),
        'avg_monthly_sales': float(values.mean()),
        'std_deviation': float(values.std()),
        'min_sales': int(values.min()),
        'max_sales': int(values.max())
    }
    
    print(f"\n📊 Training Data Summary:")
    print(f"   Period: {training_info['start_date']} to {training_info['end_date']}")
    print(f"   Data points: {training_info['data_points']}")
    print(f"   Total sales: {training_info['total_sales']:,}")
    print(f"   Avg monthly: {training_info['avg_monthly_sales']:,.0f}")
    print(f"   Min/Max: {training_info['min_sales']:,} / {training_info['max_sales']:,}")
    
    results = {}
    
    # Train Seasonal AI
    if config.get('train_seasonal_ai', True):
        result = SeasonalAITrainer.train(values, horizon=config.get('horizon', 12))
        if result:
            results['Seasonal AI'] = result
            ModelSaver.save_model(
                result, 
                f"{config['model_prefix']}_seasonal_ai",
                config,
                training_info
            )
    
    # Train Linear Regression
    if config.get('train_linear_reg', True):
        result = LinearRegressionTrainer.train(values, horizon=config.get('horizon', 12))
        if result:
            results['Linear Reg.'] = result
            ModelSaver.save_model(
                result, 
                f"{config['model_prefix']}_linear_reg",
                config,
                training_info
            )
    
    # Train Moving Average
    if config.get('train_moving_avg', True):
        result = MovingAverageTrainer.train(values, horizon=config.get('horizon', 12))
        if result:
            results['Moving Avg.'] = result
            ModelSaver.save_model(
                result, 
                f"{config['model_prefix']}_moving_avg",
                config,
                training_info
            )
    
    return results if results else None

def generate_comparison_report(all_results):
    """Generate comprehensive comparison report"""
    
    print("\n" + "="*70)
    print("📊 FINAL MODEL COMPARISON REPORT")
    print("="*70)
    
    if not all_results:
        print("No models were trained successfully!")
        return
    
    for config_name, results in all_results.items():
        print(f"\n📋 Configuration: {config_name}")
        print("-"*50)
        print(f"{'Model':<20} {'MAPE':<10} {'RMSE':<12} {'Total Forecast':<15}")
        print("-"*50)
        
        for model_name, result in results.items():
            metrics = result['metrics']
            forecast_total = sum(result['forecast'])
            print(f"{model_name:<20} {metrics.get('mape', 'N/A'):<10} "
                  f"{metrics.get('rmse', 'N/A'):<12.2f} {forecast_total:15,.0f}")
        
        # Find best model for this config
        best_model = min(results.items(), 
                        key=lambda x: x[1]['metrics'].get('mape', float('inf')))
        print(f"\n🏆 Best Model: {best_model[0]} (MAPE: {best_model[1]['metrics']['mape']}%)")

# ============================================
# MAIN EXECUTION
# ============================================

if __name__ == "__main__":
    
    # Update this path to your actual sales data file
    DATA_PATH = "/Users/home/Desktop/VScode_project/Aitha/Aitha/backend/app/upload/demo/sale_data.xlsx"
    
    # Load data
    data_loader = SalesDataLoader(DATA_PATH)
    
    # Define training configurations based on actual data availability
    CONFIGURATIONS = [
        {
            'name': 'EMEA - All Planable Products',
            'model_prefix': 'emea_all_planable',
            'geography': 'EMEA',
            'material_groups': [],  # All groups
            'historical_baseline': 12,
            'horizon': 12,
            'is_plannable': True,
            'train_seasonal_ai': True,
            'train_linear_reg': True,
            'train_moving_avg': True
        },
        {
            'name': 'North America - Electronics (Planable)',
            'model_prefix': 'na_electronics',
            'geography': 'North America (NA)',
            'material_groups': ['Electronics'],
            'historical_baseline': 12,
            'horizon': 12,
            'is_plannable': True,
            'train_seasonal_ai': True,
            'train_linear_reg': True,
            'train_moving_avg': True
        },
        {
            'name': 'LATAM - All Products',
            'model_prefix': 'latam_all',
            'geography': 'LATAM',
            'material_groups': [],
            'historical_baseline': 12,
            'horizon': 12,
            'is_plannable': False,  # Include all products
            'train_seasonal_ai': True,
            'train_linear_reg': True,
            'train_moving_avg': True
        },
        {
            'name': 'Global Overview - Electronics & Toys',
            'model_prefix': 'global_electronics_toys',
            'geography': 'Global Overview',
            'material_groups': ['Electronics', 'Toys'],
            'historical_baseline': 12,
            'horizon': 12,
            'is_plannable': True,
            'train_seasonal_ai': True,
            'train_linear_reg': True,
            'train_moving_avg': True
        }
    ]
    
    # Train models for each configuration
    all_results = {}
    
    for config in CONFIGURATIONS:
        results = train_models_for_config(data_loader, config)
        if results:
            all_results[config['name']] = results
    
    # Generate final report
    generate_comparison_report(all_results)
    
    # Summary
    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE")
    print("="*70)
    print(f"📁 Models saved in: {MODELS_DIR.absolute()}")
    
    # List saved models
    model_files = list(MODELS_DIR.glob("*.pkl"))
    if model_files:
        print(f"\n📦 Saved Models ({len(model_files)} files):")
        for model_file in model_files:
            size_kb = model_file.stat().st_size / 1024
            print(f"   • {model_file.name} ({size_kb:.2f} KB)")
    else:
        print("\n⚠️ No models were saved. Check if there's sufficient data for training.")
    
    print("\n🚀 Next Steps:")
    print("   1. Models are ready to be used with your FastAPI service")
    print("   2. Use the /forecast endpoint with use_saved_model=true")
    print("   3. Model names are available in the trained_models/ directory")
    print("="*70)