import React, { useState } from 'react';
import { Scenario } from '../../types';
import { ArrowRightLeft, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import EnrollmentForm from '../Forms/EnrollmentForm';

interface FundTransferViewProps {
  scenario: Scenario | null;
  onReset?: () => void;
  isActive?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const FundTransferView: React.FC<FundTransferViewProps> = ({ scenario, onReset, isActive }) => {
  const [copyTrigger, setCopyTrigger] = useState(0);

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in">
        <div className="bg-blue-50 p-6 rounded-full mb-4">
          <ArrowRightLeft className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Scenario Selected</h2>
        <p className="text-gray-500 max-w-md mb-6">
          Please go to the <strong>Portfolio Analyzer</strong> tab, generate optimization scenarios, and click "Select" on your preferred option to proceed with the fund transfer.
        </p>
        {onReset && (
            <button 
                onClick={onReset}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
                Back to Analyzer
            </button>
        )}
      </div>
    );
  }

  const data = scenario.allocations.map(a => ({
    name: a.fund.constituent_fund,
    value: a.allocation
  }));

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative">
        {/* Reset Button (Top Right) */}
        {onReset && (
            <button 
                onClick={onReset}
                className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors"
            >
                <RotateCcw size={16} />
                Reset
            </button>
        )}

        <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="bg-green-100 p-3 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Fund Transfer</h2>
            <p className="text-gray-500">Review your selected portfolio configuration before proceeding.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Target Allocation</h3>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-800">{scenario.allocations.length}</span>
                  <span className="block text-xs text-gray-500">Funds</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Transfer Details</h3>
            <div className="space-y-3">
              {scenario.allocations.map((alloc, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-700 truncate" title={alloc.fund.constituent_fund}>
                      {alloc.fund.constituent_fund}
                    </span>
                  </div>
                  <span className="font-bold text-blue-600">{alloc.allocation}%</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-800 font-medium">Estimated FER</span>
                <span className="text-lg font-bold text-blue-900">{scenario.weightedFER?.toFixed(2)}%</span>
              </div>
              <div className="text-xs text-blue-600/80">
                This portfolio is optimized for {scenario.title}.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-end">
           <div className="flex-1 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>Fund transfers may take 2-3 business days to process. Please ensure you have read the offering documents for the selected funds.</p>
           </div>
           <button 
             onClick={() => setCopyTrigger(Date.now())}
             className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
           >
             Confirm Transfer
           </button>
        </div>
      </div>

      {/* Merged Enrollment Form */}
      <EnrollmentForm prefillAllocation={scenario} copyToEnrollmentTrigger={copyTrigger} />
    </div>
  );
};

export default FundTransferView;