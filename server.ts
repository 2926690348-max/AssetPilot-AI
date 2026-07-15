/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Asset, YearlyStats } from './src/types.js'; // Use .js extension as required by node ESM resolution if active

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI SDK initialized successfully');
  } catch (e) {
    console.error('Failed to initialize Gemini AI SDK:', e);
  }
} else {
  console.warn('GEMINI_API_KEY not found in environment variables. AI operations will use highly detailed local logic fallbacks.');
}

// In-memory seed database of industrial assets
let assets: Asset[] = [
  {
    id: 'EQ-2026-001',
    name: '1000立方重载往复式压缩机',
    model: 'RC-1000-V4',
    category: '动力能源设备',
    department: '动力二车间',
    purchaseDate: '2018-04-15',
    originalValue: 1200000,
    bookValue: 180000,
    remainingUsefulLife: 1.5,
    cumulativeRepairCost: 1150000,
    repairCount: 16,
    lastRepairDate: '2026-03-10',
    status: 'pending',
    currentIssue: '主曲轴箱轴承烧毁，活塞杆拉伤，阀腔出现微裂纹，振动频率超标，润滑油绝缘性极低，随时可能发生严重飞车事故。',
    estimatedRepairCost: 350000,
    newPurchasePrice: 1500000,
    salvageValue: 80000,
    annualOperatingCost: 180000,
    newAnnualOperatingCost: 90000,
    healthIndex: 28,
    safetyRisk: 'high',
    safetyRiskReason: '往复式高压压缩机阀腔裂纹与振动过大存在物理爆炸风险，曲轴箱油温超高，易引发火灾或介质泄漏，威胁车间内至少12名在岗人员生命安全。',
    downtimeHoursPastYear: 320,
    downtimeCostPerClass: 4500,
    history5Years: [
      { year: 2022, repairCost: 120000, downtimeHours: 80, operatingCost: 140000 },
      { year: 2023, repairCost: 180000, downtimeHours: 120, operatingCost: 150000 },
      { year: 2024, repairCost: 260000, downtimeHours: 180, operatingCost: 165000 },
      { year: 2025, repairCost: 380000, downtimeHours: 260, operatingCost: 175000 },
      { year: 2026, repairCost: 210000, downtimeHours: 320, operatingCost: 180000 },
    ],
    aiRecommendation: 'replace',
    aiScore: 18,
    aiReason: '累计维修成本（115万 + 35万）已大幅超出设备原值，且过去一年发生320小时非计划停机（折合损失144万元）。设备已进入损耗失效期，伴随严重安全风险。采购全新高效压缩机虽需150万，但年均运行成本降低50%，可在1.8年内收回成本，并彻底杜绝安全隐患。',
    aiDetailedReport: `## APEX-Asset 智能决策分析报告 (国际级数字化咨询交付标准)

### 1. 设备基本档案与财务评估
- **资产编号**: EQ-2026-001
- **资产估值**: 该设备于2018年购入，原值 1,200,000 元，当前财务折旧已基本完成，账面残值仅剩 180,000 元。
- **重置成本比**: 本次维修预计费用 350,000 元，占新设备采购价 (1,500,000 元) 的 **23.3%**。
- **累计维修率**: 历史累计维修费用 (1,150,000 元) 已占原值的 **95.8%**。若继续维修，总投入将达到 **1,500,000 元**，形成“每次维修都合理、累计维修远超设备原值”的典型管理黑洞。

### 2. 技术状态与故障趋势分析
- **健康评分 (Health Index)**: **28分 (重度失效级别)**
- **非计划停机影响**: 过去一年因故障累计停机 **320 小时**，按照 4,500 元/小时 的生产损失计算，给车间造成了直接生产价值损失 **1,440,000 元**。
- **故障演变曲线**: 故障率呈现显著的指数级增长。过去3年停机时间由 120 小时暴增至 320 小时，说明设备材料与核心结构已发生金属疲劳及不可逆的性能衰减。

### 3. 重大安全与合规风险评估
- **风险等级**: **RED ALERT (极高风险)**
- **现场风险**: 往复压缩机阀腔裂纹，意味着在高压高强度往复振动下存在结构性物理撕裂及高压泄漏隐患；活塞杆拉伤直接带来摩擦起火危险。
- **决策一票否决制**: 即使从纯维修成本上看似合算，但由于安全规范与合规红线，强制建议一票否决维修，立刻采购新机。

### 4. 经济性量化对决 (5年总拥有成本 LCC 预测)
若采用【**维修方案**】:
- 本次维修: 350,000 元
- 未来5年故障维护概率推算: 预计 500,000 元
- 高能耗与运行费 (18万/年): 900,000 元
- 5年预计停机损失: 预计 2,000,000 元
- **5年总拥有成本 (LCC)**: **3,750,000 元**

若采用【**新购方案**】:
- 新设备采购: 1,500,000 元
- 新机报废变现抵扣: -80,000 元
- 5年维保费用 (质保期+主动性维护): 120,000 元
- 低能耗高效率运行 (9万/年): 450,000 元
- 5年预计停机损失 (极低故障率): 150,000 元
- **5年总拥有成本 (LCC)**: **2,140,000 元**

**AI Agent 决策结论**: 建议直接【**采购新设备**】。置换后 LCC 成本降低 **1,610,000 元**，新购静态投资回收期仅为 **1.62 年**。`
  },
  {
    id: 'EQ-2026-002',
    name: '焊接车间六轴工业机器人',
    model: 'IR-FANUC-210',
    category: '精密加工设备',
    department: '总装车间',
    purchaseDate: '2022-09-10',
    originalValue: 550000,
    bookValue: 360000,
    remainingUsefulLife: 6.0,
    cumulativeRepairCost: 65000,
    repairCount: 3,
    lastRepairDate: '2025-11-05',
    status: 'pending',
    currentIssue: '第3轴与第5轴精密谐波减速机传动出现异常异响，定位精度由 ±0.03mm 降至 ±0.25mm，影响点焊焊接质量，伺服电机温度偶尔超温报警。',
    estimatedRepairCost: 45000,
    newPurchasePrice: 480000,
    salvageValue: 120000,
    annualOperatingCost: 35000,
    newAnnualOperatingCost: 30000,
    healthIndex: 72,
    safetyRisk: 'low',
    safetyRiskReason: '伺服驱动保护机制完善，不直接危及人身安全。精密超温保护可防止热失控，处于安全可控状态。',
    downtimeHoursPastYear: 42,
    downtimeCostPerClass: 6000,
    history5Years: [
      { year: 2022, repairCost: 0, downtimeHours: 0, operatingCost: 10000 },
      { year: 2023, repairCost: 12000, downtimeHours: 8, operatingCost: 32000 },
      { year: 2024, repairCost: 18000, downtimeHours: 12, operatingCost: 34000 },
      { year: 2025, repairCost: 35000, downtimeHours: 22, operatingCost: 35000 },
      { year: 2026, repairCost: 45000, downtimeHours: 42, operatingCost: 35000 },
    ],
    aiRecommendation: 'repair',
    aiScore: 84,
    aiReason: '该焊接机器人尚处于全生命周期的黄金应用期（使用不到4年，剩余寿命长达6年）。本次故障主要为易损核心备件（谐波减速机）磨损，维修费用仅4.5万元（占新购费用的9.3%），维修后设备性能可完全恢复至正常水平。安全风险低，累计维修额度远未到预警线，维修是极佳的经济决策。',
    aiDetailedReport: `## APEX-Asset 智能决策分析报告 (国际级数字化咨询交付标准)

### 1. 设备基本档案与财务评估
- **资产编号**: EQ-2026-002
- **资产估值**: 该六轴机器人于2022年购入，原值 550,000 元，当前财务账面残值仍有 360,000 元，剩余服役空间广阔。
- **重置成本比**: 本次精密谐波减速机更换预计费用 45,000 元，占新设备采购价 (480,000 元) 的 **9.3%**，处于合理保养维修门槛内（低于15%）。
- **累计维修率**: 累计已发生维修费仅 65,000 元，加上本次4.5万后，仅占原值的 **20%**，处于极佳的健康资产表现区间。

### 2. 技术状态与故障趋势分析
- **健康评分 (Health Index)**: **72分 (轻度受损级)**
- **非计划停机影响**: 过去一年非计划停机 **42 小时**，主要由于主控算法自适应调平导致的报警。
- **机械磨损规律**: 2轴与5轴谐波减速机属于标准易损高耗件，平均工作周期 15,000 小时即进入精密衰退。通过更换正厂齿轮包，精度和传动比可完全重置为 98% 初始状态，设备无金属疲劳等系统性基础损伤。

### 3. 重大安全与合规风险评估
- **风险等级**: **GREEN (极低安全风险)**
- **安全性评价**: 焊接机器人围栏联锁正常，伺服电机具备完善的扭矩过载切断与热保护保护。本次减速机偏航不引发二次灾难性机械伤害。

### 4. 经济性量化对决 (5年总拥有成本 LCC 预测)
若采用【**维修方案**】:
- 本次精密维保: 45,000 元
- 未来5年计划性维保费用: 80,000 元
- 运行能耗成本 (3.5万/年): 175,000 元
- 5年预计偶然停机损失: 200,000 元
- **5年总拥有成本 (LCC)**: **500,000 元**

若采用【**新购方案**】:
- 采购新机械臂与控制柜: 480,000 元
- 旧机折价回收: -120,000 元
- 5年基本维护费用: 50,000 元
- 新设备节能增效能耗 (3万/年): 150,000 元
- 新设备调试停机、生产线兼容改造损失: 120,000 元
- **5年总拥有成本 (LCC)**: **680,000 元**

**AI Agent 决策结论**: 建议坚定执行【**维修方案**】。继续留用并予以正厂维修，其5年生命周期总成本比新购置节省 **180,000 元** 资金，避免了过早淘汰高价值资产所造成的企业财务折旧浪费。`
  },
  {
    id: 'EQ-2026-003',
    name: '精密数控雕铣机主轴单元',
    model: 'CNC-SP-30K',
    category: '精密加工设备',
    department: '精机分厂',
    purchaseDate: '2023-05-18',
    originalValue: 450000,
    bookValue: 270000,
    remainingUsefulLife: 4.5,
    cumulativeRepairCost: 180000,
    repairCount: 8,
    lastRepairDate: '2026-01-15',
    status: 'pending',
    currentIssue: '主轴高速运转（24000RPM以上）时温度发生突变，动平衡传感器失效，主轴跳动（Run-out）达到 12μm，远超 2μm 行业标准，工件表面出现振纹，极易发生主轴抱死卡死。',
    estimatedRepairCost: 135000,
    newPurchasePrice: 380000,
    salvageValue: 50000,
    annualOperatingCost: 65000,
    newAnnualOperatingCost: 50000,
    healthIndex: 52,
    safetyRisk: 'medium',
    safetyRiskReason: '高速气浮或滚珠主轴抱死可能导致高速合金刀具崩碎飞溅，虽有亚克力防爆护罩，但仍存在一定碎片击穿或高温起火中度风险。',
    downtimeHoursPastYear: 180,
    downtimeCostPerClass: 8000,
    history5Years: [
      { year: 2023, repairCost: 20000, downtimeHours: 15, operatingCost: 40000 },
      { year: 2024, repairCost: 50000, downtimeHours: 45, operatingCost: 55000 },
      { year: 2025, repairCost: 110000, downtimeHours: 120, operatingCost: 62000 },
      { year: 2026, repairCost: 135000, downtimeHours: 180, operatingCost: 65000 },
    ],
    aiRecommendation: 'replace',
    aiScore: 42,
    aiReason: '该精密主轴频繁发生动平衡及温度漂移，累计已维修花费达原值的40%。本次维修报价高达13.5万元，已接近新购主轴的三分之一。最核心的问题在于，频繁维修导致精机生产线频发停机（一年停工180小时损失144万），且主轴动平衡属精密极限工艺，修复后可能很快由于高速偏心再次退化。AI 建议采购全新进口主轴，并同步升级润滑过滤系统。',
    aiDetailedReport: `## APEX-Asset 智能决策分析报告 (国际级数字化咨询交付标准)

### 1. 设备基本档案与财务评估
- **资产编号**: EQ-2026-003
- **资产重置价值**: 原值 450,000 元，最新同性能产品重置成本已降至 380,000 元。
- **维修费占比**: 本次维修预计费用 135,000 元，占重置成本的 **35.5%**，已越过 30% 的敏感决策红线。
- **累计维护率**: 历史已支出 180,000 元，加上本次后累计达到 **315,000 元 (原值的70%)**。

### 2. 技术状态与失效因子诊断
- **健康评分 (Health Index)**: **52分 (中度退化)**
- **精密衰退机制**: CNC高精密主轴（3万转/分）对主轴跳动和刚性要求达到微米级。由于该单元长期切削钛合金和特种高硬模具钢，其碳化硅轴承轨道已出现显微剥落，动平衡面存在微量不对称残余变形。这种精密损伤在车间级中修中难以完美校准，极易复发。
- **生产效率剥夺**: 频繁停机及良率由 99.8% 跌落至 94.2%，给下游精密装配线带来严重的物料呆滞成本。

### 3. 重大安全与合规风险评估
- **风险等级**: **YELLOW (中度风险)**
- **风险说明**: 主轴温度突变和振幅超限有高达 15% 几率发生“热咬死”或高速断刀事故。断刀可能产生每秒数百米的高速弹射破片，虽然数控机床有屏蔽门，但对频繁进行对刀找正的手动模式操作员构成潜在危险。

### 4. 5年生命周期总成本 (LCC) 仿真
如果选择【**维修方案**】:
- 本次精密拆装与轴承更换: 135,000 元
- 预计1.5年后主轴再次精衰维保: 120,000 元
- 年耗电与主轴恒温冷却费 (6.5万/年): 325,000 元
- 5年预计非计划停机损失: 1,200,000 元
- **5年总拥有成本 (LCC)**: **1,780,000 元**

如果选择【**采购方案**】:
- 新购高动态性能主轴: 380,000 元
- 旧机折价回收/变现: -50,000 元
- 升级主动维护包 (5年总计): 40,000 元
- 高效节能型气浮主轴能耗 (5万/年): 250,000 元
- 新机磨合停机与工艺导入期损失: 80,000 元
- 高级防故障预测性传感器包: 30,000 元
- **5年总拥有成本 (LCC)**: **730,000 元**

**AI Agent 决策结论**: 强烈建议【**采购置换新主轴**】。从经济上看，置换可使 5 年总拥有成本降低 **1,050,000 元 (节约 59%)**。新主轴自带的机床传感器可无缝并入数字化工厂 IoT 平台，实现预测性维护（Predictive Maintenance），杜绝非计划突然停机。`
  },
  {
    id: 'EQ-2026-004',
    name: '2.5吨电动液压高架叉车',
    model: 'EF-YALE-25',
    category: '仓储物流设备',
    department: '智能物流中心',
    purchaseDate: '2020-03-12',
    originalValue: 180000,
    bookValue: 35000,
    remainingUsefulLife: 1.0,
    cumulativeRepairCost: 145000,
    repairCount: 22,
    lastRepairDate: '2026-02-28',
    status: 'pending',
    currentIssue: '主电控逆变器板烧毁，铅酸动力电池组最大放电容量已衰减至额定值的25%（充电2小时仅能使用30分钟），液压主升降油缸柱塞磨损导致严重渗油，无法通过叉车特种设备年检。',
    estimatedRepairCost: 75000,
    newPurchasePrice: 195000,
    salvageValue: 20000,
    annualOperatingCost: 45000,
    newAnnualOperatingCost: 15000,
    healthIndex: 35,
    safetyRisk: 'high',
    safetyRiskReason: '液压渗油可能引发刹车失灵或举升坠落，铅酸电池老化析氢存在充电室爆炸起火特大安全隐患，且由于无法通过质监局特种设备年检，带病作业属违法违规行为。',
    downtimeHoursPastYear: 145,
    downtimeCostPerClass: 1500,
    history5Years: [
      { year: 2022, repairCost: 20000, downtimeHours: 25, operatingCost: 35000 },
      { year: 2023, repairCost: 35000, downtimeHours: 45, operatingCost: 38000 },
      { year: 2024, repairCost: 42000, downtimeHours: 85, operatingCost: 42000 },
      { year: 2025, repairCost: 48000, downtimeHours: 145, operatingCost: 45000 },
    ],
    aiRecommendation: 'replace',
    aiScore: 12,
    aiReason: '该电动叉车累计已支出维修费达14.5万元（已达原值的80%）。本次电控板和电池组更换加上油缸修复报价达7.5万元，极不经济。加之设备已不满足合规安监标准，无法通过年检。新型锂电池高效叉车年运行成本可降低66%（免维护、省充电），置换新机是唯一合规且高投资回报的道路。',
    aiDetailedReport: `## APEX-Asset 智能决策分析报告 (国际级数字化咨询交付标准)

### 1. 设备基本档案与财务评估
- **资产编号**: EQ-2026-004
- **资产状态**: 已服役6年，财务折旧基本完成，账面残值 35,000 元。
- **单次维修重置比**: 本次大修报价 75,000 元，占重置成本 (195,000 元) 的 **38.5%**。
- **累计大修黑洞**: 累计维保费用达 145,000 元。若追加 7.5 万元，总维修额将高达 220,000 元，超出原值 **122%**。属于最危险的“渐进式超额资产耗损”。

### 2. 安全合规一票否决
- **合规审查**: 该叉车已不符合国家特种设备安全技术规范《场（厂）内专用机动车辆安全技术监察规程》，其特检院强制性年度检验由于“液压系统密封性能、绝缘性能不合规”被责令整改限期复检。
- **零合规风险容忍**: 带病复检或违章无证上路可能面临10万至50万元行政罚款，甚至因涉嫌“重大责任事故罪”被移送司法。此项属于合规一票否决指标。

### 3. 技术落后与能耗对比
- 原叉车采用旧式铅酸电池：充电慢（8-10小时），放电容量严重衰减，冬季续航仅为正常时的 20%；废酸存在酸雾泄露污染。
- 新购叉车采用高密度磷酸铁锂电池：支持 1.5 小时快速双充、随充随用，寿命是铅酸的 3-4 倍，能耗转化效率提升 40%，且电机采用最新的免维护无刷交流驱动。

### 4. 5年生命周期总成本 (LCC) 仿真
选择【**维修与强制改装方案**】:
- 本次更换电池、电控、重整油缸: 75,000 元
- 未来5年持续电池衰退维护: 50,000 元
- 铅酸日常充电高昂电费与加酸维护成本: 225,000 元
- 特种设备整改费与年检调试阻力损失: 30,000 元
- **5年总拥有成本 (LCC)**: **380,000 元**

选择【**直接锂电化置换方案**】:
- 新购一等锂电叉车: 195,000 元
- 报废回收补贴: -20,000 元
- 5年整车及电池厂家超长联保费用: 15,000 元
- 锂电超低能耗与零日常液维护能耗 (1.5万/年): 75,000 元
- 锂电新机带来的智能物流效率增益: -30,000 元
- **5年总拥有成本 (LCC)**: **235,000 元**

**AI Agent 决策结论**: 建议强制拒绝【**维修大修申请**】，转入【**采购报废新购流程**】。此决策可在不妥协任何安全法规的前提下，为工厂节约5年期 LCC 资产开支达 **145,000 元**。`
  },
  {
    id: 'EQ-2026-005',
    name: '150KW高炉二次离心引风机机组',
    model: 'FN-150-H',
    category: '动力能源设备',
    department: '炼铁高炉车间',
    purchaseDate: '2021-08-20',
    originalValue: 350000,
    bookValue: 125000,
    remainingUsefulLife: 3.0,
    cumulativeRepairCost: 110000,
    repairCount: 6,
    lastRepairDate: '2025-10-12',
    status: 'pending',
    currentIssue: '风机壳体、叶轮气流磨损严重，外壳局部发生腐蚀穿孔，主轴轴承振动速度高达 12.8mm/s（国标不应超过 4.6mm/s），高速运转下随时有叶轮飞崩、风机外壳撕裂等重大物理碎裂隐患。',
    estimatedRepairCost: 80000,
    newPurchasePrice: 320000,
    salvageValue: 30000,
    annualOperatingCost: 75000,
    newAnnualOperatingCost: 55000,
    healthIndex: 48,
    safetyRisk: 'high',
    safetyRiskReason: '风机高速解体碎片飞逸可造成毁灭性厂房设施撞击和人员伤亡；同时除尘风机停转将导致有害烟气瞬时弥漫、高炉紧急无预警休风，属于核心 A 类高风险运行设备。',
    downtimeHoursPastYear: 96,
    downtimeCostPerClass: 12000,
    history5Years: [
      { year: 2022, repairCost: 10000, downtimeHours: 12, operatingCost: 65000 },
      { year: 2023, repairCost: 25000, downtimeHours: 24, operatingCost: 70000 },
      { year: 2024, repairCost: 35000, downtimeHours: 42, operatingCost: 72000 },
      { year: 2025, repairCost: 40000, downtimeHours: 58, operatingCost: 75000 },
      { year: 2026, repairCost: 80000, downtimeHours: 96, operatingCost: 75000 },
    ],
    aiRecommendation: 'replace',
    aiScore: 24,
    aiReason: '虽然8万元维修成本仅为新购的25%，但该引风机属于极其关键的防爆防物理爆裂 A 类动力设备。叶轮及外壳腐蚀穿孔严重损害了风机的整体结构韧性，现场中修打补丁极难承受3000RPM的高速离心交变应力。一旦转子不平衡发生飞崩解体，后果将是车间级别的大灾难。为了高炉长周期安全稳定运行，AI 强制性建议通过折旧报废流程进行升级置换。',
    aiDetailedReport: `## APEX-Asset 智能决策分析报告 (国际级数字化咨询交付标准)

### 1. 资产与财务全貌
- **资产编号**: EQ-2026-005
- **财务属性**: 已使用5年，原值 350,000 元，财务账面残值 125,000 元。
- **本次改造与修理预算**: 80,000 元，约占新购重置费用 (320,000 元) 的 **25.0%**。
- **历史维修消耗**: 累计维修 110,000 元，占原值的 **31.4%**。

### 2. 一票否决性现场技术红线
- **振动故障谱分析**: 现场实测轴承座振动超标达 **12.8mm/s**。诊断发现原因为转子由于磨损发生严重质量偏心，且外壳已经有锈蚀局部穿透空洞。
- **离心解体飞崩隐患**: 引风机机组转子质量达数百公斤，转速 3,000 RPM，蕴含巨大动能。在强腐蚀、薄壳体、不平衡运行状况下，钢壳无法阻挡解体飞逸的叶轮碎片，这相当于一颗随时可能引爆的高速碎片弹，一旦解体，不仅会直接瘫痪除尘净化系统，且对巡检步道构成严重的绝对人身致命性安全红线。

### 3. 高炉停摆的链式衍生灾难成本
- 离心风机失效导致的非计划停工，将导致整个炼铁高炉在10分钟内因尾气背压过高、粉尘溢出而不得不紧急**休风减产**。
- 高炉非计划休风造成的加热炉衬热裂、原料凝固等生产连带损失，平均成本估算高达 **12,000 元 / 小时**，过去一年停机 96 小时已直接耗损高达 **1,152,000 元** 的隐性炼铁利润。

### 4. 5年全生命周期成本 (LCC) 仿真分析
若选择【**保守焊接修补方案**】:
- 本次叶轮焊接修复动平衡: 80,000 元
- 5年内由于外壳持续穿透导致的打补丁大修: 120,000 元
- 设备处于高损态能耗 (7.5万/年): 375,000 元
- 5年预计高炉连带休风停机损失: 800,000 元
- **5年总拥有成本 (LCC)**: **1,375,000 元**

若选择【**直接耐磨高效引风机置换方案**】:
- 新购重载防爆除尘引风机 (含不锈钢耐磨叶轮): 320,000 元
- 旧风机环保回收及部分电机残值变现: -30,000 元
- 5年质保与耐磨防腐升级主动性养护费: 30,000 元
- 智能变频、低阻叶轮节能能耗 (5.5万/年): 275,000 元
- 5年内新风机预计零计划外停工损失: 50,000 元
- **5年总拥有成本 (LCC)**: **645,000 元**

**AI Agent 决策结论**: 建议以最高级别安全警示拒绝【**维修大修方案**】，进入【**全线新购并升级变频节能方案**】。新机将减少 5 年资产管理成本共 **730,000 元**，彻底将高炉除尘事故风险消减至 0ppm。`
  }
];

