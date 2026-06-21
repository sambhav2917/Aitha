// ForecastDashboard.jsx - React component for UI integration
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForecastDashboard = () => {
    const [config, setConfig] = useState(null);
    const [forecastParams, setForecastParams] = useState({
        horizon: 12,
        frequency: 'Monthly',
        historicalBaseline: 12,
        geography: ['Global Overview'],
        materialGroups: [],
        algorithm: 'Seasonal AI'
    });
    const [forecastResult, setForecastResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        const response = await axios.get('/api/forecast/config');
        setConfig(response.data);
    };

    const generateForecast = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/forecast/generate', forecastParams);
            setForecastResult(response.data);
        } catch (error) {
            console.error('Forecast failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forecast-dashboard">
            <div className="controls">
                <div className="control-group">
                    <label>Forecast Horizon</label>
                    <select 
                        value={forecastParams.horizon}
                        onChange={(e) => setForecastParams({
                            ...forecastParams,
                            horizon: parseInt(e.target.value)
                        })}
                    >
                        {config?.forecast_horizons?.map(h => (
                            <option key={h} value={h}>{h} Months</option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Algorithm</label>
                    <select
                        value={forecastParams.algorithm}
                        onChange={(e) => setForecastParams({
                            ...forecastParams,
                            algorithm: e.target.value
                        })}
                    >
                        {config?.algorithms?.map(algo => (
                            <option key={algo.value} value={algo.value}>
                                {algo.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Geography</label>
                    <select
                        multiple
                        value={forecastParams.geography}
                        onChange={(e) => setForecastParams({
                            ...forecastParams,
                            geography: Array.from(e.target.selectedOptions, opt => opt.value)
                        })}
                    >
                        {config?.geographies?.map(geo => (
                            <option key={geo.value} value={geo.value}>
                                {geo.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label>Material Groups</label>
                    <select
                        multiple
                        value={forecastParams.materialGroups}
                        onChange={(e) => setForecastParams({
                            ...forecastParams,
                            materialGroups: Array.from(e.target.selectedOptions, opt => opt.value)
                        })}
                    >
                        {config?.material_groups?.map(group => (
                            <option key={group.value} value={group.value}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={generateForecast} disabled={loading}>
                    {loading ? 'Generating...' : 'Execute Generation'}
                </button>
            </div>

            {forecastResult && (
                <div className="results">
                    <h3>Forecast Results ({forecastResult.algorithm})</h3>
                    <div className="metrics">
                        <div>MAPE: {forecastResult.metrics.mape}%</div>
                        <div>RMSE: {forecastResult.metrics.rmse}</div>
                        <div>Total Forecast: {forecastResult.metrics.total_forecast.toLocaleString()}</div>
                    </div>
                    <div className="chart">
                        {/* Add your chart library here (Chart.js, Recharts, etc.) */}
                        <pre>{JSON.stringify(forecastResult.forecast_values, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForecastDashboard;