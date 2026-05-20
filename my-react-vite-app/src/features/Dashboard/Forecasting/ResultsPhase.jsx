import React, { useState, useEffect } from 'react';
import { fetchForecastData } from '../dashboard.service';

const ResultsPhase = ({ onAdjustParameters }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchForecastData();
      setTableData(data);
      setLoading(false);
    };
    load();
  }, []);

  const chartData = [
    { month: 'Jul', ly: 50, forecast: 55 }, { month: 'Aug', ly: 52, forecast: 60 },
    { month: 'Sep', ly: 68, forecast: 74 }, { month: 'Oct', ly: 78, forecast: 85 },
    { month: 'Nov', ly: 88, forecast: 95 }, { month: 'Dec', ly: 92, forecast: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forecast Results</h2>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Scenario: Q3-Q4 Baseline Global Expansion
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onAdjustParameters} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            Adjust Parameters
          </button>
          <button className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
            Approve Forecast
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="text-indigo-400">📊</span> Total Forecasted Volume
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-4xl font-bold text-gray-900">1.24M</p>
            <span className="text-sm font-medium text-gray-500">Units</span>
          </div>
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
            +12.4% vs Baseline
          </span>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="text-green-500">💵</span> LY Sales Comparison
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-4xl font-bold text-gray-900">$48.5M</p>
          </div>
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md relative z-10">
            +8.2% from LY
          </span>
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none"></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <span className="text-orange-400">🎯</span> Confidence Score
          </p>
          <div className="flex items-baseline gap-2 mb-5">
            <p className="text-4xl font-bold text-gray-900">94</p>
            <span className="text-sm font-medium text-gray-500">/ 100</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>
      </div>

      {/* Dual Bar Chart Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Generated Baseline vs. LY Sales</h3>
            <p className="text-sm text-gray-500">Monthly volume projection for Q3-Q4</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#4f46e5] rounded-sm"></div> Generated Forecast</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-200 rounded-sm"></div> LY Sales Reference</span>
            </div>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
              Export
            </button>
          </div>
        </div>
        <div className="relative h-64 w-full pl-12 pr-4 pb-6">
          <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
            {[250, 200, 150, 100, 50].map((val) => (
              <div key={val} className="w-full flex items-center border-b border-gray-100 h-0 relative">
                <span className="absolute -left-12 text-[10px] font-medium text-gray-400">{val}k</span>
              </div>
            ))}
          </div>
          <div className="w-full h-full flex justify-between items-end px-4 relative z-10">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center h-full w-16 justify-end group">
                <div className="flex items-end gap-1 w-full h-full pt-4">
                  <div className="w-1/2 bg-gray-200 rounded-t-sm hover:bg-gray-300 transition-colors" style={{ height: `${data.ly}%` }}></div>
                  <div className="w-1/2 bg-[#4f46e5] rounded-t-sm hover:bg-[#4338ca] transition-colors" style={{ height: `${data.forecast}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500 mt-3">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-gray-900 text-lg">Detailed Breakdown</h3>
          <div className="relative w-72">
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search SKUs or Products..." className="w-full bg-gray-100/50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 font-medium">Loading forecasting breakdown...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="p-4 pl-6 font-bold">SKU / Product Name</th>
                <th className="p-4 font-bold text-right">LY Sales (Vol)</th>
                <th className="p-4 font-bold text-right">Baseline Forecast</th>
                <th className="p-4 font-bold text-right">Variance (%)</th>
                <th className="p-4 font-bold text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 font-bold text-xs rounded flex items-center justify-center shrink-0">{row.id}</div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{row.name}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">SKU: {row.sku}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-700">{row.lySales}</td>
                  <td className="p-4 text-right font-bold text-indigo-600">{row.forecast}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${row.varType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {row.variance}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex w-8 h-8 rounded-full border-2 border-orange-400 text-orange-600 font-bold text-xs items-center justify-center">
                      {row.confidence}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResultsPhase;