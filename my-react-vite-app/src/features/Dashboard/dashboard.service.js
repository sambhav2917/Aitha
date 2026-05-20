// ============================================================================
// IN-MEMORY MOCK DATABASES (State persists until browser refresh)
// ============================================================================

// 1. Material Master Data
let mockMaterials = [
  { id: 'MAT-90281-X', name: 'Optic Flux Sensor Rev. 4', type: 'Electronics', group: 'Core Tech', regions: ['EMEA', 'APAC'], status: 'Active', active: true },
  { id: 'MAT-88392-Y', name: 'Hyper-Link Controller', type: 'Hardware', group: 'Network', regions: ['NORTHAM'], status: 'Pending Review', pending: true },
  { id: 'MAT-11200-Z', name: 'Neural Bridge Hub V2', type: 'Module', group: 'Core Tech', regions: ['GLOBAL'], status: 'Draft', draft: true }
];

let mockRecentUploads = [
  { name: 'MM_North_Region_v2.csv', date: 'Oct 24, 2023 • 14:20 PM', status: 'Completed', type: 'success' },
  { name: 'Spare_Parts_Draft.xlsx', date: 'Oct 23, 2023 • 09:12 AM', status: 'Partial Error', type: 'warning' }
];

// 2. Sales Regions Data
let mockSalesData = [
  { id: 'TXN-89241', product: 'Enterprise Server Blade', sku: 'SRV-Bld-001', region: 'North America', period: 'Q1 2024', qty: 142, value: '$426,000', status: 'Confirmed' },
  { id: 'TXN-89242', product: 'Cloud Storage Node', sku: 'CLD-Stg-050', region: 'EMEA', period: 'Q1 2024', qty: 85, value: '$102,000', status: 'Pending' },
  { id: 'TXN-89243', product: 'Network Switch L3', sku: 'NET-SwL-300', region: 'APAC', period: 'Jan 2024', qty: 310, value: '$279,000', status: 'Confirmed' },
  { id: 'TXN-89244', product: 'Security Appliance Firewall', sku: 'SEC-App-FW1', region: 'North America', period: 'Feb 2024', qty: 45, value: '$157,500', status: 'Confirmed' },
];

// 3. Forecasting Data
let mockForecastSKUs = [
  { id: 'P1', name: 'Alpha Series - Enterprise Node', sku: 'HW-ENT-001', lySales: '12,450', forecast: '14,200', variance: '+14.0%', varType: 'positive', confidence: 98 },
  { id: 'P2', name: 'Beta Core Server Rack', sku: 'HW-SRV-042', lySales: '8,100', forecast: '8,950', variance: '+10.5%', varType: 'positive', confidence: 92 },
  { id: 'P3', name: 'Legacy Switch Hub v2', sku: 'HW-NET-993', lySales: '22,300', forecast: '21,150', variance: '-5.1%', varType: 'negative', confidence: 85 },
  { id: 'P4', name: 'Gamma Processor Unit', sku: 'HW-CPU-110', lySales: '45,000', forecast: '52,600', variance: '+16.8%', varType: 'positive', confidence: 96 }
];

//4 . Warehouse Data
let mockWarehouses = [
  { id: 'WH-TX-001', name: 'Austin Central Hub', location: 'Austin, TX', type: 'HUB', capacity: 135000, status: 'Operational', manager: 'Sarah Jenkins' },
  { id: 'WH-CA-042', name: 'SFO Distribution Center', location: 'San Francisco, CA', type: 'DC', capacity: 83000, status: 'Operational', manager: 'David Chen' },
  { id: 'WH-NY-012', name: 'NJ Regional Annex', location: 'Newark, NJ', type: 'REGIONAL', capacity: 42500, status: 'Maintenance', manager: 'Lisa Ray' },
  { id: 'WH-IL-089', name: 'Chicago Logistics Hub', location: 'Chicago, IL', type: 'HUB', capacity: 210000, status: 'Operational', manager: 'Marcus Thorne' },
  { id: 'WH-WA-064', name: 'Seattle Port Facility', location: 'Seattle, WA', type: 'DC', capacity: 115000, status: 'Inactive', manager: 'Elena Rostova' }
];


// ============================================================================
// FEATURE 1: MATERIAL MASTER & BULK UPLOADS
// ============================================================================

export const fetchMaterials = async () => new Promise(res => setTimeout(() => res([...mockMaterials]), 600));

export const createMaterial = async (materialData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMaterial = {
        id: materialData.productId, 
        name: materialData.description, 
        type: materialData.type,
        group: materialData.group || 'Unassigned', 
        regions: [materialData.region],
        status: 'Draft', 
        draft: true
      };
      mockMaterials.unshift(newMaterial);
      resolve({ success: true, data: newMaterial });
    }, 800);
  });
};

