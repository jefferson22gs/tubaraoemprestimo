

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  WAITING_DOCS = 'WAITING_DOCS', // New Status
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

  // New References
  references: {
    fatherPhone: string;
    motherPhone: string;
    spousePhone: string;
  };

  documents: {
    selfieUrl?: string;
    idCardUrl?: string | string[];
    idCardBackUrl?: string | string[];
    proofOfAddressUrl?: string | string[];
    proofIncomeUrl?: string | string[];
    vehicleUrl?: string | string[];

    // New Videos
    videoSelfieUrl?: string;
    videoHouseUrl?: string;
    videoVehicleUrl?: string;
  };

  // Supplemental Document Request
  supplementalInfo?: {
    requestedAt?: string;
    description?: string; // What the admin asked for
    docUrl?: string; // What the client uploaded
    uploadedAt?: string;
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
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;

  // Company Info
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'BLOCKED';
  internalScore: number;
  totalDebt: number;
  activeLoansCount: number;
  joinedAt: string;

  // New Pre-approval field
  preApprovedOffer?: {
    amount: number;
    createdAt: string;
  };
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

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  startDate: string;
  endDate: string;
  frequency: 'ONCE' | 'DAILY' | 'ALWAYS';
  active: boolean;
  priority: number; // Higher shows first
}

// --- GOALS & PROJECTIONS ---
export interface GoalsSettings {
  // Metas do mês atual
  monthlyLoanGoal: number;           // Meta de volume emprestado
  monthlyClientGoal: number;         // Meta de novos clientes
  monthlyApprovalRateGoal: number;   // Meta de taxa de aprovação (%)

  // Projeções anuais (por mês)
  projections: {
    month: string;   // Ex: "Jan", "Fev", etc
    target: number;  // Valor projetado
  }[];

  // Crescimento esperado
  expectedGrowthRate: number;  // % de crescimento mensal esperado

  // Período da meta
  goalPeriod: string;  // Ex: "12/2024"
}
