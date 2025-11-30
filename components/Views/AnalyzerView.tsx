import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Send, FileText, Key, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { UploadedFile, ChatMessage, MPFFund, Scenario } from '../../types';
import ChatBubble from '../Chat/ChatBubble';
import { callKimiAPI, parseResponseForVisualization } from '../../services/moonshotService';
import { getFunds } from '../../services/dataService';
import FundDetailModal from '../Modals/FundDetailModal';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

interface AnalyzedPortfolio {
    sectors: { name: string; value: number; color: string }[];
    riskLevel: string;
    funds: (MPFFund & { allocation: number })[];
}

interface AnalyzerViewProps {
  onScenarioSelect?: (scenario: Scenario) => void;
  isActive?: boolean;
}

const AnalyzerView: React.FC<AnalyzerViewProps> = ({ onScenarioSelect, isActive }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Portfolio Analysis State
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<AnalyzedPortfolio | null>(null);
  
  // Line Chart Filter State
  const [visibleTrendFunds, setVisibleTrendFunds] = useState<Set<string>>(new Set());

  // Fund Sorting State
  const [fundSortType, setFundSortType] = useState<'allocation' | 'return' | 'return3y' | 'return5y' | 'risk'>('allocation');

  // Modal State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [selectedFund, setSelectedFund] = useState<MPFFund | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I'm your MPF assistant. Upload your statement or describe your portfolio, and I'll analyze it using real market data.",
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const allFunds = getFunds();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update visible funds when analysis changes
  useEffect(() => {
    if (portfolioAnalysis) {
        setVisibleTrendFunds(new Set(portfolioAnalysis.funds.map(f => f.constituent_fund)));
    }
  }, [portfolioAnalysis]);

  const toggleFundVisibility = (fundName: string) => {
    setVisibleTrendFunds(prev => {
        const next = new Set(prev);
        if (next.has(fundName)) {
            next.delete(fundName);
        } else {
            next.add(fundName);
        }
        return next;
    });
  };

  const resetFilters = () => {
      if (portfolioAnalysis) {
          setVisibleTrendFunds(new Set(portfolioAnalysis.funds.map(f => f.constituent_fund)));
      }
  };

  const resetPortfolio = () => {
      setPortfolioAnalysis(null);
      setFiles([]);
      setMessages([{
        id: '1',
        sender: 'bot',
        text: "Hello! I'm your MPF assistant. Upload your statement or describe your portfolio, and I'll analyze it using real market data.",
        timestamp: new Date()
      }]);
      setVisibleTrendFunds(new Set());
      setSelectedFund(null);
  };

  // Load liked messages from local storage on mount
  useEffect(() => {
    const savedFeedback = localStorage.getItem('chatFeedback');
    if (savedFeedback) {
        const feedbackMap = JSON.parse(savedFeedback);
        setMessages(prev => prev.map(msg => ({
            ...msg,
            feedback: feedbackMap[msg.id] || null
        })));
    }
  }, []);

  // Handle Feedback (Like/Dislike)
  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => {
        const newMessages = prev.map(msg => 
            msg.id === messageId ? { ...msg, feedback } : msg
        );
        
        // Persist to localStorage
        const feedbackMap = newMessages.reduce((acc, msg) => {
            if (msg.feedback) acc[msg.id] = msg.feedback;
            return acc;
        }, {} as Record<string, string>);
        localStorage.setItem('chatFeedback', JSON.stringify(feedbackMap));
        
        return newMessages;
    });
  };

  // File Upload Handlers
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const uploaded = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setFiles(prev => [...prev, ...uploaded]);
    
    // Simulate OCR processing and Analysis
    setTimeout(() => {
      // Find specific funds to simulate a detected portfolio
      const interestFund = allFunds.find(f => f.constituent_fund.includes('Manulife MPF Interest')) || allFunds[0];
      const stableFund = allFunds.find(f => f.constituent_fund.includes('Manulife MPF Stable')) || allFunds[1];
      const equityFund = allFunds.find(f => f.constituent_fund.includes('Manulife MPF Healthcare')) || allFunds[2];

      const detectedFunds = [
          { ...interestFund, allocation: 40 },
          { ...stableFund, allocation: 35 },
          { ...equityFund, allocation: 25 }
      ];

      // Mock Analysis Data
      const mockAnalysis: AnalyzedPortfolio = {
         sectors: [
             { name: 'Guaranteed', value: 40, color: '#10B981' }, // Low Risk
             { name: 'Stable', value: 35, color: '#F59E0B' }, // Medium Risk
             { name: 'Equity', value: 25, color: '#EF4444' }, // High Risk
         ],
         riskLevel: 'Conservative',
         funds: detectedFunds
      };
      setPortfolioAnalysis(mockAnalysis);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: `I've analyzed ${uploaded.length} file(s). It looks like a conservative portfolio (mostly Stable/Guaranteed funds). Would you like me to suggest some optimization scenarios?`,
        timestamp: new Date()
      }]);

      // Pre-populate input with contextual suggestion
      setInputMessage("How can I optimize my conservative portfolio for higher returns?");
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Modal handlers
  const openApiKeyModal = () => {
    setTempApiKey(apiKey);
    setShowApiKeyModal(true);
  };

  const saveApiKey = () => {
    setApiKey(tempApiKey.trim());
    setShowApiKeyModal(false);
  };

  // Chat Logic
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Create context string from portfolio analysis
      const currentPortfolioContext = portfolioAnalysis 
        ? `Risk Profile: ${portfolioAnalysis.riskLevel}
           Allocations:
           ${portfolioAnalysis.funds.map(f => `- ${f.constituent_fund}: ${f.allocation}%`).join('\n')}`
        : undefined;

      // Extract previously generated scenarios from chat history to maintain context
      const lastScenarioMessage = [...messages].reverse().find(m => m.sender === 'bot' && m.sections?.some(s => s.type === 'scenario'));
      let generatedScenariosContext = '';
      
      if (lastScenarioMessage && lastScenarioMessage.sections) {
        const scenarios = lastScenarioMessage.sections
          .filter(s => s.type === 'scenario' && s.data)
          .map(s => s.data as Scenario);
          
        if (scenarios.length > 0) {
          generatedScenariosContext = scenarios.map(s => 
            `SCENARIO ${s.number} (${s.title}):\n` +
            `Allocations: ${s.allocations.map(a => `${a.fund.constituent_fund} (${a.allocation}%)`).join(', ')}\n` +
            `Stats: FER ${s.weightedFER?.toFixed(2)}%`
          ).join('\n\n');
        }
      }

      // Use all available funds for context to allow cross-scheme recommendations
      const contextFunds = allFunds;

      const responseText = await callKimiAPI(userMsg.text, contextFunds, messages, apiKey, currentPortfolioContext, generatedScenariosContext);
      const { text, scenarios } = parseResponseForVisualization(responseText, contextFunds);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: text,
        timestamp: new Date(),
        sections: scenarios.map(s => ({ type: 'scenario', data: s }))
      };

      setMessages(prev => [...prev, botMsg]);

      // Contextual Suggestion based on AI response
      if (scenarios.length > 0) {
        setTimeout(() => {
            setInputMessage("What are the key risks associated with Scenario 1?");
        }, 500);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: "Sorry, I encountered an error connecting to the analysis service. Please check your API key or try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Prepare data for line chart
  const getTrendData = (funds: MPFFund[]) => {
    const years = [2020, 2021, 2022, 2023, 2024];
    return years.map(year => {
        const item: any = { year: year.toString() };
        funds.forEach(fund => {
            const key = `return_${year}` as keyof MPFFund;
            item[fund.constituent_fund] = fund[key];
        });
        return item;
    });
  };

  // Sort funds helper
  const getSortedFunds = () => {
    if (!portfolioAnalysis) return [];
    return [...portfolioAnalysis.funds].sort((a, b) => {
        if (fundSortType === 'allocation') return b.allocation - a.allocation;
        if (fundSortType === 'return') return b.annualized_return_1y - a.annualized_return_1y;
        if (fundSortType === 'return3y') return b.annualized_return_3y - a.annualized_return_3y;
        if (fundSortType === 'return5y') return b.annualized_return_5y - a.annualized_return_5y;
        if (fundSortType === 'risk') return b.risk_class - a.risk_class;
        return 0;
    });
  };

  const getRiskColor = (risk: number) => {
      if (risk <= 2) return 'bg-green-100 text-green-700 border-green-200';
      if (risk <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-9rem)]">
      {/* Sidebar / Analysis Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
        {/* API Key Banner if needed */}
        {!apiKey && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 flex justify-between items-center">
                <span>API Key required for AI analysis</span>
                <button onClick={openApiKeyModal} className="flex items-center gap-1 font-bold hover:underline">
                    <Key size={12} /> Set Key
                </button>
            </div>
        )}

        {/* File Upload Zone */}
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
        >
            <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700">Drag & drop MPF statements</p>
            <p className="text-xs text-gray-400 mt-1">PDF or Images supported</p>
            <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} id="file-upload" />
            <label htmlFor="file-upload" className="mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                Browse Files
            </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500">
                    Uploaded Files ({files.length})
                </div>
                <div className="max-h-32 overflow-y-auto">
                    {files.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-3 py-2 text-sm border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="truncate max-w-[150px]">{file.name}</span>
                            </div>
                            <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="text-gray-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Portfolio Visualization (Charts) */}
        {portfolioAnalysis && (
            <>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span>Current Portfolio</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{portfolioAnalysis.riskLevel}</span>
                        </h3>
                        <button 
                            onClick={resetPortfolio}
                            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="Reset Portfolio Analysis"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    </div>
                    <div className="h-48 w-full min-w-0 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={portfolioAnalysis.sectors}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {portfolioAnalysis.sectors.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend wrapperStyle={{fontSize: '11px'}} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sortable Fund List */}
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600">Fund Breakdown</span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => setFundSortType('allocation')}
                                    className={`p-1 rounded text-[10px] font-medium transition-colors ${fundSortType === 'allocation' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title="Sort by Allocation"
                                >
                                    Alloc
                                </button>
                                <button 
                                    onClick={() => setFundSortType('return')}
                                    className={`p-1 rounded text-[10px] font-medium transition-colors ${fundSortType === 'return' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title="Sort by 1Y Return"
                                >
                                    1Y
                                </button>
                                <button 
                                    onClick={() => setFundSortType('return3y')}
                                    className={`p-1 rounded text-[10px] font-medium transition-colors ${fundSortType === 'return3y' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title="Sort by 3Y Return"
                                >
                                    3Y
                                </button>
                                <button 
                                    onClick={() => setFundSortType('return5y')}
                                    className={`p-1 rounded text-[10px] font-medium transition-colors ${fundSortType === 'return5y' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title="Sort by 5Y Return"
                                >
                                    5Y
                                </button>
                                <button 
                                    onClick={() => setFundSortType('risk')}
                                    className={`p-1 rounded text-[10px] font-medium transition-colors ${fundSortType === 'risk' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title="Sort by Risk"
                                >
                                    Risk
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {getSortedFunds().map((fund) => {
                                const isVisible = visibleTrendFunds.has(fund.constituent_fund);
                                return (
                                <div 
                                    key={fund.constituent_fund} 
                                    onClick={() => setSelectedFund(fund)}
                                    className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col max-w-[60%]">
                                        <span className="font-medium text-gray-700 truncate group-hover:text-blue-600" title={fund.constituent_fund}>
                                            {fund.constituent_fund}
                                        </span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className={`text-[9px] px-1 rounded-sm border ${getRiskColor(fund.risk_class)}`}>
                                                R{fund.risk_class}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                • 1Y: <span className={fund.annualized_return_1y >= 0 ? 'text-green-600' : 'text-red-600'}>{fund.annualized_return_1y.toFixed(1)}%</span>
                                                {fundSortType === 'return3y' && (
                                                     <> • 3Y: <span className={fund.annualized_return_3y >= 0 ? 'text-green-600' : 'text-red-600'}>{fund.annualized_return_3y.toFixed(1)}%</span></>
                                                )}
                                                {fundSortType === 'return5y' && (
                                                     <> • 5Y: <span className={fund.annualized_return_5y >= 0 ? 'text-green-600' : 'text-red-600'}>{fund.annualized_return_5y.toFixed(1)}%</span></>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFundVisibility(fund.constituent_fund);
                                            }}
                                            className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isVisible ? 'text-blue-500' : 'text-gray-300'}`}
                                            title={isVisible ? "Hide from chart" : "Show on chart"}
                                        >
                                            {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                                        </button>
                                        <div className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-blue-50 group-hover:text-blue-700">
                                            {fund.allocation}%
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Historical Trends Chart */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <div className="flex items-center gap-2">
                             <h3 className="text-sm font-bold text-gray-800">Historical Performance (5Y)</h3>
                             <button onClick={resetFilters} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Reset Filters">
                                <RotateCcw size={12} />
                             </button>
                        </div>
                        
                        {/* Fund Filter Toggles */}
                        <div className="flex flex-wrap gap-2">
                            {portfolioAnalysis.funds.map((fund, i) => {
                                const isVisible = visibleTrendFunds.has(fund.constituent_fund);
                                const color = CHART_COLORS[i % CHART_COLORS.length];
                                const simpleName = fund.constituent_fund;
                                
                                return (
                                    <button
                                        key={fund.constituent_fund}
                                        onClick={() => toggleFundVisibility(fund.constituent_fund)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-200
                                            ${isVisible 
                                                ? 'bg-white border-gray-200 shadow-sm text-gray-700' 
                                                : 'bg-gray-100 border-transparent text-gray-400 opacity-60'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full transition-transform duration-200 ${isVisible ? 'scale-100' : 'scale-75'}`} style={{ backgroundColor: isVisible ? color : '#9CA3AF' }}></span>
                                        {simpleName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="h-64 w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getTrendData(portfolioAnalysis.funds)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="year" 
                                    tick={{fontSize: 10, fill: '#6B7280'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    padding={{ left: 10, right: 10 }}
                                />
                                <YAxis 
                                    tick={{fontSize: 10, fill: '#6B7280'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    unit="%" 
                                    width={35} 
                                />
                                <RechartsTooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const dataPoint = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg text-xs z-50">
                                                    <p className="font-bold mb-2 text-gray-800 border-b border-gray-100 pb-1">Year {label}</p>
                                                    <div className="space-y-1">
                                                    {portfolioAnalysis.funds.map((f, idx) => (
                                                        <div key={f.constituent_fund} className="flex justify-between gap-4 items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span 
                                                                    className="w-2 h-2 rounded-full" 
                                                                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                                                />
                                                                <span className={`max-w-[120px] truncate ${visibleTrendFunds.has(f.constituent_fund) ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                                    {f.constituent_fund}
                                                                </span>
                                                            </div>
                                                            <span className="font-mono font-semibold">
                                                                {dataPoint[f.constituent_fund]?.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {portfolioAnalysis.funds.map((fund, i) => (
                                    visibleTrendFunds.has(fund.constituent_fund) && (
                                        <Line 
                                            key={fund.constituent_fund}
                                            type="monotone" 
                                            dataKey={fund.constituent_fund} 
                                            name={fund.constituent_fund}
                                            stroke={CHART_COLORS[i % CHART_COLORS.length]} 
                                            strokeWidth={2.5}
                                            dot={{r: 3, fill: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 0}}
                                            activeDot={{r: 5, strokeWidth: 2, stroke: '#fff'}}
                                            animationDuration={1000}
                                        />
                                    )
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </>
        )}
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-hide">
            {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} onFeedback={handleFeedback} onScenarioSelect={onScenarioSelect} />
            ))}
            {isTyping && (
                <div className="flex justify-start w-full animate-pulse">
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none text-gray-400 text-sm">
                        Analyzing market data...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask for optimization advice..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
             {!apiKey && (
                <p className="text-[10px] text-center text-gray-400 mt-2">
                    Using demo mode. <button onClick={openApiKeyModal} className="text-blue-600 hover:underline">Set Custom API Key</button>
                </p>
            )}
        </div>
      </div>

      {/* Fund Detail Modal */}
      {selectedFund && <FundDetailModal fund={selectedFund} onClose={() => setSelectedFund(null)} />}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Configuration</h3>
                <p className="text-sm text-gray-500 mb-4">Enter your Moonshot AI API key to enable analysis features.</p>
                <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveApiKey} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Key</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzerView;