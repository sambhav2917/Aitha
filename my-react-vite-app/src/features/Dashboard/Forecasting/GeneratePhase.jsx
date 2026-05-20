import React, { useState } from 'react';

const GeneratePhase = ({ onExecute, loading }) => {
  const [config, setConfig] = useState({
    horizon: '12 Months',
    frequency: 'Monthly',
    baseline: 'Last 12 Months',
    geography: 'North America (NA)',
    scope: ['Consumer Electronics', 'Smart Home Devices'],
    engine: 'Seasonal AI'
  });

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Forecast</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl">
          Configure your predictive model parameters. Select your data baseline, target segments, and horizon to generate a comprehensive demand forecast.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left Column: Configuration Forms */}
        <div className="flex-1 space-y-6">
          
          {/* Temporal Parameters */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="text-blue-600">📅</span> Temporal Parameters
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Forecast Horizon</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                  value={config.horizon} onChange={(e) => setConfig({...config, horizon: e.target.value})}
                >
                  <option>12 Months</option>
                  <option>6 Months</option>
                  <option>Q3-Q4 Only</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Generation Frequency</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                  value={config.frequency} onChange={(e) => setConfig({...config, frequency: e.target.value})}
                >
                  <option>Monthly</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Historical Baseline</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                  value={config.baseline} onChange={(e) => setConfig({...config, baseline: e.target.value})}
                >
                  <option>Last 12 Months</option>
                  <option>Last 24 Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* Segment Scope */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="text-orange-500">△</span> Segment Scope
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Geography</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                  value={config.geography} onChange={(e) => setConfig({...config, geography: e.target.value})}
                >
                  <option>Global Overview</option>
                  <option>North America (NA)</option>
                  <option>EMEA</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Material Groups (Multi-Select)</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[60px] flex flex-wrap gap-2 items-start">
                  {config.scope.map(item => (
                    <span key={item} className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
                      {item} <span className="text-gray-400 hover:text-gray-600 cursor-pointer">×</span>
                    </span>
                  ))}
                  <input type="text" placeholder="Add material group..." className="bg-transparent border-none text-sm focus:outline-none mt-1 ml-1 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Modeling Engine */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="text-green-600">⚙</span> Modeling Engine
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => setConfig({...config, engine: 'Seasonal AI'})}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${config.engine === 'Seasonal AI' ? 'border-[#4f46e5] bg-indigo-50/50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Seasonal AI</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Machine learning model optimized for high-volatility and seasonal trends.</p>
              </div>
              <div 
                onClick={() => setConfig({...config, engine: 'Linear Reg.'})}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${config.engine === 'Linear Reg.' ? 'border-[#4f46e5] bg-indigo-50/50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Linear Reg.</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Traditional statistical approach best suited for stable, mature product lines.</p>
              </div>
              <div 
                onClick={() => setConfig({...config, engine: 'Moving Avg.'})}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${config.engine === 'Moving Avg.' ? 'border-[#4f46e5] bg-indigo-50/50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <h4 className="font-bold text-gray-900 mb-2">Moving Avg.</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">Simple smoothing technique for short-term operational planning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration Summary Sidebar */}
        <div className="w-80 shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Configuration<br/>Summary</h3>
            
            <div className="space-y-5 border-l-2 border-gray-200 pl-4 ml-2 mb-8">
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-50"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Horizon</p>
                <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{config.horizon} (LTM Baseline)</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-50"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Geography</p>
                <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{config.geography}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-50"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scope</p>
                <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{config.scope.length} Material Groups</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-50"></div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Algorithm</p>
                <p className="text-sm font-bold text-gray-900 leading-tight mt-1">{config.engine}</p>
              </div>
            </div>

            <button 
              onClick={() => onExecute(config)}
              disabled={loading}
              className="w-full py-3 bg-[#4f46e5] text-white font-bold rounded-lg mb-3 hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Execute Generation'}
            </button>
            <button className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition">
              Save as Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePhase;