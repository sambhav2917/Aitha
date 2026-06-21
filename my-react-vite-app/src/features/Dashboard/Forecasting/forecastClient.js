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

    async generateForecast(forecastParams) {
        try {
            const response = await this.client.post('/forecast', {
                horizon: forecastParams.horizon || 12,
                frequency: forecastParams.frequency || "Monthly",
                historical_baseline: forecastParams.historicalBaseline || 12,
                geography: forecastParams.geography || [],
                material_groups: forecastParams.materialGroups || [],
                algorithm: forecastParams.algorithm || "Seasonal AI"
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

    async compareModels(geography, materialGroups, horizon = 12) {
        try {
            const formData = new FormData();
            if (geography) formData.append('geography', geography);
            if (materialGroups) formData.append('material_groups', materialGroups);
            formData.append('horizon', horizon);
            
            const response = await this.client.post('/forecast/compare', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Model comparison failed:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.detail || error.message
            };
        }
    }

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

    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// Express.js route handler example
const setupForecastRoutes = (app, forecastClient) => {
    // Get forecast configuration (populate UI dropdowns)
    app.get('/api/forecast/config', async (req, res) => {
        const result = await forecastClient.getMetadata();
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // Generate forecast based on UI selections
    app.post('/api/forecast/generate', async (req, res) => {
        const {
            horizon,
            frequency,
            historicalBaseline,
            geography,
            materialGroups,
            algorithm
        } = req.body;

        const result = await forecastClient.generateForecast({
            horizon,
            frequency,
            historicalBaseline,
            geography,
            materialGroups,
            algorithm
        });

        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });

    // Compare all models
    app.post('/api/forecast/compare', async (req, res) => {
        const { geography, materialGroups, horizon } = req.body;
        const result = await forecastClient.compareModels(geography, materialGroups, horizon);
        
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    });
};

module.exports = { ForecastingClient, setupForecastRoutes };