import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Scenario } from '../../types';

interface ScenarioChartProps {
  scenario: Scenario;
  onSelect?: (scenario: Scenario) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ScenarioChart: React.FC<ScenarioChartProps> = ({ scenario, onSelect }) => {
  const data = scenario.allocations.map(a => ({
    name: a.fund.constituent_fund,
    value: a.allocation
  }));

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 my-4">
      <h4 className="text-base font-bold text-gray-800 mb-4 border-b pb-2">{scenario.title}</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 w-full min-w-0" aria-label={`Pie chart showing allocation for ${scenario.title}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col justify-between">
          <div className="flex flex-col justify-center space-y-5">
            <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
               <span className="text-gray-700 font-medium text-sm">Weighted FER</span>
               <span className="font-bold text-blue-700 text-lg">{scenario.weightedFER?.toFixed(2)}%</span>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse" aria-label="Detailed allocation table">
                  <thead>
                      <tr className="text-gray-400 border-b text-xs uppercase tracking-wider">
                          <th scope="col" className="pb-2 font-semibold pl-1">Fund</th>
                          <th scope="col" className="pb-2 text-right font-semibold">ALLOC</th>
                          <th scope="col" className="pb-2 text-right font-semibold">1Y</th>
                          <th scope="col" className="pb-2 text-right font-semibold">3Y</th>
                          <th scope="col" className="pb-2 text-right font-semibold">5Y</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {scenario.allocations.map((a, i) => (
                          <tr key={i} className="text-gray-800 hover:bg-gray-50/50 transition-colors">
                              <td className="py-2 pl-1 pr-2 truncate max-w-[100px] text-xs font-medium text-gray-600" title={a.fund.constituent_fund}>
                                  {a.fund.constituent_fund}
                              </td>
                              <td className="py-2 text-right font-bold text-xs text-gray-900">{a.allocation}%</td>
                              <td className={`py-2 text-right text-xs font-bold ${a.fund.annualized_return_1y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {a.fund.annualized_return_1y.toFixed(1)}%
                              </td>
                              <td className={`py-2 text-right text-xs font-bold ${a.fund.annualized_return_3y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {a.fund.annualized_return_3y.toFixed(1)}%
                              </td>
                               <td className={`py-2 text-right text-xs font-bold ${a.fund.annualized_return_5y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {a.fund.annualized_return_5y.toFixed(1)}%
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
            </div>
          </div>
          
          <button
            onClick={() => onSelect && onSelect(scenario)}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
          >
            Select
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioChart;