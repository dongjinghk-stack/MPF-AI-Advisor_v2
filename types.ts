export interface MPFFund {
  scheme_name: string;
  constituent_fund: string;
  mpf_trustee: string;
  fund_type: string;
  launch_date: string;
  fund_size_hkd_m: number;
  risk_class: number;
  latest_fer: number;
  annualized_return_1y: number;
  annualized_return_3y: number;
  annualized_return_5y: number;
  return_2024: number;
  return_2023: number;
  return_2022: number;
  return_2021: number;
  return_2020: number;
}

export interface ScenarioAllocation {
  fund: MPFFund;
  allocation: number;
  return1Y: number;
  return5Y: number;
  fer: number;
}

export interface Scenario {
  number: number;
  title: string;
  allocations: ScenarioAllocation[];
  weightedFER: number | null;
  text: string;
}

export interface ChatSection {
  type: 'text' | 'scenario' | 'fund_card' | 'comparison';
  content?: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sections?: ChatSection[];
  timestamp: Date;
  feedback?: 'like' | 'dislike' | null;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}