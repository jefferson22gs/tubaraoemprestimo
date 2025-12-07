
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
  phone: string; // Added for WhatsApp integration
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
  daysOffset: number; // -3 (3 days before), 0 (due date), 5 (5 days after)
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
  proofUrl?: string; // New: Link to payment proof
  paidAt?: string;   // New: Date of payment
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

// --- EXTRACT / STATEMENT ---
export interface Transaction {
  id: string;
  type: 'IN' | 'OUT'; // IN = Empréstimo Recebido, OUT = Pagamento Parcela
  description: string;
  amount: number;
  date: string;
  category: 'LOAN' | 'PAYMENT' | 'FEE';
}

// --- AI LOGS ---
export interface InteractionLog {
  id: string;
  userName: string;
  userRole: string;
  message: string;
  intent: 'PAYMENT_PROMISE' | 'REQUEST_BOLETO' | 'SUPPORT' | 'UNKNOWN';
  reply: string;
  timestamp: string;
}

// --- WHATSAPP INTEGRATION ---
export interface WhatsappConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  isConnected: boolean;
}
