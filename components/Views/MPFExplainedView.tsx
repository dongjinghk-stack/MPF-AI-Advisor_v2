
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShieldCheck, PieChart, AlertTriangle, 
  Info, PiggyBank, Coins, ArrowRight, BarChart3, 
  Lock, Calendar, Leaf, HelpCircle, Landmark, 
  Banknote, Scale, Activity, FileText
} from 'lucide-react';

const MPFExplainedView: React.FC = () => {
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [activeRisk, setActiveRisk] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setMounted(true);
  }, []);

  const riskExplanations: Record<number, string> = {
    1: "Very low volatility (0-0.5%). Your investment is super stable – like keeping money in a safe. Best for those who can't afford any losses.",
    2: "Low volatility (0.5-2%). Still very stable with minimal fluctuation. Good for conservative investors.",
    3: "Low-Medium volatility (2-5%). Some ups and downs, but generally manageable. A balance between safety and growth.",
    4: "Medium volatility (5-10%). You'll see noticeable swings in value. Suitable for those with longer time horizons.",
    5: "Medium-High volatility (10-15%). Significant fluctuations possible. Be prepared for both gains and losses.",
    6: "High volatility (15-25%). Big swings in value are common. Only for those comfortable with substantial risk.",
    7: "Very High volatility (25%+). Maximum risk level. Your investment could swing dramatically – but also has highest growth potential!"
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* CSS for custom animations adapted from the provided HTML */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes coinDrop {
          0% { top: -80px; opacity: 1; transform: translateX(-50%) rotateY(0deg); }
          80% { top: -20px; opacity: 1; transform: translateX(-50%) rotateY(360deg); }
          100% { top: -10px; opacity: 0; transform: translateX(-50%) rotateY(360deg); }
        }
        @keyframes growBar {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .piggy-body { animation: breathe 2s ease-in-out infinite; }
        .flying-coin { animation: coinDrop 2s ease-in-out infinite; }
        .animate-grow {
            animation: growBar 1.5s ease-out forwards;
            transform-origin: bottom;
            transform: scaleY(0); /* Start hidden */
        }
        .wave {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%232563eb' fill-opacity='0.1' d='M0,60 C300,120 600,0 900,60 C1200,120 1500,0 1800,60 L1800,120 L0,120 Z'/%3E%3C/svg%3E") repeat-x;
          animation: wave 8s linear infinite;
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">Understanding Your MPF</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Your complete guide to building wealth for retirement. Simple, visual, and easy to understand.
          </p>
        </div>
      </div>

      {/* Section 1: Overview & Piggy Bank */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-bold text-gray-800">Why MPF Matters to You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              Think of MPF as your automatic savings buddy for retirement! Every month, a small portion of your salary is set aside and invested to grow over time. It's like planting a seed today that grows into a big tree when you retire.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-1">
                <Info size={16} /> Did You Know?
              </h4>
              <p className="text-sm text-blue-700">
                Both you and your employer contribute 5% of your salary each month. That's like getting a 100% instant return on your contribution!
              </p>
            </div>
          </div>

          <div className="relative h-64 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
            {/* CSS Piggy Bank Visual */}
            <div className="relative w-[150px] h-[120px]">
              <div className="flying-coin absolute w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-500 flex items-center justify-center text-yellow-700 font-bold shadow-md z-10 left-1/2 -translate-x-1/2 top-0">
                $
              </div>
              <div className="piggy-body relative w-[150px] h-[100px] bg-pink-300 rounded-[50%] top-[30px] shadow-lg">
                <div className="absolute w-[30px] h-[40px] bg-pink-400 rounded-[50%_50%_0_0] -top-[15px] left-[20px] -rotate-[20deg]"></div>
                <div className="absolute w-[30px] h-[40px] bg-pink-400 rounded-[50%_50%_0_0] -top-[15px] right-[20px] rotate-[20deg]"></div>
                <div className="absolute w-[40px] h-[30px] bg-pink-300 rounded-full -right-[10px] top-[35px] flex items-center justify-center gap-2 px-2 shadow-inner">
                   <div className="w-2 h-2 bg-pink-700 rounded-full"></div>
                   <div className="w-2 h-2 bg-pink-700 rounded-full"></div>
                </div>
                <div className="absolute w-3 h-3 bg-slate-800 rounded-full top-[25px] right-[40px]"></div>
                <div className="absolute w-[40px] h-[6px] bg-pink-700 rounded-full -top-[3px] left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
           {[
             { icon: Leaf, title: "Compound Growth", desc: "Money grows on gains", color: "text-green-500" },
             { icon: ShieldCheck, title: "Tax Benefits", desc: "Tax-deductible", color: "text-blue-500" },
             { icon: Landmark, title: "Employer Match", desc: "Extra 5% monthly", color: "text-purple-500" },
             { icon: Lock, title: "Retirement Security", desc: "Build a safe future", color: "text-orange-500" },
           ].map((item, i) => (
             <div key={i} className="bg-gray-50 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
               <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
               <h3 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h3>
               <p className="text-xs text-gray-500">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Section 2: Annualized Return */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-bold text-gray-800">What is Annualized Return?</h2>
        </div>

        <p className="text-gray-600 mb-6">
          <strong>Annualized Return</strong> is the average yearly return of your investment, taking into account the magic of compounding. It's like measuring your average daily step count – it gives you a consistent way to compare performance over different time periods.
        </p>

        {/* Growth Chart */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 relative overflow-hidden border border-slate-200">
          <h3 className="text-center text-sm font-semibold text-gray-500 mb-8">Watch Your Money Grow Over Time</h3>
          <div className="flex items-end justify-center gap-4 md:gap-8 h-[250px] px-4 pb-4">
            {[
              { year: 'Year 1', val: '$10,000', h: '71%', delay: '0s' },
              { year: 'Year 2', val: '$10,600', h: '76%', delay: '0.2s' },
              { year: 'Year 3', val: '$11,500', h: '82%', delay: '0.4s' },
              { year: 'Year 4', val: '$12,500', h: '89%', delay: '0.6s' },
              { year: 'Year 5', val: '$14,000', h: '100%', delay: '0.8s' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[60px] h-full justify-end">
                <div 
                  className={`w-full bg-gradient-to-t from-green-400 to-blue-500 rounded-t-lg relative group ${mounted ? 'animate-grow' : ''}`}
                  style={{ 
                    height: bar.h,
                    animationDelay: bar.delay
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-blue-600 font-bold text-xs whitespace-nowrap">
                    {bar.val}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500">{bar.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real Example */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 border-dashed border-2">
           <h4 className="text-amber-800 font-bold mb-4 flex items-center gap-2 text-lg">
             <Banknote size={20} /> Real Example
           </h4>
           <p className="text-sm text-amber-900 mb-4 font-medium">Imagine your fund's unit prices over 3 years:</p>
           <div className="space-y-4 mb-6">
              {[
                  { l: 'Year 1', w: '60%', v: '$10.00' },
                  { l: 'Year 2', w: '66%', v: '$10.20 (+2%)' },
                  { l: 'Year 3', w: '85%', v: '$11.22 (+10%)' },
              ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                     <span className="w-16 font-bold text-gray-500 text-sm">{row.l}</span>
                     <div 
                        className="h-8 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-end px-3 text-white text-xs font-bold shadow-sm"
                        style={{ width: row.w }}
                     >
                        {row.v}
                     </div>
                  </div>
              ))}
           </div>
           <div className="text-sm text-amber-900 bg-amber-100/50 p-4 rounded-lg">
             <p className="mb-1"><strong>Cumulative Return:</strong> 12.2% total</p>
             <p className="mb-1"><strong>Annualized Return:</strong> 5.925% per year</p>
             <p className="text-xs text-amber-700 italic mt-2">Note: It's NOT simply 12.2% ÷ 2 = 6.1% because of compounding!</p>
           </div>
        </div>
      </div>

      {/* Section 3: Calendar Year Return */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
          <h2 className="text-xl font-bold text-gray-800">What is Calendar Year Return?</h2>
        </div>

        <p className="text-gray-600 mb-6">
          <strong>Calendar Year Return</strong> is how much your fund gained or lost from Jan 1 to Dec 31. Think of it like your annual health checkup – a snapshot of performance for that specific year.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           {[
             { y: '2020', val: '+8%', type: 'pos' },
             { y: '2021', val: '+12%', type: 'pos' },
             { y: '2022', val: '-5%', type: 'neg' },
             { y: '2023', val: '+15%', type: 'pos' },
           ].map((item, i) => (
             <div key={i} className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl text-center transform hover:-translate-y-1 transition-transform duration-300">
               <div className="text-gray-400 text-sm font-bold mb-1">{item.y}</div>
               <div className={`text-2xl font-bold ${item.type === 'pos' ? 'text-green-500' : 'text-red-500'}`}>
                 {item.val}
               </div>
             </div>
           ))}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h4 className="font-bold text-blue-800 text-sm mb-1">Difference</h4>
          <p className="text-xs text-blue-700">
            <strong>Calendar Return</strong> = 1 year snapshot.<br/>
            <strong>Annualized Return</strong> = Average speed over the long run.<br/>
            Use both to get the full picture!
          </p>
        </div>
      </div>

      {/* Section 4: Fund Types */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">4</div>
          <h2 className="text-xl font-bold text-gray-800">Understanding Fund Types</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[
             { id: 'equity', icon: TrendingUp, name: 'Equity Fund', desc: 'Invests mainly in stocks. Higher risk, higher potential.', color: 'bg-yellow-100 text-yellow-700', details: 'Includes HK, US, Global, Asia equity funds.' },
             { id: 'bond', icon: FileText, name: 'Bond Fund', desc: 'Invests in bonds. Lower risk, stable returns.', color: 'bg-blue-100 text-blue-700', details: 'Global, Asian, or RMB Bond funds.' },
             { id: 'mixed', icon: Scale, name: 'Mixed Assets', desc: 'Mix of stocks & bonds. Balanced approach.', color: 'bg-green-100 text-green-700', details: 'Ranges from 20% to 100% equity allocation.' },
             { id: 'guaranteed', icon: Lock, name: 'Guaranteed', desc: 'Guarantees capital return under conditions.', color: 'bg-purple-100 text-purple-700', details: 'Check conditions carefully (e.g. holding period).' },
             { id: 'conservative', icon: ShieldCheck, name: 'Conservative', desc: 'HKD deposits. Lowest risk.', color: 'bg-indigo-100 text-indigo-700', details: 'Fees deducted directly from returns.' },
             { id: 'money', icon: Coins, name: 'Money Market', desc: 'Short term interest bearing instruments.', color: 'bg-pink-100 text-pink-700', details: 'Similar to conservative but different fee structure.' },
           ].map((fund) => (
             <div 
                key={fund.id}
                onClick={() => setExpandedFund(expandedFund === fund.id ? null : fund.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${expandedFund === fund.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
             >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${fund.color}`}>
                  <fund.icon size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{fund.name}</h3>
                <p className="text-xs text-gray-500">{fund.desc}</p>
                {expandedFund === fund.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-800 font-medium animate-fade-in">
                    {fund.details}
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Section 5: Risk Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">5</div>
          <h2 className="text-xl font-bold text-gray-800">Risk Class Indicator</h2>
        </div>

        <div className="flex flex-col items-center">
            <p className="text-center text-gray-600 mb-8 max-w-lg">
               Funds are rated from 1 (Low Risk) to 7 (High Risk). Higher risk usually means higher potential returns, but also bigger ups and downs.
            </p>

            <div className="flex gap-1 md:gap-2 mb-6 w-full justify-center">
               {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                 let bgClass = '';
                 if (level <= 1) bgClass = 'bg-green-500';
                 else if (level <= 2) bgClass = 'bg-green-400';
                 else if (level <= 3) bgClass = 'bg-green-300';
                 else if (level <= 4) bgClass = 'bg-yellow-400';
                 else if (level <= 5) bgClass = 'bg-orange-400';
                 else if (level <= 6) bgClass = 'bg-red-400';
                 else bgClass = 'bg-red-600';

                 return (
                   <div 
                      key={level}
                      onClick={() => setActiveRisk(level)}
                      className={`
                        w-10 md:w-12 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold cursor-pointer transition-all hover:opacity-80
                        ${bgClass} ${activeRisk === level ? 'ring-4 ring-offset-2 ring-blue-200 scale-110' : ''}
                      `}
                      style={{ height: `${40 + level * 10}px` }}
                   >
                     {level}
                   </div>
                 );
               })}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl text-center min-h-[80px] w-full max-w-lg border border-slate-200">
               {activeRisk ? (
                 <p className="text-sm text-gray-700 animate-fade-in">{riskExplanations[activeRisk]}</p>
               ) : (
                 <p className="text-sm text-gray-400 italic">Click a risk level above to see what it means.</p>
               )}
            </div>
        </div>
      </div>

      {/* Section 6: Fees */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4 relative z-10">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">6</div>
          <h2 className="text-xl font-bold text-gray-800">Understanding Fees</h2>
        </div>

        {/* Wave Animation Background */}
        <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 pointer-events-none">
           <div className="wave absolute bottom-0 w-[200%] h-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
           <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Landmark size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Management Fee</h4>
                <p className="text-xs text-gray-500 mt-1">The main ongoing fee covering trustee, admin, and investment manager services. Usually 0.7% - 1.5%.</p>
              </div>
           </div>
           
           <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex gap-4 items-start">
              <div className="bg-green-100 p-2 rounded-lg text-green-600"><Activity size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Fund Expense Ratio (FER)</h4>
                <p className="text-xs text-gray-500 mt-1">The "price tag" of a fund. Shows total expenses as a percentage of fund size. Lower is generally better!</p>
              </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm flex gap-4 items-start">
              <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Banknote size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Joining Fee</h4>
                <p className="text-xs text-gray-500 mt-1">A one-time fee when joining. Most MPF schemes waive this now.</p>
              </div>
           </div>

           <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex gap-4 items-start">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Lock size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Guarantee Charge</h4>
                <p className="text-xs text-gray-500 mt-1">Specific to Guaranteed Funds. Like an insurance premium for the capital guarantee.</p>
              </div>
           </div>
        </div>

        <div className="mt-6 flex items-start gap-3 bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
           <HelpCircle size={16} className="shrink-0 mt-0.5" />
           <p>
             <strong>Tip:</strong> Default Investment Strategy (DIS) funds have a fee cap. Management fees cannot exceed 0.75%, and out-of-pocket expenses are capped at 0.2%.
           </p>
        </div>
      </div>
    </div>
  );
};

export default MPFExplainedView;
