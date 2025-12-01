import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import FundTable from '../Visualizations/FundTable';
import { getFunds, getManagerStats } from '../../services/dataService';

interface RankingsViewProps {
  isActive?: boolean;
}

const RankingsView: React.FC<RankingsViewProps> = ({ isActive }) => {
  const [timePeriod, setTimePeriod] = useState<'1Y' | '3Y' | '5Y'>('1Y');
  const allFunds = useMemo(() => getFunds(), []);
  
  // Sorting logic for Top 10
  const topFunds = useMemo(() => {
    const field = timePeriod === '1Y' ? 'annualized_return_1y' : timePeriod === '3Y' ? 'annualized_return_3y' : 'annualized_return_5y';
    return [...allFunds].sort((a, b) => b[field] - a[field]).slice(0, 10);
  }, [allFunds, timePeriod]);

  const managers = useMemo(() => getManagerStats(allFunds), [allFunds]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Time Toggle */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-lg w-fit shadow-sm border border-gray-100">
        {(['1Y', '3Y', '5Y'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 
              ${timePeriod === period 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {period} Return
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Funds Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Top 10 Funds by {timePeriod} Return
          </h2>
          <FundTable funds={topFunds} />
        </div>

        {/* Manager Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
            Top Fund Managers (by AUM)
          </h2>
          <div className="space-y-4">
            {managers.map((manager, idx) => (
              <div key={idx} className="flex items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  #{idx + 1}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                  <p className="text-xs text-gray-500">{manager.count} funds monitored</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-blue-600">
                    {(manager.aum / 1000).toFixed(1)}B HKD
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Total AUM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Performance Comparison (Top 10)</h2>
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFunds} margin={{top: 5, right: 30, left: 20, bottom: 60}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="constituent_fund" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  height={80} 
                  tick={{fontSize: 10}}
                />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey={`annualized_return_${timePeriod.toLowerCase()}`} name="Return %" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Risk vs Return Analysis</h2>
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
                <CartesianGrid />
                <XAxis type="number" dataKey="latest_fer" name="FER" unit="%" label={{ value: 'Fund Expense Ratio', position: 'insideBottom', offset: -10 }} />
                <YAxis type="number" dataKey="annualized_return_1y" name="1Y Return" unit="%" label={{ value: '1Y Return', angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" dataKey="fund_size_hkd_m" range={[20, 400]} name="Fund Size" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                            <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg text-xs z-50">
                                <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1 max-w-[200px]">{data.constituent_fund}</p>
                                <div className="space-y-1">
                                     <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">FER:</span>
                                        <span className="font-mono font-semibold text-gray-700">{data.latest_fer.toFixed(2)}%</span>
                                     </div>
                                     <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">1Y Return:</span>
                                        <span className={`font-mono font-bold ${data.annualized_return_1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.annualized_return_1y > 0 ? '+' : ''}{data.annualized_return_1y.toFixed(2)}%
                                        </span>
                                     </div>
                                     <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">Size:</span>
                                        <span className="font-mono text-gray-700">{(data.fund_size_hkd_m / 1000).toFixed(2)}B</span>
                                     </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }} />
                <Scatter name="Funds" data={allFunds} fill="#2563EB" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingsView;