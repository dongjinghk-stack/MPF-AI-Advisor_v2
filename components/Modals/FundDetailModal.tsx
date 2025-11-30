import React from 'react';
import { X, TrendingUp, ShieldAlert, DollarSign, Calendar } from 'lucide-react';
import { MPFFund } from '../../types';

interface FundDetailModalProps {
  fund: MPFFund;
  onClose: () => void;
}

const FundDetailModal: React.FC<FundDetailModalProps> = ({ fund, onClose }) => {
  if (!fund) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 flex justify-between items-start text-white">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-[10px] font-semibold tracking-wider uppercase mb-2">
              {fund.mpf_trustee}
            </span>
            <h2 className="text-xl font-bold leading-tight">{fund.constituent_fund}</h2>
            <p className="text-blue-100 text-sm mt-1">{fund.fund_type}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <ShieldAlert size={14} />
                <span className="text-xs font-medium">Risk Class</span>
              </div>
              <p className={`text-lg font-bold ${fund.risk_class <= 2 ? 'text-green-600' : fund.risk_class <= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {fund.risk_class} <span className="text-xs text-gray-400 font-normal">/ 7</span>
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign size={14} />
                <span className="text-xs font-medium">FER</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{fund.latest_fer.toFixed(2)}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp size={14} />
                <span className="text-xs font-medium">1Y Return</span>
              </div>
              <p className={`text-lg font-bold ${fund.annualized_return_1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {fund.annualized_return_1y > 0 ? '+' : ''}{fund.annualized_return_1y.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={14} />
                <span className="text-xs font-medium">Launch</span>
              </div>
              <p className="text-sm font-bold text-gray-800 mt-1">{fund.launch_date}</p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            Performance History
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 mb-6">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-2">Period</th>
                  <th className="px-4 py-2 text-right">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                   <td className="px-4 py-2 text-gray-600">Annualized 1Y</td>
                   <td className={`px-4 py-2 text-right font-semibold ${fund.annualized_return_1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fund.annualized_return_1y.toFixed(2)}%</td>
                </tr>
                <tr>
                   <td className="px-4 py-2 text-gray-600">Annualized 3Y</td>
                   <td className={`px-4 py-2 text-right font-semibold ${fund.annualized_return_3y >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fund.annualized_return_3y.toFixed(2)}%</td>
                </tr>
                <tr>
                   <td className="px-4 py-2 text-gray-600">Annualized 5Y</td>
                   <td className={`px-4 py-2 text-right font-semibold ${fund.annualized_return_5y >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fund.annualized_return_5y.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="text-xs text-gray-400">
            Fund Size: {(fund.fund_size_hkd_m / 1000).toFixed(2)} Billion HKD
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailModal;