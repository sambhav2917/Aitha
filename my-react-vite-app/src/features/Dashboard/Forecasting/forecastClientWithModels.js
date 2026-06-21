// forecastClientWithModels.js
const axios = require('axios');

class ForecastingClient {
    constructor(baseURL = 'http://localhost:8000') {
        this.client = axios.create({
            baseURL: baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Generate forecast (with option to use saved model)
    async generateForecast(forecastParams) {
        try {
            const response = await this.client.post('/forecast', {
                horizon: forecastParams.horizon || 12,
                frequency: forecastParams.frequency || "Monthly",
                historical_baseline: forecastParams.historicalBaseline || 12,
                geography: forecastParams.geography || [],
                material_groups: forecastParams.materialGroups || [],
                algorithm: forecastParams.algorithm || "Seasonal AI",
                use_saved_model: forecastParams.useSavedModel || false,
                model_name: forecastParams.modelName || null
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Forecast generation failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || error.message
            };
        }
    }

    // Save current configuration as a model
    async saveModel(modelParams) {
        try {
            const response = await this.client.post('/models/save', {
                model_name: modelParams.modelName,
                algorithm: modelParams.algorithm,
                geography: modelParams.geography,
                material_groups: modelParams.materialGroups,
                historical_baseline: modelParams.historicalBaseline || 12,
                description: modelParams.description || ""
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Save model failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || error.message
            };
        }
    }

    // List all saved models
    async listModels() {
        try {
            const response = await this.client.get('/models');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('List models failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get model details
    async getModelDetails(modelName) {
        try {
            const response = await this.client.get(`/models/${modelName}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get model details failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete a saved model
    async deleteModel(modelName) {
        try {
            const response = await this.client.delete(`/models/${modelName}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Delete model failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get metadata including saved models
    async getMetadata() {
        try {
            const response = await this.client.get('/metadata');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Failed to fetch metadata:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Express.js routes for model management
const setupForecastRoutes = (app, forecastClient) => {
    // Get forecast configuration with saved models
    app.get('/api/forecast/config', async (req, res) => {
        const result = await forecastClient.getMetadata();
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // Generate forecast
    app.post('/api/forecast/generate', async (req, res) => {
        const result = await forecastClient.generateForecast(req.body);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // Save current configuration as model
    app.post('/api/forecast/save-model', async (req, res) => {
        const result = await forecastClient.saveModel(req.body);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // List saved models
    app.get('/api/forecast/models', async (req, res) => {
        const result = await forecastClient.listModels();
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // Delete saved model
    app.delete('/api/forecast/models/:modelName', async (req, res) => {
        const result = await forecastClient.deleteModel(req.params.modelName);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });
};

module.exports = { ForecastingClient, setupForecastRoutes };