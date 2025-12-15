

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

// --- BLACKLIST ---
export interface BlacklistEntry {
  id: string;
  cpf: string;
  name: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  active: boolean;
}

// --- AUDIT LOG ---
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT' | 'SEND_MESSAGE';
  entity: string;  // Ex: 'LOAN_REQUEST', 'CUSTOMER', 'SETTINGS'
  entityId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// --- USER PERMISSIONS ---
export type PermissionLevel = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

export interface UserPermission {
  userId: string;
  level: PermissionLevel;
  permissions: {
    canApproveLoans: boolean;
    canRejectLoans: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canSendMessages: boolean;
    canViewCustomers: boolean;
    canEditCustomers: boolean;
    canViewFinancials: boolean;
  };
}

// --- CLIENT SCORE ---
export interface ClientScore {
  customerId: string;
  score: number;  // 0-1000
  level: 'EXCELLENT' | 'GOOD' | 'REGULAR' | 'BAD' | 'CRITICAL';
  factors: {
    paymentHistory: number;      // Histórico de pagamentos
    onTimePayments: number;      // Pagamentos em dia
    latePayments: number;        // Pagamentos atrasados
    averageDelayDays: number;    // Média de dias de atraso
    totalLoans: number;          // Total de empréstimos
    activeLoans: number;         // Empréstimos ativos
    defaultedLoans: number;      // Empréstimos inadimplentes
    relationshipMonths: number;  // Tempo de relacionamento
  };
  suggestedLimit: number;
  lastUpdate: string;
}

// --- RENEGOTIATION ---
export interface RenegotiationProposal {
  id: string;
  customerId: string;
  customerName: string;
  originalLoanId: string;
  originalAmount: number;
  remainingAmount: number;
  daysOverdue: number;
  proposal: {
    newAmount: number;
    discount: number;
    discountPercent: number;
    newInstallments: number;
    newInstallmentValue: number;
    interestRate: number;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

// --- MESSAGE TEMPLATES ---
export interface MessageTemplate {
  id: string;
  name: string;
  category: 'REMINDER' | 'COLLECTION' | 'WELCOME' | 'APPROVAL' | 'REJECTION' | 'PAYMENT' | 'CUSTOM';
  content: string;
  variables: string[];  // Ex: ['{nome}', '{valor}', '{vencimento}']
  isActive: boolean;
  createdAt: string;
}

// --- MASS MESSAGE ---
export interface MassMessage {
  id: string;
  templateId?: string;
  message: string;
  recipients: string[];  // Customer IDs
  sentCount: number;
  failedCount: number;
  status: 'PENDING' | 'SENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

// --- CONVERSATION HISTORY ---
export interface ConversationMessage {
  id: string;
  customerId: string;
  direction: 'IN' | 'OUT';
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'APP';
  content: string;
  sentBy?: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
}

// --- CONTRACT TEMPLATE ---
export interface ContractTemplate {
  id: string;
  name: string;
  content: string;  // HTML template
  variables: string[];
  isDefault: boolean;
  createdAt: string;
}

// --- RECEIPT ---
export interface Receipt {
  id: string;
  customerId: string;
  customerName: string;
  loanId: string;
  installmentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'PIX' | 'BOLETO' | 'CASH' | 'TRANSFER';
  generatedAt: string;
}

// --- DISCHARGE DECLARATION ---
export interface DischargeDeclaration {
  id: string;
  customerId: string;
  customerName: string;
  cpf: string;
  loanId: string;
  originalAmount: number;
  totalPaid: number;
  startDate: string;
  endDate: string;
  generatedAt: string;
}

// --- FINANCIAL SUMMARY ---
export interface FinancialSummary {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  loansDisbursed: number;
  paymentsReceived: number;
  defaultedAmount: number;
  cashFlow: {
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }[];
}

// --- CALENDAR EVENT ---
export interface CalendarEvent {
  id: string;
  type: 'INSTALLMENT' | 'LOAN_START' | 'LOAN_END' | 'REMINDER';
  title: string;
  date: string;
  customerId?: string;
  customerName?: string;
  amount?: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  loanId?: string;
}