export const fetchRecentUploads = async () => new Promise(res => setTimeout(() => res([...mockRecentUploads]), 400));

// Bulk Upload Wizard Phase Services
export const simulateExcelUpload = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ fileName: 'Global_Materials_Q3_Draft.xlsx', rowCount: 42 });
    }, 1200);
  });
};

export const validateMaterialMapping = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalRows: 42, validCount: 40, errorCount: 2, missingGroups: ['Legacy_Obsolete'],
        validPreview: [
          { id: 'MAT-99100-A', name: 'Quantum Processor Node', type: 'Processor', region: 'GLOBAL' },
          { id: 'MAT-99101-B', name: 'Thermal Heatsink V4', type: 'Hardware', region: 'NORTHAM' },
          { id: 'MAT-99102-C', name: 'Logic Board Base', type: 'Electronics', region: 'EMEA' },
        ]
      });
    }, 1500);
  });
};

export const confirmBulkMaterialUpload = async (validData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMaterials = validData.map(item => ({
        id: item.id, name: item.name, type: item.type, group: 'Bulk Import',
        regions: [item.region], status: 'Draft', draft: true
      }));
      mockMaterials = [...newMaterials, ...mockMaterials];
      resolve({ success: true, count: newMaterials.length });
    }, 1000);
  });
};

// Update existing material
export const updateMaterial = async (id, updatedData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockMaterials.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMaterials[index] = { ...mockMaterials[index], ...updatedData };
        resolve({ success: true, data: mockMaterials[index] });
      } else {
        resolve({ success: false, error: 'Material not found' });
      }
    }, 600);
  });
};

// Soft Delete material
export const deleteMaterial = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Enterprise Best Practice: Soft Delete (Change status, don't remove from array)
      const index = mockMaterials.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMaterials[index] = { 
          ...mockMaterials[index], 
          status: 'Discontinued', 
          active: false, pending: false, draft: false, discontinued: true 
        };
      }
      
      // If you prefer a Hard Delete (actually removing it from the table):
      // mockMaterials = mockMaterials.filter(m => m.id !== id);
      
      resolve({ success: true });
    }, 500);
  });
};


// ============================================================================
// FEATURE 2: SALES REGIONS & HISTORY
// ============================================================================

export const fetchSalesRegions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockSalesData]);
    }, 500);
  });
};

export const validateSalesUpload = async (fileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalRows: 844, validCount: 842, errorCount: 2, missingSkus: ['SKU-9999', 'SKU-8888'],
        validPreview: [
          { id: 'TXN-00124', sku: 'SKU-1024', qty: 42, price: '$1,240.00', region: 'North America' },
          { id: 'TXN-00125', sku: 'SKU-2048', qty: 12, price: '$480.00', region: 'EMEA' },
          { id: 'TXN-00126', sku: 'SKU-4096', qty: 156, price: '$5,620.00', region: 'APAC' },
          { id: 'TXN-00127', sku: 'SKU-5120', qty: 8, price: '$120.00', region: 'LATAM' },
        ]
      });
    }, 1500); 
  });
};

export const confirmSalesUpload = async (validData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEntries = validData.map(item => ({
        id: item.id, product: 'New Uploaded Product', sku: item.sku, 
        region: item.region, period: 'Current', qty: item.qty, value: item.price, status: 'Confirmed'
      }));
      mockSalesData = [...newEntries, ...mockSalesData];
      resolve({ success: true });
    }, 800);
  });
};


// ============================================================================
// FEATURE 3: FORECASTING
// ============================================================================

export const fetchForecastData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => { 
      resolve([...mockForecastSKUs]); 
    }, 600);
  });
};

export const executeForecastGeneration = async (configData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: "Forecast generated successfully.",
        configUsed: configData
      });
    }, 1500);
  });
};


// ============================================================================
// FEATURE 4: WAREHOUSE MASTER
// ============================================================================

export const fetchWarehouses = async () => {
  return new Promise(res => setTimeout(() => res([...mockWarehouses]), 500));
};

export const createWarehouse = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newWh = { 
        ...data, 
        id: `WH-${data.location.substring(0,2).toUpperCase()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}` 
      };
      mockWarehouses.unshift(newWh);
      resolve({ success: true, data: newWh });
    }, 800);
  });
};

export const updateWarehouse = async (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockWarehouses.findIndex(w => w.id === id);
      if (index !== -1) {
        mockWarehouses[index] = { ...mockWarehouses[index], ...data };
        resolve({ success: true, data: mockWarehouses[index] });
      }
    }, 600);
  });
};

export const deleteWarehouse = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockWarehouses.findIndex(w => w.id === id);
      if (index !== -1) mockWarehouses[index].status = 'Inactive'; // Soft delete
      resolve({ success: true });
    }, 500);
  });
};