
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  DEFAULTED = 'DEFAULTED'
}

export interface UserAccess {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface LoanPackage {
  id: string;
  name: string;
  minValue: number;
  maxValue: number;
  minInstallments: number;
  maxInstallments: number;
  interestRate: number;
}

export interface LoanRequest {
  id: string;
  clientName: string;
  cpf: string;
  email: string;
  phone: string; 
  amount: number;
  installments: number;
  status: LoanStatus;
  date: string;
  documents: {
    selfieUrl?: string;
    idCardUrl?: string | string[];
    idCardBackUrl?: string | string[];
    proofOfAddressUrl?: string | string[];
    proofIncomeUrl?: string | string[];
    vehicleUrl?: string | string[];
  };
  signatureUrl?: string;
}

export interface DashboardStats {
  totalLent: number;
  activeLoans: number;
  defaultRate: number;
  revenue: number;
}

export interface SystemSettings {
  monthlyInterestRate: number;
  lateFeeRate: number;
}

// --- BRANDING / WHITE LABEL ---
export interface BrandSettings {
  systemName: string;
  logoUrl: string | null; // null usa o logo padrão (Tubarão)
  primaryColor: string;   // Cor de Ação (ex: Vermelho Tubarão)
  secondaryColor: string; // Cor de Destaque (ex: Dourado)
  backgroundColor: string; // Cor de Fundo (Geralmente preto ou escuro)
  
  // Company Info for Documents
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
}

// --- NEW TYPES FOR CRM & AUTOMATION ---

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'BLOCKED';
  internalScore: number; // 0-1000
  totalDebt: number;
  activeLoansCount: number;
  joinedAt: string;
}

export type CollectionRuleType = 'WHATSAPP' | 'EMAIL' | 'SMS';

export interface CollectionRule {
  id: string;
  daysOffset: number; 
  type: CollectionRuleType;
  messageTemplate: string;
  active: boolean;
}

export interface Installment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'OPEN' | 'PAID' | 'LATE';
  pixCode?: string;
  proofUrl?: string; 
  paidAt?: string;   
}

export interface Loan {
  id: string;
  amount: number;
  installmentsCount: number;
  remainingAmount: number;
  status: LoanStatus;
  startDate: string;
  installments: Installment[];
}

export interface Transaction {
  id: string;
  type: 'IN' | 'OUT'; 
  description: string;
  amount: number;
  date: string;
  category: 'LOAN' | 'PAYMENT' | 'FEE';
}

export interface InteractionLog {
  id: string;
  userName: string;
  userRole: string;
  message: string;
  intent: 'PAYMENT_PROMISE' | 'REQUEST_BOLETO' | 'SUPPORT' | 'UNKNOWN';
  reply: string;
  timestamp: string;
}

export interface WhatsappConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  isConnected: boolean;
}