// Helper to update asset state in memory
app.get('/api/assets', (req, res) => {
  res.json(assets);
});

app.post('/api/assets/:id/approve', (req, res) => {
  const { id } = req.params;
  const { action, user, comment } = req.body;
  const asset = assets.find(a => a.id === id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  asset.status = action === 'repair' ? 'repair_approved' : action === 'replace' ? 'replace_approved' : 'rejected';
  
  if (!asset.approvalHistory) {
    asset.approvalHistory = [];
  }
  
  asset.approvalHistory.push({
    user: user || '系统管理员',
    action: action === 'repair' ? '批准维修' : action === 'replace' ? '批准采购新置换设备' : '驳回流程',
    date: new Date().toISOString().split('T')[0],
    comment: comment || '通过AI智能决策辅助审批'
  });

  res.json({ success: true, asset });
});

// Real-time McKinsey / Deloitte report generator via Gemini or fallback
app.post('/api/assets/:id/generate-report', async (req, res) => {
  const { id } = req.params;
  const asset = assets.find(a => a.id === id);
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  if (!ai) {
    // Return high quality pre-populated fallback if Gemini API key is missing
    console.log('Using local high-quality template fallback because AI is not initialized');
    return res.json({ report: asset.aiDetailedReport });
  }

  try {
    const prompt = `
你是一名世界顶尖数字化企业咨询专家（任职于德勤、麦肯锡、埃森哲），专门为大型装备制造及资产密集型企业提供企业资产全生命周期决策方案。
请针对以下给出的真实工业设备故障申报、财务估值及技术指标，起草一份符合国际最高交付水准的“设备置换或中大修AI决策诊断评估报告”。

设备明细数据:
${JSON.stringify(asset, null, 2)}

要求报告必须包含以下模块（使用极具专业性、严谨性、震撼性的咨询级专业词汇，采用精致的Markdown排版）：
1. 【设备资产基本档案与财务健康指数】：深入剖析原值、折旧、账面残值，并测算本次大修报价占新设备采购价格的比例（重置成本率），以及历史累计维修开销占设备原值的比例（累计维修率），指明是否存在“资产投入黑洞”。
2. 【高精尖技术状态评估与故障频率演进】：通过健康评分（Health Index）、历史非计划停机时长对生产线及上下游造成的效率剥夺、核心易损件的损伤机制，客观判断设备是否进入了“浴盆曲线”的失效损耗期。
3. 【安全与特种设备合规红线核查（一票否决指标）】：对安全风险（防爆、漏电、物理断裂、人身伤害）以及国家合规年检红线进行定量分析。对高安全高合规风险设备阐述“即使维修便宜也必须强制置换”的安监道理。
4. 【5年期全生命周期拥有成本 (LCC) 对决仿真模拟】：列出两套表格，定量分析【留用大修方案】和【报废采购置换方案】在未来5年的：本次大修/置换开支、5年持续运行能耗与日常维保开支、非计划故障停机损失及工艺改造费等。汇总两套方案的5年期总拥有成本（Total LCC）差值。
5. 【AI Agent 最终咨询结论与建议】：清晰明确地下达结论（维修 or 置换），提供一目了然的原因清单。

请以最客观、专业、极度精致深度的德勤咨询级中文输出。不需要带任何前言、总结说明性废话，直接开始。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const reportText = response.text || asset.aiDetailedReport || '';
    // Save generated report in memory for future retrievals
    asset.aiDetailedReport = reportText;

    res.json({ report: reportText });
  } catch (error: any) {
    console.error('Error generating report with Gemini:', error);
    res.status(500).json({ 
      error: 'AI Report Generation Failed',
      message: error.message,
      fallbackReport: asset.aiDetailedReport 
    });
  }
});

// Chatbot Decision Intelligence assistant via Gemini
app.post('/api/assets/ai-chat', async (req, res) => {
  const { messages, currentAssetId } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array' });
  }

  const activeAsset = assets.find(a => a.id === currentAssetId) || assets[0];

  const systemInstruction = `
你是一位名为 "APEX-Agent" 的德勤数字化咨询资产密集型企业设备生命周期决策助手。你对企业资产全生命周期管理（EAM）、全拥有生命周期成本（LCC）折算、工程安全红线与资产折旧模型了如指掌。
你的任务是协助工厂主管、财务总监、厂长等管理层，进行设备到底是“中大修”还是“淘汰新购”的科学论证。

当前聚焦评估的设备样本：
${JSON.stringify(activeAsset, null, 2)}

回答指南:
1. 语言：始终用专业、干练、严谨的高水平中文，表现出顶级数字化转型顾问的高超水准（如：总拥有成本LCC、一票否决指标、资产折旧折算率、预测性维护、设备效率综合利用率OEE等）。
2. 在讨论具体设备时，深度结合该设备的财务原值、故障率、停机非计划开支和安全一票否决事实（如EQ-2026-001阀腔裂纹、EQ-2026-004铅酸电池危险和特种年检红线）。
3. 如果用户询问更宽泛的资产决策，可以说明APEX的四大黄金准则：
   - 经济性测算（LCC模型）
   - 技术性能劣化度评分
   - 安全合规风险（一票否决）
   - 工艺及能效改进回报（ROI）
4. 回答字数控制在合理可读范围，多用优雅的排版（加粗、列表）。
5. 如果Gemini未连接，你将代表本地专家顾问解答。
`;

  if (!ai) {
    // Fallback response generator if Gemini API key is missing
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    let reply = `您好！我是 APEX 资产智能决策决策助手。当前 GEMINI_API_KEY 未配置，已为您加载本地咨询决策引擎库。

关于针对 **${activeAsset.name} (${activeAsset.id})** 的决策咨询，以下为您重点拆解：

1. **财务与投入临界点分析**：本次预计维修费用为 ${activeAsset.estimatedRepairCost.toLocaleString()} 元，新购替代价格为 ${activeAsset.newPurchasePrice.toLocaleString()} 元。当前账面残值 ${activeAsset.bookValue.toLocaleString()} 元，累计历史维修已发生 ${activeAsset.cumulativeRepairCost.toLocaleString()} 元，重置置换比率已极高。
2. **决策倾向建议**：AI 评分为 **${activeAsset.aiScore}分**，当前强力推荐【**${activeAsset.aiRecommendation === 'replace' ? '采购全新设备置换' : '批准本地中大修'}**】。
3. **关键一票否决（安全与合规）**：该设备当前安全风险为【**${activeAsset.safetyRisk.toUpperCase()}**】。安全说明：*${activeAsset.safetyRiskReason}*。

${lastUserMsg.includes('为什么') || lastUserMsg.includes('原因') 
  ? `针对您问的“决策原因”：设备在过去一年的停机时长高达 ${activeAsset.downtimeHoursPastYear} 小时，生产线停机造成的直接价值损失已经超出其自身账面残值的数倍，高故障率与不可靠的健康状态说明核心部件发生了系统疲劳。继续维修不仅容易复发故障，还会严重蚕食车间的日常综合产能（OEE）并面临重大安监不合规处罚。` 
  : `您可以进一步询问我：
- “为什么即使当前维修费用低于新购，AI仍做出强制置换建议？”
- “如何计算该设备未来5年的LCC总拥有成本差距？”
- “新购方案的投资回收期和投资回报率（ROI）是多少？”`}

若需要完整的评估，建议您前往“AI分析报告”页一键生成并导出全维度的德勤级咨询交付方案。`;

    return res.json({ reply });
  }

  try {
    // Format conversation history for Gemini SDK
    // Since Gemini SDK uses specific chat formats or direct prompt arrays:
    // Let's create a chat session or send contents.
    // For simplicity, we can feed the system instruction as a config, and map history to Gemini's format.
    // Format messages into contents array:
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    const reply = response.text || '无法获取AI应答。';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chatbot error:', error);
    res.status(500).json({ 
      error: 'AI Chat Connection Failed',
      message: error.message,
      fallbackReply: `连接决策大模型发生错误。根据本地离线逻辑判断，设备 ${activeAsset.id} 强烈建议选择 ${activeAsset.aiRecommendation === 'replace' ? '新置换新机' : '执行维修方案'}，主要考量是其当前健康评分仅为 ${activeAsset.healthIndex} 且累计已亏空高昂停机费。`
    });
  }
});

// Connect Vite dev server in development, serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[APEX-Asset] Enterprise decision platform active at http://localhost:${PORT}`);
  });
}

startServer();
