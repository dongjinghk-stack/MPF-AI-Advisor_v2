
import React from 'react';
import { MPFFund } from '../../types';

interface FundTableProps {
  funds: MPFFund[];
}

const FundTable: React.FC<FundTableProps> = ({ funds }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm" aria-label="MPF Fund Rankings">
        <caption className="sr-only">A table listing MPF funds sorted by return, showing rank, name, trustee, 1-year return, fund expense ratio, and risk class.</caption>
        <thead className="bg-blue-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-blue-900">Rank</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-blue-900">Fund Name</th>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-blue-900">Trustee</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-blue-900">1Y Return</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-blue-900">FER</th>
            <th scope="col" className="px-4 py-3 text-center font-semibold text-blue-900">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {funds.map((fund, index) => (
            <tr key={index} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-500">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{fund.constituent_fund}</td>
              <td className="px-4 py-3 text-gray-600">{fund.mpf_trustee}</td>
              <td className={`px-4 py-3 text-right font-bold ${fund.annualized_return_1y >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fund.annualized_return_1y >= 0 ? '+' : ''}{fund.annualized_return_1y.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-right text-gray-700">{fund.latest_fer.toFixed(2)}%</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                  ${fund.risk_class <= 2 ? 'bg-green-100 text-green-800' : 
                    fund.risk_class <= 5 ? 'bg-yellow-100 text-yellow-900' : 
                    'bg-red-100 text-red-800'}`}>
                  <span className="sr-only">Risk Level </span>{fund.risk_class}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FundTable;
