/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  ShoppingCart, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  MessageSquare, 
  Database, 
  Send, 
  ChevronRight, 
  ArrowRight, 
  FileDown, 
  Clock, 
  Briefcase, 
  RefreshCw, 
  Settings, 
  Gauge, 
  Layers, 
  DollarSign, 
  HeartPulse, 
  User, 
  Building, 
  Sparkles,
  Info,
  Check,
  X,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import { Asset, ChatMessage, YearlyStats } from './types';

export default function App() {
  // Brand customization state (User prompt requirement: 5 Corporate AI product names)
  const productNames = [
    { name: 'APEX-Agent', label: '企业资产置换与大修智能裁决体', desc: '德勤推荐 - 重点关注设备生命周期经济效能与安全红线' },
    { name: 'AssetIntellect AI', label: '企业资产全生命周期智能决策平台', desc: '埃森哲级 - 全系统数据打通与多维度量化评估' },
    { name: 'DecisIQ Asset', label: '高价值工业资产智能重置校验平台', desc: '麦肯锡风格 - 专注于LCC（总拥有成本）财务决策建模' },
    { name: 'Resilex Enterprise', label: '工业资产韧性管理与更换决策系统', desc: '工业4.0专精 - 侧重故障率指数分析与一票否决指标' },
    { name: 'ValorLifecycle', label: '设备生命周期价值工程决策平台', desc: '精细化管理 - 杜绝渐进式超额大修黑洞' }
  ];
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const currentProduct = productNames[selectedProductIdx];

  // Global state for industrial assets
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('EQ-2026-001');
  const [loadingAssets, setLoadingAssets] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'decision' | 'lcc' | 'chat' | 'report' | 'architecture'>('dashboard');

  // UI state
  const [approverName, setApproverName] = useState('刘华 (设备部总监)');
  const [approvalComment, setApprovalComment] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [reportText, setReportText] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);

  // Chatbot state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // LCC custom interactive variables
  const [extendYears, setExtendYears] = useState(2);
  const [efficiencyBoost, setEfficiencyBoost] = useState(30);
  const [downtimeCostHour, setDowntimeCostHour] = useState(4500);

  // Fetch initial assets list from API
  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
    } finally {
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Sync selected asset detail or fetch report when selected asset changes
  const activeAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  useEffect(() => {
    if (activeAsset) {
      setReportText(activeAsset.aiDetailedReport || '');
      // Initialize chat context on asset switch
      setChatMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `您好！我是 **APEX-Agent** 智能资产评估顾问。我已加载了本厂的核心高价值设备档案。
          
当前为您深度对焦：**${activeAsset.name} (${activeAsset.id})**
- **当前账面值**: ¥${activeAsset.bookValue.toLocaleString()} 元（原值 ¥${activeAsset.originalValue.toLocaleString()} 元）
- **故障现状**: ${activeAsset.currentIssue}
- **决策建议**: 倾向于【**${activeAsset.aiRecommendation === 'replace' ? '新置换采购' : '大修恢复'}**】（AI健康指数 ${activeAsset.healthIndex}分）

关于该设备的财务经济学、技术折旧规律、安全年检合规或是5年生命周期总成本（LCC），您可以随时向我提问。我将为您生成咨询专家级的分析思路。`,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      // Sync slider controllers to selected asset values
      setExtendYears(activeAsset.remainingUsefulLife);
      setDowntimeCostHour(activeAsset.downtimeCostPerClass);
    }
  }, [selectedAssetId, assets.length]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle asset approval action
  const handleApprove = async (action: 'repair' | 'replace') => {
    if (!activeAsset) return;
    setSubmittingApproval(true);
    try {
      const res = await fetch(`/api/assets/${activeAsset.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          user: approverName,
          comment: approvalComment || `批准${action === 'repair' ? '大修方案' : '置换采购方案'}`
        })
      });
      if (res.ok) {
        const result = await res.json();
        // Update local asset array
        setAssets(prev => prev.map(a => a.id === activeAsset.id ? result.asset : a));
        setApprovalComment('');
        // Trigger modal state success notification or quick success prompt
        alert(`审批流成功送达！已批准设备 ${activeAsset.id} 执行: ${action === 'repair' ? '专业大修' : '报废折旧与新购置换'}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Generate / Refresh AI Advisory report via server Gemini SDK
  const handleGenerateReport = async () => {
    if (!activeAsset) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/assets/${activeAsset.id}/generate-report`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setReportText(data.report);
        // Sync back to local assets state
        setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, aiDetailedReport: data.report } : a));
      } else {
        alert('AI 生成报告超时，已为您展示系统预制的埃森哲高级咨询报告。');
        setReportText(activeAsset.aiDetailedReport || '');
      }
    } catch (e) {
      console.error(e);
      alert('AI 诊断报告生成失败。');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Handle chatbot send message to backend Gemini
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setSendingChat(true);

    try {
      const nextMessages = [...chatMessages.filter(m => m.id !== 'welcome'), userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/assets/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          currentAssetId: activeAsset?.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        content: `连接专家模型异常。根据本地预案，设备 **${activeAsset.name}** 当前处于 **${activeAsset.safetyRisk === 'high' ? '高风险带病运行' : '机械磨损耗损期'}**。其重置比例过高。建议您优先使用上方“AI分析报告”标签卡查看该资产的5年总拥有成本 LCC 仿真表格。`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Calculate customized LCC comparison based on activeAsset and user dynamic input sliders
  const calculateLccSim = () => {
    if (!activeAsset) return { repairLcc: [], replaceLcc: [] };
    
    // Baseline over 5 years
    const repairLcc = [];
    const replaceLcc = [];
    
    let cumulativeRepair = 0;
    let cumulativeReplace = 0;

    for (let i = 1; i <= 5; i++) {
      // Year by Year repair simulation
      const baseYearlyRepair = activeAsset.estimatedRepairCost / 5;
      const escalationFactor = 1 + (i * 0.15); // repairs get 15% more expensive each year due to fatigue
      const yearlyDowntimeLoss = (activeAsset.downtimeHoursPastYear * (1 + i * 0.1)) * downtimeCostHour / 5; // downtime grows
      const yearlyOpCost = activeAsset.annualOperatingCost * 1.05; // 5% energy inflation
      
      const yearRepairCapEx = i === 1 ? activeAsset.estimatedRepairCost : 0;
      const yearRepairOpEx = baseYearlyRepair * escalationFactor + yearlyDowntimeLoss + yearlyOpCost;
      cumulativeRepair += yearRepairCapEx + yearRepairOpEx;

      // Year by Year replacement simulation
      const yearReplaceCapEx = i === 1 ? (activeAsset.newPurchasePrice - activeAsset.salvageValue) : 0;
      const efficiencySavingRate = (100 - efficiencyBoost) / 100;
      const yearReplaceOpEx = (activeAsset.newAnnualOperatingCost * efficiencySavingRate) + (activeAsset.downtimeHoursPastYear * 0.05 * downtimeCostHour); // downtime cut to 5%
      cumulativeReplace += yearReplaceCapEx + yearReplaceOpEx;

      repairLcc.push({
        year: `第${i}年`,
        '维修与老旧留用': Math.round(cumulativeRepair),
        '累计停机损失': Math.round(yearlyDowntimeLoss * i),
      });

      replaceLcc.push({
        year: `第${i}年`,
        '新购与置换升级': Math.round(cumulativeReplace),
        '累计停机损失': Math.round(activeAsset.downtimeHoursPastYear * 0.05 * downtimeCostHour * i),
      });
    }

    return { repairLcc, replaceLcc, totalSaved: Math.round(cumulativeRepair - cumulativeReplace) };
  };

  const lccSim = calculateLccSim();

  // Simple Markdown to beautiful HTML elements parser for report visualization
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-gray-400">正在等待 AI 引擎生成报告...</p>;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="font-display font-bold text-2xl text-brand-primary border-b border-gray-200 pb-2 mt-8 mb-4">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-sans font-semibold text-lg text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        const item = line.replace('- ', '');
        const splitIndex = item.indexOf(':');
        if (splitIndex !== -1) {
          const boldPart = item.substring(0, splitIndex + 1);
          const normalPart = item.substring(splitIndex + 1);
          return (
            <li key={idx} className="list-disc ml-6 mb-2 text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-900">{boldPart}</strong>{normalPart}
            </li>
          );
        }
        return <li key={idx} className="list-disc ml-6 mb-2 text-sm text-gray-600 leading-relaxed">{item}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      return <p key={idx} className="text-sm text-gray-600 leading-relaxed mb-3">{line}</p>;
    });
  };

  if (loadingAssets) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-md text-center">
          <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
          <h2 className="text-xl font-display font-medium text-slate-800 mb-2">APEX-Agent 资产智能核算内核启动中</h2>
          <p className="text-sm text-slate-500">正在连接企业 ERP / EAM 资产台账与 AI 决策规则引擎...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-teal-100">
      
      {/* Dynamic Top Announcement Consulting Bar */}
      <div className="bg-[#0A2540] text-[#00D4B2] text-xs font-mono px-4 py-2 flex flex-col sm:flex-row justify-between items-center border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>CONSULTING CAPABILITY STATE: ACTIVE (DELOITTE HYBRID CORE)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>AI DECISION AGENT CONNECTED: GEMINI-3.5-FLASH</span>
          <span>DATE: 2026-07-14</span>
        </div>
      </div>

      {/* Main Corporate Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-[#0A2540] to-teal-900 p-2.5 rounded-lg text-white shadow-md">
              <Cpu className="h-6 w-6 text-[#00D4B2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold tracking-tight text-[#0A2540]">
                  {currentProduct.name}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  智能决策代理
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans font-normal">
                {currentProduct.label} <span className="text-slate-300">|</span> 咨询交付模型
              </p>
            </div>
          </div>

          {/* Product Brand Preset Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-slate-500 font-medium px-2 shrink-0">产品定位预设:</span>
            {productNames.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelectedProductIdx(i)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all shrink-0 ${
                  selectedProductIdx === i 
                    ? 'bg-[#0A2540] text-[#00D4B2] shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* App Body Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar (Collapsible/Vertical for elite consult layout) */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">资产分析与决策模块</h3>
            <nav className="flex flex-col gap-1.5">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4.5 w-4.5" />
                  <span>智能决策看板</span>
                </div>
                <span className="text-xs font-mono opacity-80">Dashboard</span>
              </button>

              <button 
                onClick={() => setActiveTab('decision')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'decision' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>重置大修决策中心</span>
                </div>
                <span className="text-xs font-mono bg-amber-100 text-amber-800 px-1.5 rounded-sm">
                  {assets.filter(a => a.status === 'pending').length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('lcc')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'lcc' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span>生命周期 LCC 仿真</span>
                </div>
                <span className="text-xs font-mono opacity-80">Simulation</span>
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span>AI 决策咨询顾问</span>
                </div>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-1.5 rounded-sm">Agent</span>
              </button>

              <button 
                onClick={() => setActiveTab('report')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'report' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4.5 w-4.5" />
                  <span>AI 咨询分析报告</span>
                </div>
                <span className="text-xs font-mono opacity-80">Deloitte</span>
              </button>

              <button 
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'architecture' 
                    ? 'bg-[#0A2540] text-[#00D4B2]' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4.5 w-4.5" />
                  <span>全系统对接与架构</span>
                </div>
                <span className="text-xs font-mono opacity-80">Config</span>
              </button>
            </nav>
          </div>

          {/* Quick Selection List for active equipment */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">选择对焦评估设备</h3>
            <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 max-h-[300px] pr-1">
              {assets.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-slate-50 border-[#00D4B2] ring-1 ring-[#00D4B2]' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">{asset.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase ${
                        asset.status === 'pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : asset.status === 'repair_approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-[#0A2540] text-[#00D4B2]'
                      }`}>
                        {asset.status === 'pending' ? '待审批' : asset.status === 'repair_approved' ? '批准大修' : '批准新购'}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 mt-1 truncate">{asset.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{asset.department} · {asset.category}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">AI推荐:</span>
                      <span className={`font-semibold ${asset.aiRecommendation === 'replace' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {asset.aiRecommendation === 'replace' ? '置换重置' : '中修保养'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Active Asset Banner Profile Display */}
          {activeAsset && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm border border-slate-700 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Wrench className="h-32 w-32" />
              </div>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs px-2 py-0.5 rounded-md font-bold">
                      {activeAsset.id}
                    </span>
                    <span className="text-xs text-slate-400">{activeAsset.category}</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-[#00D4B2] tracking-tight">{activeAsset.name}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-xl">
                    <strong className="text-white">申报故障:</strong> {activeAsset.currentIssue}
                  </p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-5 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>所属部门:</span>
                    <span className="text-white font-medium">{activeAsset.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>型号规格:</span>
                    <span className="text-white font-mono">{activeAsset.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>服役时限:</span>
                    <span className="text-white font-medium">{activeAsset.purchaseDate}（已服役 {new Date().getFullYear() - new Date(activeAsset.purchaseDate).getFullYear()}年）</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subview TAB 1: 📊 Dashboard (决策仪表盘) */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* McKinsey Style KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase text-slate-400 font-medium">今日待审资产</p>
                    <h3 className="text-2xl font-display font-bold text-slate-800 mt-1">
                      {assets.filter(a => a.status === 'pending').length} <span className="text-xs font-normal text-slate-500">台机组</span>
                    </h3>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase text-slate-400 font-medium">AI 推荐置换新购</p>
                    <h3 className="text-2xl font-display font-bold text-rose-600 mt-1">
                      {assets.filter(a => a.aiRecommendation === 'replace').length} <span className="text-xs font-normal text-slate-500">台机组</span>
                    </h3>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg text-rose-600">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase text-slate-400 font-medium">AI 推荐大修保养</p>
                    <h3 className="text-2xl font-display font-bold text-emerald-600 mt-1">
                      {assets.filter(a => a.aiRecommendation === 'repair').length} <span className="text-xs font-normal text-slate-500">台机组</span>
                    </h3>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                    <Wrench className="h-6 w-6" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase text-slate-400 font-medium">安监一票否决(红线)</p>
                    <h3 className="text-2xl font-display font-bold text-red-600 mt-1">
                      {assets.filter(a => a.safetyRisk === 'high').length} <span className="text-xs font-normal text-slate-500">台重大隐患</span>
                    </h3>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg text-red-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Deloitte Enterprise Value metrics card */}
              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 border border-slate-800">
                <div className="md:col-span-4 border-b border-slate-800 pb-2 mb-2">
                  <h4 className="text-[#00D4B2] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> APEX AI-Decision Agent 企业级价值量化收益
                  </h4>
                </div>
                <div className="border-r border-slate-800 pr-4">
                  <h5 className="text-2xl font-display font-bold text-[#00D4B2]">降低 5% - 10%</h5>
                  <p className="text-xs text-slate-400 mt-1">无效或过度维修开支损失，拦截盲目大修黑洞</p>
                </div>
                <div className="border-r border-slate-800 pr-4">
                  <h5 className="text-2xl font-display font-bold text-[#00D4B2]">缩短 60% 以上</h5>
                  <p className="text-xs text-slate-400 mt-1">多部门论证和审批决策链，缩短审批流搁置时间</p>
                </div>
                <div className="border-r border-slate-800 pr-4">
                  <h5 className="text-2xl font-display font-bold text-[#00D4B2]">100% 透明</h5>
                  <p className="text-xs text-slate-400 mt-1">设备全生命周期拥有成本，彻底打通系统孤岛</p>
                </div>
                <div>
                  <h5 className="text-2xl font-display font-bold text-rose-500">100% 安全预警</h5>
                  <p className="text-xs text-slate-400 mt-1">杜绝特种合规逾期、漏电、高热等“带病运行”隐患</p>
                </div>
              </div>

              {/* Core Visualized Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Maintenance Blackhole Visualizer */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">累计维修费用与设备原值重置比</h3>
                      <p className="text-xs text-slate-500">当累计维修额度逼近或超出原值，资产已属于经济性崩溃态</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      管理黑洞拦截器
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={assets.map(a => ({
                          id: a.id.substring(8), // just show number e.g. 001
                          name: a.name.substring(0, 5) + '...',
                          '设备原值': a.originalValue,
                          '历史累计维修费': a.cumulativeRepairCost,
                          '本次预计大修费': a.estimatedRepairCost
                        }))}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="id" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(val) => `¥${(val/10000)}万`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => `¥${Number(value).toLocaleString()}元`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="设备原值" fill="#0A2540" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="历史累计维修费" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="本次预计大修费" fill="#FF5A5F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Downtime Cost Impact Chart */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">各待审机组过去一年停机生产损失</h3>
                      <p className="text-xs text-slate-500">停机带来的间接价值损失（停工时长 × 单位损失）</p>
                    </div>
                    <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono">
                      生产力流失率
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={assets.map(a => ({
                          id: a.id.substring(8),
                          name: a.name.substring(0, 5),
                          '年停机小时': a.downtimeHoursPastYear,
                          '生产价值损失(元)': a.downtimeHoursPastYear * a.downtimeCostPerClass
                        }))}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D4B2" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00D4B2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="id" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tickFormatter={(val) => `${val}h`} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `¥${val/10000}万`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()}`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area yAxisId="right" type="monotone" dataKey="生产价值损失(元)" stroke="#00D4B2" fillOpacity={1} fill="url(#colorLoss)" />
                        <Line yAxisId="left" type="monotone" dataKey="年停机小时" stroke="#FF5A5F" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Deloitte style Today's Critical Cases summary table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-sm text-slate-800">资产置换与大修辅助决策流水线</h3>
                  <button 
                    onClick={() => setActiveTab('decision')}
                    className="text-xs text-[#0A2540] hover:text-teal-600 font-medium flex items-center gap-1"
                  >
                    前往智能审批中心 <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="p-3 font-semibold text-slate-700">编号</th>
                        <th className="p-3 font-semibold text-slate-700">设备名称</th>
                        <th className="p-3 font-semibold text-slate-700">本次故障严重性</th>
                        <th className="p-3 font-semibold text-slate-700">本次预计大修费</th>
                        <th className="p-3 font-semibold text-slate-700">重置新购费</th>
                        <th className="p-3 font-semibold text-slate-700">健康指数</th>
                        <th className="p-3 font-semibold text-slate-700">AI 判定结果</th>
                        <th className="p-3 font-semibold text-slate-700">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-500">{asset.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{asset.name}</td>
                          <td className="p-3 max-w-xs truncate text-slate-500">{asset.currentIssue}</td>
                          <td className="p-3 font-medium">¥{asset.estimatedRepairCost.toLocaleString()}</td>
                          <td className="p-3 font-medium">¥{asset.newPurchasePrice.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold font-mono ${
                              asset.healthIndex > 70 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : asset.healthIndex > 45 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {asset.healthIndex} / 100
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              asset.aiRecommendation === 'replace' ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {asset.aiRecommendation === 'replace' ? (
                                <><ShoppingCart className="h-3.5 w-3.5" /> 建议新购置换</>
                              ) : (
                                <><Wrench className="h-3.5 w-3.5" /> 建议大修留用</>
                              )}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              asset.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : asset.status === 'repair_approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-800 text-[#00D4B2]'
                            }`}>
                              {asset.status === 'pending' ? '待评审' : asset.status === 'repair_approved' ? '已批准大修' : '已批准更换'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Subview TAB 2: 🔍 AI Decision Page (重置大修决策中心) */}
          {activeTab === 'decision' && activeAsset && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Equipment Stats & Health Gauges */}
              <div className="md:col-span-1 flex flex-col gap-6">
                
                {/* Health & Recommendation Index Gauge Cards */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
                  <h4 className="text-slate-500 text-xs font-mono uppercase font-bold tracking-wide mb-3">资产实时健康评级</h4>
                  <div className="relative flex items-center justify-center mb-3">
                    {/* SVG Circular Ring Gauge */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                      <circle cx="64" cy="64" r="54" stroke={activeAsset.healthIndex > 60 ? '#10B981' : activeAsset.healthIndex > 40 ? '#F59E0B' : '#EF4444'} strokeWidth="8" fill="transparent" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * activeAsset.healthIndex) / 100} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-display font-extrabold text-slate-800">{activeAsset.healthIndex}</span>
                      <span className="text-[10px] text-slate-400 font-medium">满分 100</span>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    activeAsset.healthIndex > 60 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : activeAsset.healthIndex > 40 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {activeAsset.healthIndex > 60 ? '技术状态安全可靠' : activeAsset.healthIndex > 40 ? '中度材料退化损伤' : '重度系统疲劳失效'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
                  <h4 className="text-slate-500 text-xs font-mono uppercase font-bold tracking-wide mb-3">AI 维修可行性评分</h4>
                  <div className="relative flex items-center justify-center mb-3">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                      <circle cx="64" cy="64" r="54" stroke={activeAsset.aiScore && activeAsset.aiScore > 50 ? '#10B981' : '#EF4444'} strokeWidth="8" fill="transparent" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * (activeAsset.aiScore || 50)) / 100} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-display font-extrabold text-slate-800">{activeAsset.aiScore}</span>
                      <span className="text-[10px] text-slate-400 font-medium">评分越低越倾向采购</span>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    activeAsset.aiRecommendation === 'replace' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activeAsset.aiRecommendation === 'replace' ? '一键置换最佳' : '支持大修恢复'}
                  </span>
                </div>

                {/* Safety Danger Highlight Panel */}
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  activeAsset.safetyRisk === 'high' 
                    ? 'bg-red-50 border-red-200 text-red-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${activeAsset.safetyRisk === 'high' ? 'text-red-600' : 'text-slate-500'}`} />
                    <h5 className="font-bold text-xs uppercase font-mono">重大生产与安全红线核算</h5>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{activeAsset.safetyRiskReason}</p>
                </div>

              </div>

              {/* Right Column (Span 2): Side-by-Side Financial & Safety Comparison Report */}
              <div className="md:col-span-2 flex flex-col gap-6">
                
                {/* Side-by-Side Comparison Grid */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                    <h3 className="font-display font-bold text-base text-slate-800">维修恢复 VS 新购置换多维度比对表</h3>
                    <span className="text-xs bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md font-medium">数据实时提取</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs font-sans mb-3">
                    <div className="col-span-1 text-slate-400 font-medium py-1">决策指标</div>
                    <div className="col-span-1 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-t-md text-center">方案一：执行中大修</div>
                    <div className="col-span-1 text-slate-900 font-bold bg-slate-100 px-3 py-1.5 rounded-t-md text-center">方案二：采购新机替代</div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs font-sans">
                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">首期一次性投入资金</div>
                      <div className="col-span-1 text-center font-bold text-slate-800">¥{activeAsset.estimatedRepairCost.toLocaleString()} 元</div>
                      <div className="col-span-1 text-center font-bold text-[#0A2540] bg-slate-50 py-1 rounded">¥{(activeAsset.newPurchasePrice - activeAsset.salvageValue).toLocaleString()} 元 <p className="text-[10px] text-slate-400 font-normal mt-0.5">（扣除残值补回）</p></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">重置及大修成本比例</div>
                      <div className="col-span-1 text-center font-semibold text-rose-600">¥{activeAsset.cumulativeRepairCost.toLocaleString()} 元 <p className="text-[10px] text-slate-400 font-normal mt-0.5">（累计已占原值 {(activeAsset.cumulativeRepairCost/activeAsset.originalValue * 100).toFixed(1)}%）</p></div>
                      <div className="col-span-1 text-center text-slate-500 font-medium">重置投资比例 100%</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">预计可延长安全服役期</div>
                      <div className="col-span-1 text-center text-amber-600 font-semibold">{activeAsset.remainingUsefulLife} 年 <p className="text-[10px] text-slate-400 font-normal mt-0.5">（继续损耗疲劳）</p></div>
                      <div className="col-span-1 text-center text-emerald-600 font-bold">10.0 年 <p className="text-[10px] text-slate-400 font-normal mt-0.5">（黄金服役期）</p></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">5年均度维保及能耗</div>
                      <div className="col-span-1 text-center text-slate-600">¥{activeAsset.annualOperatingCost.toLocaleString()} 元 / 年</div>
                      <div className="col-span-1 text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded">¥{activeAsset.newAnnualOperatingCost.toLocaleString()} 元 / 年 <p className="text-[10px] text-emerald-500 font-normal mt-0.5">（降低能耗电损）</p></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">计划外突然停机概率</div>
                      <div className="col-span-1 text-center text-rose-600 font-bold">极高 (约 25% ~ 40% 每年)</div>
                      <div className="col-span-1 text-center text-emerald-600 font-bold">极低 (小于 1.5% 每年)</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 items-center">
                      <div className="col-span-1 text-slate-500 font-semibold">安监合规及法律诉讼风险</div>
                      <div className="col-span-1 text-center text-rose-600 font-bold">
                        {activeAsset.safetyRisk === 'high' ? '一票否决(违规带病)' : '中低度受控风险'}
                      </div>
                      <div className="col-span-1 text-center text-emerald-600 font-bold">零风险 (完全合规过年检)</div>
                    </div>
                  </div>
                </div>

                {/* AI Verdict Explanation Banner */}
                <div className="bg-gradient-to-tr from-[#0A2540] to-slate-800 text-white rounded-xl p-5 shadow-md relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-[#00D4B2]" />
                    <span className="text-[#00D4B2] font-mono text-xs uppercase font-bold tracking-wider">APEX-Agent 智能推荐裁定结论</span>
                  </div>
                  <h4 className="text-lg font-display font-bold mb-2 flex items-center gap-1.5">
                    判定方案：{activeAsset.aiRecommendation === 'replace' ? (
                      <span className="text-red-400 flex items-center gap-1"><ShoppingCart className="h-5 w-5" /> 【建议采购全新设备置换】</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1"><Wrench className="h-5 w-5" /> 【建议执行正厂精细大修】</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {activeAsset.aiReason}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button 
                      onClick={() => setActiveTab('report')}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold px-3 py-1.5 rounded transition"
                    >
                      查看 AI 深度咨询报告
                    </button>
                    <button 
                      onClick={() => setActiveTab('lcc')}
                      className="text-[#00D4B2] text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                      5年 LCC 成本仿真模拟器 <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Actionable Approval Form */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-display font-bold text-sm text-slate-800 mb-3">资产全生命周期决策会签会审</h3>
                  
                  {activeAsset.status !== 'pending' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span>本轮审批已裁决执行完毕</span>
                      </div>
                      <div className="text-xs text-slate-500 font-sans">
                        {activeAsset.approvalHistory && activeAsset.approvalHistory.length > 0 ? (
                          activeAsset.approvalHistory.map((history, i) => (
                            <div key={i} className="border-l-2 border-emerald-500 pl-3 py-1 mt-1">
                              <p className="font-semibold text-slate-800">{history.action} - 审核人: {history.user} ({history.date})</p>
                              <p className="text-slate-500 mt-0.5 font-normal">批注: {history.comment}</p>
                            </div>
                          ))
                        ) : (
                          <p>审核人: 刘华 (设备部总监) | 批注: 已遵照 AI Agent 的综合 LCC 经济测算结果与安全否决规范批准该单流程。</p>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          // Reset for demonstration to let them approve again
                          setAssets(prev => prev.map(a => a.id === activeAsset.id ? { ...a, status: 'pending', approvalHistory: [] } : a));
                        }}
                        className="text-[11px] text-[#0A2540] hover:underline text-left mt-2"
                      >
                        [重置测试] 重新启用审批流程进行测试
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">审批会签角色 / 账号</label>
                          <select 
                            value={approverName}
                            onChange={(e) => setApproverName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-medium"
                          >
                            <option value="刘华 (设备部总监)">刘华 (设备部总监)</option>
                            <option value="张明 (财务结算部长)">张明 (财务结算部长)</option>
                            <option value="赵德顺 (生产副总经理)">赵德顺 (生产副总经理)</option>
                            <option value="王伟 (动力能源科科长)">王伟 (动力能源科科长)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">辅助决策建议输入</label>
                          <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] rounded px-2.5 py-1.5 w-full font-semibold">
                            与 {currentProduct.name} 算法及安全年检规定100%校正
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">财务审计与安监批注意见 (建议一键采纳AI推荐结论)</label>
                        <textarea
                          rows={2}
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          placeholder={`例如: 已遵照 ${currentProduct.name} 全拥有成本(LCC)仿真模型，并充分考虑一票否决安全红线。${activeAsset.aiRecommendation === 'replace' ? '批准淘汰老旧高耗机组，提报设备部办理新置换采购。' : '批准本次精密大修方案，督促车间落实二级保养。'}`}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 font-sans"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => handleApprove('repair')}
                          disabled={submittingApproval}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                        >
                          <Wrench className="h-4 w-4" /> 批准执行：专业大修恢复
                        </button>
                        <button
                          onClick={() => handleApprove('replace')}
                          disabled={submittingApproval}
                          className="flex-1 bg-[#0A2540] hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                        >
                          <ShoppingCart className="h-4 w-4 text-[#00D4B2]" /> 批准执行：折旧报废与采购置换
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Subview TAB 3: 📈 Lifecycle LCC Analyzer (生命周期成本分析) */}
          {activeTab === 'lcc' && activeAsset && (
            <div className="flex flex-col gap-6">
              
              {/* Top Custom Sliders Panel */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-b border-slate-100 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-800">全拥有成本 (LCC) 交互式仿真模型</h3>
                  <p className="text-xs text-slate-500">调整资产假设，实时计算 5 年周期的多维经济模型差异，发现过度维修的利润黑洞</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">预计大修可再服役寿命</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.5"
                      value={extendYears} 
                      onChange={(e) => setExtendYears(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00D4B2]"
                    />
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">{extendYears}年</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">超过此年限设备材料极可能深度疲劳</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">新购机组节能与能耗效率提升</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="10" 
                      max="60" 
                      step="5"
                      value={efficiencyBoost} 
                      onChange={(e) => setEfficiencyBoost(parseInt(e.target.value))}
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00D4B2]"
                    />
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">{efficiencyBoost}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">降低耗电、备件与维护工时开支</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">计划外故障停产损失单价</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1000" 
                      max="15000" 
                      step="500"
                      value={downtimeCostHour} 
                      onChange={(e) => setDowntimeCostHour(parseInt(e.target.value))}
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00D4B2]"
                    />
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">¥{downtimeCostHour}/h</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">考虑上下游生产停滞与交货违约罚金</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex flex-col justify-center border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">5年总折旧与能耗节约</span>
                  <span className={`text-xl font-display font-extrabold ${lccSim.totalSaved > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {lccSim.totalSaved > 0 ? `省 ¥${lccSim.totalSaved.toLocaleString()} 元` : `亏 ¥${Math.abs(lccSim.totalSaved).toLocaleString()} 元`}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {lccSim.totalSaved > 0 ? '置换方案具有极高经济回报' : '当前保留维修方案更具优势'}
                  </p>
                </div>
              </div>

              {/* LCC Simulation Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LCC Chart 1: Cumulative LCC Path */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">5年累计拥有总成本 (LCC) 递增趋势</h3>
                      <p className="text-xs text-slate-500">含初期购买/修缮开支、年度能耗运行以及故障停机连带损失</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" allowDuplicatedCategory={false} />
                        <YAxis tickFormatter={(val) => `¥${val/10000}万`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => `¥${Number(value).toLocaleString()}元`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        
                        {/* Use real mapped simulation arrays */}
                        <Line data={lccSim.repairLcc} type="monotone" name="方案一：老旧留用大修" dataKey="维修与老旧留用" stroke="#FF5A5F" strokeWidth={3} dot={{ r: 4 }} />
                        <Line data={lccSim.replaceLcc} type="monotone" name="方案二：采购新机置换" dataKey="新购与置换升级" stroke="#00D4B2" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* LCC Chart 2: Downtime Cost Leakage */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">两种方案下的累积非计划停机损失对比</h3>
                      <p className="text-xs text-slate-500">老化设备故障频度上升造成的非计划停机损失 VS 新设备在质保期极低停机</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" allowDuplicatedCategory={false} />
                        <YAxis tickFormatter={(val) => `¥${val/10000}万`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => `¥${Number(value).toLocaleString()}元`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar data={lccSim.repairLcc} name="大修方案累计停机损失" dataKey="累计停机损失" fill="#FF5A5F" radius={[4, 4, 0, 0]} opacity={0.8} />
                        <Bar data={lccSim.replaceLcc} name="新购方案累计停机损失" dataKey="累计停机损失" fill="#00D4B2" radius={[4, 4, 0, 0]} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* McKinsey Style 5-Year LCC detailed cost breakdown sheet */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-display font-bold text-sm text-slate-800 mb-3">资产5年生命周期总成本（LCC）仿真测算流水表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="p-3 font-semibold text-slate-700">阶段</th>
                        <th className="p-3 font-semibold text-slate-700 text-center">方案一：大修留用累计LCC</th>
                        <th className="p-3 font-semibold text-slate-700 text-center">方案一：累计隐性停机损失</th>
                        <th className="p-3 font-semibold text-slate-700 text-center">方案二：置换新购累计LCC</th>
                        <th className="p-3 font-semibold text-slate-700 text-center">方案二：累计隐性停机损失</th>
                        <th className="p-3 font-semibold text-slate-700 text-center">累计成本效益差距</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {lccSim.repairLcc.map((item, i) => {
                        const repItem = item as any;
                        const repValue = repItem['维修与老旧留用'];
                        const repDowntime = repItem['累计停机损失'];
                        const rplItem = lccSim.replaceLcc[i] as any;
                        const rplValue = rplItem['新购与置换升级'];
                        const rplDowntime = rplItem['累计停机损失'];
                        const gap = repValue - rplValue;
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-sans font-semibold text-slate-800">{item.year}</td>
                            <td className="p-3 text-center font-bold text-rose-600">¥{repValue.toLocaleString()}</td>
                            <td className="p-3 text-center text-rose-400">¥{repDowntime.toLocaleString()}</td>
                            <td className="p-3 text-center font-bold text-emerald-600">¥{rplValue.toLocaleString()}</td>
                            <td className="p-3 text-center text-emerald-400">¥{rplDowntime.toLocaleString()}</td>
                            <td className={`p-3 text-center font-extrabold ${gap > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                              {gap > 0 ? `置换省 ¥${gap.toLocaleString()}` : `大修省 ¥${Math.abs(gap).toLocaleString()}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Subview TAB 4: 💬 AI Consultant Chatbot (AI 决策咨询顾问) */}
          {activeTab === 'chat' && activeAsset && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[550px]">
              
              {/* Chat Header showing current asset focus */}
              <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" /> 
                    <span>APEX 资产决策专家级对话代理</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">当前已自动同步绑定设备: <strong className="text-slate-800">{activeAsset.name} ({activeAsset.id})</strong> 的全部系统参数</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> 知识库深度注入
                </span>
              </div>

              {/* Chat messages list area */}
              <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-4 text-xs">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center h-8 w-8 ${
                        isUser ? 'bg-[#0A2540] text-white' : 'bg-teal-50 text-teal-800'
                      }`}>
                        {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                      </div>

                      {/* Content Bubble */}
                      <div className={`rounded-xl p-3.5 shadow-xs leading-relaxed ${
                        isUser 
                          ? 'bg-[#0A2540] text-white' 
                          : 'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}>
                        {/* Render simple formatting for chat replies */}
                        <div className="whitespace-pre-line font-sans prose prose-slate">
                          {msg.content}
                        </div>
                        <span className={`block text-[9px] mt-1.5 font-mono text-right opacity-60 ${
                          isUser ? 'text-slate-300' : 'text-slate-400'
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {sendingChat && (
                  <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-800 shrink-0 h-8 w-8 flex items-center justify-center animate-pulse">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-300"></span>
                      <span className="text-[10px] text-slate-500 font-mono">APEX Agent 正在演算资产LCC决策矩阵...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Preset Consulting Prompts */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => handleSendMessage(undefined, `为什么对于设备 ${activeAsset.id}，AI判定应该倾向于${activeAsset.aiRecommendation === 'replace' ? '直接更换新设备' : '保留并精密修理'}？请结合财务账面残值和本次大修价格比率详细分析。`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-left truncate max-w-full"
                >
                  💡 分析设备重置成本率与财务合理性
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, `计算该设备 ${activeAsset.id} 过去一年非计划停机时长造成的停产隐性损失，并说明新置换新机后能缩短多少非计划停机开支。`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-left truncate max-w-full"
                >
                  💡 量化非计划停工损失的蚕食影响
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, `该设备存在的重大安全与合规红线危险是什么？为什么说在安监一票否决指标下，即便维修费极便宜，也不能批准大修，只能强制进行报废新购？`)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-left truncate max-w-full"
                >
                  💡 详解本设备的安全红线一票否决
                </button>
              </div>

              {/* Message Entry Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`在此输入您对设备 ${activeAsset.id} (${activeAsset.name}) 的决策质询，例如：分析其未来5年 LCC 净节省差值...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00D4B2]"
                />
                <button
                  type="submit"
                  disabled={sendingChat}
                  className="bg-[#0A2540] hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>发送质询</span>
                  <Send className="h-3 w-3" />
                </button>
              </form>

            </div>
          )}

          {/* Subview TAB 5: 📜 AI Report Generator (AI 咨询评估报告) */}
          {activeTab === 'report' && activeAsset && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
              
              {/* Report Header Controls */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-1.5">
                    <FileText className="h-5 w-5 text-[#0A2540]" />
                    <span>国际级数字化咨询标准资产大修/置换评估报告</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">基于大语言模型、知识图谱与全生命周期 LCC 仿真自动编排生成</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="bg-[#0A2540] hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1 shadow-sm"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${generatingReport ? 'animate-spin' : ''}`} />
                    <span>一键生成/刷新 AI 专家深度报告</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    <span>打印 / 导出 PDF 格式</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Report Content Frame */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8 relative min-h-[400px]">
                {/* Print Letterhead Overlay */}
                <div className="border-b-4 border-[#0A2540] pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-[#0A2540]">APEX-ASSET DECISION MATRIX ADVISORY</h2>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">DELOITTE DIGITAL TRANSFORMATION & ASSET INTEGRATION GROUP</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono">
                    <p>报告编号: APEX-R-{activeAsset.id}</p>
                    <p>发布日期: 2026-07-14</p>
                  </div>
                </div>

                {generatingReport ? (
                  <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center max-w-sm text-center">
                      <Sparkles className="h-8 w-8 text-teal-600 animate-pulse mb-3" />
                      <p className="text-sm font-semibold text-slate-800">Gemini 3.5-Flash 正在实时分析企业多系统数据并编排报告中...</p>
                      <p className="text-xs text-slate-400 mt-1">正校准 ERP 原值账面折旧、EAM 历史累计保养大修、IoT 运行振动频谱以及 LCC 5年仿真财务收益...</p>
                      <div className="w-48 bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#00D4B2] h-full rounded-full animate-infinite-loading w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Printable Document Body */}
                <div className="markdown-body text-slate-800 prose prose-sm max-w-none">
                  {renderMarkdown(reportText)}
                </div>

                {/* Print Sign-off block footer */}
                <div className="border-t border-slate-200 pt-6 mt-8 grid grid-cols-2 gap-4 text-[11px] text-slate-500 font-sans">
                  <div>
                    <p className="font-bold text-slate-700">数据源完整性证明 (Data Lineage Source):</p>
                    <p className="mt-1">✓ ERP 资产原值财务折旧账单</p>
                    <p>✓ EAM 设备台账历史维修保养清单</p>
                    <p>✓ 工厂智能采购比价与新替换设备报价库</p>
                    <p>✓ IoT 实时振动、温度温漂运行监测中心</p>
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <p className="font-bold text-slate-700">主审签章: APEX Decision Engine 3.5 Core</p>
                    <p className="mt-1 text-slate-400">本报告由 AI Agent 自动生成，人工拥有最终解释审批权</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Subview TAB 6: ⚙️ Platform Architecture & Integrations (系统集成与数据对接) */}
          {activeTab === 'architecture' && (
            <div className="flex flex-col gap-6">
              
              {/* McKinsey Digital Project Implementation roadmap / architecture description */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-display font-bold text-base text-slate-800">企业资产智能决策平台架构设计 (咨询解决方案交付)</h3>
                  <p className="text-xs text-slate-500">APEX 决策系统如何打通信息孤岛，实现“设备状态、财务折旧、安全合规、能效提升”的四维全生命周期数据底座</p>
                </div>

                {/* Simple HTML-based Architectural flow diagrams */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 text-xs font-sans text-center">
                  
                  {/* Step 1: EAM / ERP Data sources */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 items-center">
                    <div className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-800">1. 多维企业级系统数据源</h4>
                    <p className="text-[10px] text-slate-400">实时读取 EAM/ERP/财务折旧/智采报价/IoT运行数据，免去人工填报偏差与造假</p>
                  </div>

                  {/* Arrow 1 */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold mb-1">API 无缝对接</span>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>

                  {/* Step 2: APEX Decision Engine */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col gap-2 items-center border border-slate-800">
                    <div className="bg-[#00D4B2] text-slate-900 p-2 rounded-lg">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-[#00D4B2]">2. AI 智能决策决策矩阵</h4>
                    <p className="text-[10px] text-slate-400">大语言模型推理 + 故障预测时间序列算法 + LCC（总拥有成本）5年仿真模拟</p>
                  </div>

                  {/* Arrow 2 */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold mb-1">自动生成依据</span>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                {/* Multi-Dimensional Scoring Model design */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h4 className="font-display font-bold text-sm text-slate-800 mb-3">APEX 智能评分决策模型权重配比</h4>
                  <p className="text-xs text-slate-500 mb-4">
                    传统模式中仅简单对比大修费用与购置成本（维修便宜就修，新购便宜就买）。
                    APEX 的智能评分算法（分值 0-100，分数越低越推荐强制新购置换，分数越高代表维修恢复可行性与经济效益越好）通过四维加权决策逻辑建立：
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">1. 经济效能评估</span>
                        <span className="bg-blue-100 text-blue-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">35% 权重</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        - 5年总拥有成本（LCC）差额计算
                        <br />- 资产重置比（本次大修费/新购价格）低于30%
                        <br />- 累计折旧已发生率（累计大修费/设备原值）
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">2. 技术劣化与寿命</span>
                        <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">25% 权重</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        - 指数级故障增长劣化趋势
                        <br />- 本次修复后剩余理论安全使用寿命
                        <br />- 核心易损高耗配件断供或技术过时
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">3. 安全安监一票否决</span>
                        <span className="bg-red-100 text-red-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">25% 权重</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        - 特种设备法律法规强制性安全红线
                        <br />- 爆裂、析氢易燃易爆、高热漏电
                        <br />- 安全评分触发阈值直接触发一票否决
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">4. 生产效益耗损</span>
                        <span className="bg-purple-100 text-purple-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">15% 权重</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        - 非计划突然停机对整条生产线OEE蚕食
                        <br />- 停机小时累计造成的间接订单交货罚款
                        <br />- 上下游工艺配套衔接阻塞连带损失
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deployment roadmap */}
                <div className="mt-6 border-t border-slate-100 pt-6 text-xs font-sans">
                  <h4 className="font-display font-bold text-sm text-slate-800 mb-3">咨询交付项目落地路线图 (Deloitte Implementation Roadmap)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-500">
                    <div className="border-l-2 border-[#0A2540] pl-3 py-1">
                      <p className="font-bold text-slate-800">阶段一：数据底座打通 (1-2 个月)</p>
                      <p className="mt-1">打通 EAM、ERP 资产卡片账目，清洗整合备品备件价格库，实现生产数据与设备实时振动 IoT 在线接入。</p>
                    </div>
                    <div className="border-l-2 border-[#00D4B2] pl-3 py-1">
                      <p className="font-bold text-slate-800">阶段二：模型校正与试运行 (2-3 个月)</p>
                      <p className="mt-1">部署大语言模型 RAG 专业维保知识库。针对工厂历史置换大修争议案例进行重播训练，调校各类别设备评分权重阈值。</p>
                    </div>
                    <div className="border-l-2 border-slate-400 pl-3 py-1">
                      <p className="font-bold text-slate-800">阶段三：全厂推广与无纸审批 (3-6 个月)</p>
                      <p className="mt-1">正式并入设备大修/置换审批流程中。AI一键出具带咨询批注的诊断书，全面优化设备管理OEE，缩短非计划停机50%以上。</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* Corporate Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-12 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#00D4B2]" />
            <span className="font-display font-bold text-white text-sm">{currentProduct.name}</span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">企业资产全生命周期智能决策校验平台</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('architecture'); }} className="hover:text-white transition">设计模型规范</a>
            <a href="#doc" onClick={(e) => { e.preventDefault(); setActiveTab('report'); }} className="hover:text-white transition">国际数字化咨询方案</a>
            <span>DELOITTE & ACCENTURE HYBRID FRAMEWORK © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
