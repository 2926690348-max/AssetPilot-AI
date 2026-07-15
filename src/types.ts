/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface YearlyStats {
  year: number;
  repairCost: number;
  downtimeHours: number;
  operatingCost: number;
}

export interface Asset {
  id: string;
  name: string;
  model: string;
  category: string;
  department: string;
  purchaseDate: string;
  originalValue: number;       // 设备原值 (元)
  bookValue: number;           // 财务账面残值 (元)
  remainingUsefulLife: number; // 剩余可使用年限 (年)
  cumulativeRepairCost: number; // 累计已发生维修费用 (元)
  repairCount: number;         // 历史维修次数
  lastRepairDate: string;      // 最近一次维修日期
  status: 'pending' | 'repair_approved' | 'replace_approved' | 'rejected';
  
  // 当前故障申报
  currentIssue: string;        // 本次故障描述
  estimatedRepairCost: number; // 本次预计维修费用 (元)
  newPurchasePrice: number;    // 新设备采购价格 (元)
  salvageValue: number;        // 当前报废残值/处置价值 (元)
  annualOperatingCost: number; // 年运行维护成本 (元)
  newAnnualOperatingCost: number; // 新设备预计年运行成本 (元)
  
  // 状态与风险
  healthIndex: number;         // 实时健康评分 (0-100)
  safetyRisk: 'low' | 'medium' | 'high'; // 安全风险等级
  safetyRiskReason: string;    // 安全风险说明
  downtimeHoursPastYear: number; // 过去一年累计停机时长 (小时)
  downtimeCostPerClass: number; // 停机造成的单位生产损失 (元/小时)
  
  // 5年历史趋势
  history5Years: YearlyStats[];
  
  // AI 决策输出 (初始化或Gemini实时生成)
  aiRecommendation?: 'repair' | 'replace';
  aiScore?: number;            // 决策综合评分 (0-100, 越低代表越倾向于新购, 越高代表越倾向于维修)
  aiReason?: string;           // 决策原因摘要
  aiDetailedReport?: string;   // 德勤咨询格式的多维度报告 (Markdown)
  approvalHistory?: Array<{
    user: string;
    action: string;
    date: string;
    comment: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
