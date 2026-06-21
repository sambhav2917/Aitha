// ForecastWithModels.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForecastWithModels = () => {
    const [config, setConfig] = useState(null);
    const [savedModels, setSavedModels] = useState([]);
    const [forecastParams, setForecastParams] = useState({
        horizon: 12,
        frequency: 'Monthly',
        historicalBaseline: 12,
        geography: ['Global Overview'],
        materialGroups: [],
        algorithm: 'Seasonal AI',
        useSavedModel: false,
        modelName: ''
    });
    const [forecastResult, setForecastResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveModelDialog, setSaveModelDialog] = useState(false);
    const [newModelName, setNewModelName] = useState('');

    useEffect(() => {
        fetchConfig();
        fetchSavedModels();
    }, []);

    const fetchConfig = async () => {
        const response = await axios.get('/api/forecast/config');
        setConfig(response.data);
    };

    const fetchSavedModels = async () => {
        const response = await axios.get('/api/forecast/models');
        setSavedModels(response.data.models || []);
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

    const saveAsTemplate = async () => {
        if (!newModelName) {
            alert('Please enter a model name');
            return;
        }
        
        try {
            await axios.post('/api/forecast/save-model', {
                modelName: newModelName,
                algorithm: forecastParams.algorithm,
                geography: forecastParams.geography,
                materialGroups: forecastParams.materialGroups,
                historicalBaseline: forecastParams.historicalBaseline,
                description: `Saved template from ${new Date().toLocaleString()}`
            });
            
            setSaveModelDialog(false);
            setNewModelName('');
            fetchSavedModels(); // Refresh model list
            
            alert(`Model "${newModelName}" saved successfully!`);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save model');
        }
    };

    const loadModel = (modelName) => {
        const model = savedModels.find(m => m.model_name === modelName);
        if (model) {
            setForecastParams({
                ...forecastParams,
                useSavedModel: true,
                modelName: modelName,
                algorithm: model.algorithm,
                geography: model.geography || ['Global Overview'],
                materialGroups: model.material_groups || [],
                historicalBaseline: model.historical_baseline || 12
            });
        }
    };

    return (
        <div className="forecast-dashboard">
            <div className="controls">
                {/* Use Saved Model Toggle */}
                <div className="control-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={forecastParams.useSavedModel}
                            onChange={(e) => setForecastParams({
                                ...forecastParams,
                                useSavedModel: e.target.checked,
                                modelName: e.target.checked ? forecastParams.modelName : ''
                            })}
                        />
                        Use Saved Model
                    </label>
                </div>

                {/* Saved Models Dropdown */}
                {forecastParams.useSavedModel && (
                    <div className="control-group">
                        <label>Saved Models</label>
                        <select
                            value={forecastParams.modelName}
                            onChange={(e) => loadModel(e.target.value)}
                        >
                            <option value="">Select a model...</option>
                            {savedModels.map(model => (
                                <option key={model.model_name} value={model.model_name}>
                                    {model.model_name} ({model.algorithm})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Show configuration inputs only if not using saved model */}
                {!forecastParams.useSavedModel && (
                    <>
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
                    </>
                )}

                <div className="button-group">
                    <button onClick={generateForecast} disabled={loading}>
                        {loading ? 'Generating...' : 'Execute Generation'}
                    </button>
                    
                    {!forecastParams.useSavedModel && (
                        <button onClick={() => setSaveModelDialog(true)}>
                            Save as Template
                        </button>
                    )}
                </div>
            </div>

            {forecastResult && (
                <div className="results">
                    <div className="result-header">
                        <h3>Forecast Results</h3>
                        <div className="model-info">
                            <strong>Algorithm:</strong> {forecastResult.algorithm}<br/>
                            <strong>Model Used:</strong> {forecastResult.model_used}
                            {forecastResult.model_path && (
                                <><br/><strong>Path:</strong> {forecastResult.model_path}</>
                            )}
                        </div>
                    </div>
                    
                    <div className="metrics">
                        <div className="metric-card">
                            <label>MAPE</label>
                            <div className="value">{forecastResult.metrics.mape}%</div>
                        </div>
                        <div className="metric-card">
                            <label>RMSE</label>
                            <div className="value">{forecastResult.metrics.rmse.toLocaleString()}</div>
                        </div>
                        <div className="metric-card">
                            <label>Total Forecast</label>
                            <div className="value">{forecastResult.metrics.total_forecast.toLocaleString()}</div>
                        </div>
                        <div className="metric-card">
                            <label>Mean Monthly</label>
                            <div className="value">{forecastResult.metrics.mean_forecast.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="forecast-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Forecast</th>
                                    <th>Lower Bound (95%)</th>
                                    <th>Upper Bound (95%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forecastResult.forecast_periods.map((period, idx) => (
                                    <tr key={idx}>
                                        <td>{period}</td>
                                        <td>{Math.round(forecastResult.forecast_values[idx]).toLocaleString()}</td>
                                        <td>{Math.round(forecastResult.confidence_intervals.lower[idx]).toLocaleString()}</td>
                                        <td>{Math.round(forecastResult.confidence_intervals.upper[idx]).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Save Model Dialog */}
            {saveModelDialog && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Save as Template</h3>
                        <div className="config-summary">
                            <h4>Configuration Summary</h4>
                            <ul>
                                <li><strong>HORIZON:</strong> {forecastParams.horizon} Months</li>
                                <li><strong>GEOGRAPHY:</strong> {forecastParams.geography.join(', ')}</li>
                                <li><strong>SCOPE:</strong> {forecastParams.materialGroups.length} Material Groups</li>
                                <li><strong>ALGORITHM:</strong> {forecastParams.algorithm}</li>
                            </ul>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter template name..."
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={saveAsTemplate}>Save Template</button>
                            <button onClick={() => setSaveModelDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForecastWithModels;