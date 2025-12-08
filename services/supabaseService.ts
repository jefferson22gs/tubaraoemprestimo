
import { LoanRequest, LoanStatus, LoanPackage, SystemSettings, Customer, CollectionRule, Loan, InteractionLog, Transaction, WhatsappConfig, BrandSettings, UserAccess, UserRole, Installment } from '../types';

// --- STORAGE HELPERS ---
const STORAGE_KEYS = {
  REQUESTS: 'tubarao_requests',
  CUSTOMERS: 'tubarao_customers',
  LOANS: 'tubarao_loans',
  TRANSACTIONS: 'tubarao_transactions',
  SETTINGS: 'tubarao_settings',
  PACKAGES: 'tubarao_packages',
  RULES: 'tubarao_rules',
  WA_CONFIG: 'tubarao_wa_config',
  USER: 'tubarao_user',
  USERS_LIST: 'tubarao_users_list', // Key for user management
  BRAND: 'tubarao_brand_config' 
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn(`Error loading ${key}`, e);
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}. Storage might be full.`, e);
    alert("Atenção: O armazenamento do navegador está cheio. Limpe dados antigos ou resete o sistema nas configurações.");
  }
};

// --- INITIAL MOCK DATA ---

const DEFAULT_PACKAGES: LoanPackage[] = [
  {
    id: '1',
    name: 'Crédito Rápido',
    minValue: 500,
    maxValue: 5000,
    minInstallments: 3,
    maxInstallments: 12,
    interestRate: 5.5,
  },
  {
    id: '2',
    name: 'Empréstimo Veicular',
    minValue: 5000,
    maxValue: 50000,
    minInstallments: 12,
    maxInstallments: 48,
    interestRate: 3.2,
  },
];

const DEFAULT_REQUESTS: LoanRequest[] = [
  {
    id: 'req_001',
    clientName: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    phone: '5511999990001',
    amount: 2500,
    installments: 6,
    status: LoanStatus.PENDING,
    date: '2023-10-25T10:00:00Z',
    documents: {
      selfieUrl: 'https://picsum.photos/200/200',
      idCardUrl: 'https://picsum.photos/400/300',
    },
    signatureUrl: 'https://picsum.photos/300/100',
  },
  {
    id: 'req_002',
    clientName: 'Maria Oliveira',
    cpf: '987.654.321-11',
    email: 'maria@example.com',
    phone: '5511988887777',
    amount: 15000,
    installments: 24,
    status: LoanStatus.APPROVED,
    date: '2023-10-24T14:30:00Z',
    documents: {
        selfieUrl: 'https://picsum.photos/200/200',
        idCardUrl: 'https://picsum.photos/400/300',
        proofOfAddressUrl: 'https://picsum.photos/300/400',
        proofIncomeUrl: [
            'https://picsum.photos/300/400?random=1',
            'https://picsum.photos/300/400?random=2',
            'https://picsum.photos/300/400?random=3'
        ],
        vehicleUrl: [
            'https://picsum.photos/500/300?random=4',
            'https://picsum.photos/500/300?random=5',
            'https://picsum.photos/500/300?random=6',
            'https://picsum.photos/500/300?random=7'
        ],
    },
    signatureUrl: 'https://picsum.photos/300/100',
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  monthlyInterestRate: 5.0,
  lateFeeRate: 2.0,
};

const DEFAULT_WHATSAPP_CONFIG: WhatsappConfig = {
  apiUrl: 'http://localhost:8080',
  apiKey: 'global-api-key',
  instanceName: 'tubarao_fintech',
  isConnected: false
};

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  systemName: "TUBARÃO EMPRÉSTIMO",
  logoUrl: null, // null means use default SVG
  primaryColor: "#FF0000",
  secondaryColor: "#D4AF37",
  backgroundColor: "#000000",
  companyName: "Tubarão Empréstimos S.A.",
  cnpj: "00.000.000/0001-00",
  address: "Av. Paulista, 1000 - São Paulo, SP",
  phone: "(11) 99999-9999"
};

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Marcos Vinícius',
    cpf: '123.456.789-00',
    email: 'marcos@client.com',
    phone: '5511999999999',
    status: 'ACTIVE',
    internalScore: 850,
    totalDebt: 4250.00,
    activeLoansCount: 1,
    joinedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'cust_2',
    name: 'Ana Souza',
    cpf: '987.654.321-99',
    email: 'ana@client.com',
    phone: '5511988888888',
    status: 'ACTIVE',
    internalScore: 620,
    totalDebt: 1200.00,
    activeLoansCount: 1,
    joinedAt: '2023-06-20T00:00:00Z'
  },
  {
    id: 'cust_3',
    name: 'Carlos Pereira',
    cpf: '456.123.789-55',
    email: 'carlos@client.com',
    phone: '5521977777777',
    status: 'BLOCKED',
    internalScore: 300,
    totalDebt: 8500.00,
    activeLoansCount: 2,
    joinedAt: '2023-03-10T00:00:00Z'
  }
];

const DEFAULT_USERS_LIST: UserAccess[] = [
    {
        id: 'admin_1',
        name: 'Admin',
        email: 'admin@tubarao.com',
        role: UserRole.ADMIN,
        createdAt: '2023-01-01T00:00:00Z'
    },
    {
        id: 'client_1',
        name: 'Marcos Vinícius',
        email: 'marcos@client.com',
        role: UserRole.CLIENT,
        createdAt: '2023-01-15T00:00:00Z'
    }
];

const DEFAULT_RULES: CollectionRule[] = [
  {
    id: 'rule_1',
    daysOffset: -3,
    type: 'WHATSAPP',
    messageTemplate: "Olá {nome}, seu boleto Tubarão vence em 3 dias. Evite juros!",
    active: true
  },
  {
    id: 'rule_2',
    daysOffset: 0,
    type: 'WHATSAPP',
    messageTemplate: "Olá {nome}, hoje é o vencimento da sua parcela. Clique para pagar.",
    active: true
  },
  {
    id: 'rule_3',
    daysOffset: 5,
    type: 'EMAIL',
    messageTemplate: "Aviso de atraso: Sua parcela está vencida há 5 dias.",
    active: true
  }
];

const DEFAULT_LOANS: Loan[] = [
  {
    id: 'loan_123',
    amount: 5000.00,
    installmentsCount: 12,
    remainingAmount: 4250.00,
    status: LoanStatus.APPROVED,
    startDate: '2023-10-15T00:00:00Z',
    installments: [
      { 
        id: 'inst_0', 
        dueDate: '2023-10-15T00:00:00Z', 
        amount: 450.00, 
        status: 'PAID', 
        paidAt: '2023-10-14T15:30:00Z',
        proofUrl: 'https://via.placeholder.com/150' 
      },
      { id: 'inst_1', dueDate: '2023-11-15T00:00:00Z', amount: 450.00, status: 'OPEN', pixCode: '00020126330014BR.GOV.BCB.PIX0114+5511999999999520400005303986540450.005802BR5913Tubarao Loans6008Sao Paulo62070503***6304' },
      { id: 'inst_2', dueDate: '2023-12-15T00:00:00Z', amount: 450.00, status: 'OPEN' },
      { id: 'inst_3', dueDate: '2024-01-15T00:00:00Z', amount: 450.00, status: 'OPEN' },
    ]
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', type: 'IN', description: 'Empréstimo Aprovado #123', amount: 5000.00, date: '2023-10-15T14:00:00Z', category: 'LOAN' },
  { id: 'tx_2', type: 'OUT', description: 'Pagamento Parcela 01/12', amount: 450.00, date: '2023-11-14T10:00:00Z', category: 'PAYMENT' },
  { id: 'tx_3', type: 'OUT', description: 'Taxa de Cadastro', amount: 29.90, date: '2023-10-15T14:01:00Z', category: 'FEE' },
];

const MOCK_INTERACTIONS: InteractionLog[] = [
  { id: 'log_1', userName: 'Marcos Vinícius', userRole: 'CLIENT', message: 'Bom dia, quero pagar meu boleto', intent: 'REQUEST_BOLETO', reply: 'Claro! Aqui está o código Pix da sua próxima parcela...', timestamp: '2023-11-10T10:30:00Z' },
  { id: 'log_2', userName: 'Ana Souza', userRole: 'CLIENT', message: 'Vou pagar dia 20', intent: 'PAYMENT_PROMISE', reply: 'Obrigado por avisar. Deixei anotado aqui no sistema.', timestamp: '2023-11-10T11:15:00Z' },
  { id: 'log_3', userName: 'Carlos Pereira', userRole: 'CLIENT', message: 'Não consigo acessar minha conta', intent: 'SUPPORT', reply: 'Entendo. Vou transferir para um atendente humano.', timestamp: '2023-11-09T16:45:00Z' },
];

// --- SERVICE IMPLEMENTATION ---

export const supabaseService = {
  resetSystem: async () => {
    localStorage.clear();
    window.location.reload();
  },

  auth: {
    signIn: async (credentials: any) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const isAdmin = credentials.identifier.toLowerCase().includes('admin') || credentials.identifier === '000.000.000-00';
                const storedUser = loadFromStorage<any>(STORAGE_KEYS.USER, null);

                const user = {
                    id: isAdmin ? 'admin_1' : 'client_1',
                    name: isAdmin ? 'Admin' : (credentials.identifier === '123.456.789-00' ? 'Marcos Vinícius' : 'Novo Cliente'),
                    role: isAdmin ? 'ADMIN' : 'CLIENT',
                    token: 'mock_token_' + Date.now(),
                    avatarUrl: storedUser?.avatarUrl || null 
                };
                saveToStorage(STORAGE_KEYS.USER, user);
                resolve({ user, error: null });
            }, 800);
        });
    },
    signOut: async () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        return Promise.resolve();
    },
    getUser: () => {
        return loadFromStorage<any>(STORAGE_KEYS.USER, null);
    }
  },

  updateUserAvatar: async (avatarUrl: string): Promise<boolean> => {
    const user = loadFromStorage<any>(STORAGE_KEYS.USER, null);
    if (user) {
        user.avatarUrl = avatarUrl;
        saveToStorage(STORAGE_KEYS.USER, user);
        return true;
    }
    return false;
  },

  // --- USER MANAGEMENT ---
  getUsers: async (): Promise<UserAccess[]> => {
    return loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST);
  },

  createUser: async (userData: any): Promise<boolean> => {
    const users = loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST);
    if (users.find((u: UserAccess) => u.email === userData.email)) return false;

    users.push({
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString()
    });
    saveToStorage(STORAGE_KEYS.USERS_LIST, users);
    return true;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    let users = loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST);
    users = users.filter((u: UserAccess) => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS_LIST, users);
    return true;
  },

  // --- BRANDING METHODS ---
  getBrandSettings: async (): Promise<BrandSettings> => {
    return loadFromStorage(STORAGE_KEYS.BRAND, DEFAULT_BRAND_SETTINGS);
  },

  updateBrandSettings: async (settings: BrandSettings): Promise<boolean> => {
    saveToStorage(STORAGE_KEYS.BRAND, settings);
    return true;
  },

  resetBrandSettings: async (): Promise<BrandSettings> => {
    saveToStorage(STORAGE_KEYS.BRAND, DEFAULT_BRAND_SETTINGS);
    return DEFAULT_BRAND_SETTINGS;
  },

  getPackages: async (): Promise<LoanPackage[]> => {
    return loadFromStorage(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
  },

  savePackage: async (pkg: LoanPackage): Promise<boolean> => {
    const packages = loadFromStorage(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    const index = packages.findIndex((p: LoanPackage) => p.id === pkg.id);
    if (index >= 0) {
      packages[index] = pkg;
    } else {
      packages.push({ ...pkg, id: Date.now().toString() });
    }
    saveToStorage(STORAGE_KEYS.PACKAGES, packages);
    return true;
  },

  deletePackage: async (id: string): Promise<boolean> => {
    let packages = loadFromStorage(STORAGE_KEYS.PACKAGES, DEFAULT_PACKAGES);
    packages = packages.filter((p: LoanPackage) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PACKAGES, packages);
    return true;
  },

  getRequests: async (): Promise<LoanRequest[]> => {
    return loadFromStorage(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
  },

  getClientPendingRequest: async (): Promise<LoanRequest | null> => {
    const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    const pending = requests.find((r: LoanRequest) => r.status === LoanStatus.PENDING || r.status === LoanStatus.REJECTED);
    return pending || null;
  },

  submitRequest: async (data: any): Promise<boolean> => {
    const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    
    const newRequest: LoanRequest = {
        id: `req_${Date.now()}`,
        clientName: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone || '5511900000000',
        amount: Number(data.income) * 3 || 5000, // Mock amount logic
        installments: 12,
        status: LoanStatus.PENDING,
        date: new Date().toISOString(),
        documents: {
            selfieUrl: data.selfie,
            idCardUrl: data.idCardFront,
            idCardBackUrl: data.idCardBack,
            proofOfAddressUrl: data.proofAddress,
            proofIncomeUrl: data.proofIncome,
            vehicleUrl: data.vehicleFront
        },
        signatureUrl: data.signature
    };

    requests.unshift(newRequest);
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
    
    // Also create/update the customer record for CRM
    const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    if (!customers.find((c: Customer) => c.cpf === data.cpf)) {
        customers.push({
            id: `cust_${Date.now()}`,
            name: data.name,
            cpf: data.cpf,
            email: data.email,
            phone: data.phone || '5511900000000',
            status: 'ACTIVE',
            internalScore: 500, // Starting score
            totalDebt: 0,
            activeLoansCount: 0,
            joinedAt: new Date().toISOString()
        });
        saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }

    return new Promise(resolve => setTimeout(() => resolve(true), 1500));
  },

  updateRequestStatus: async (id: string, status: LoanStatus): Promise<boolean> => {
    const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    const req = requests.find((r: LoanRequest) => r.id === id);
    if (req) {
        req.status = status;
        saveToStorage(STORAGE_KEYS.REQUESTS, requests);
    }
    return true;
  },

  approveLoan: async (id: string): Promise<boolean> => {
    const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS);
    const reqIndex = requests.findIndex((r: LoanRequest) => r.id === id);
    
    if (reqIndex >= 0) {
        const req = requests[reqIndex];
        req.status = LoanStatus.APPROVED;
        saveToStorage(STORAGE_KEYS.REQUESTS, requests);

        // Add to Transactions
        const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
        transactions.unshift({
            id: `tx_${Date.now()}`,
            type: 'IN',
            category: 'LOAN',
            amount: req.amount,
            date: new Date().toISOString(),
            description: `Empréstimo #${req.id.slice(-4)}`
        });
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

        // Create the Loan Record
        const loans = loadFromStorage(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
        const installmentValue = (req.amount * 1.3) / req.installments; // Mock interest
        
        const newLoan: Loan = {
            id: `loan_${id.split('_')[1]}`,
            amount: req.amount,
            installmentsCount: req.installments,
            remainingAmount: req.amount * 1.3,
            status: LoanStatus.APPROVED,
            startDate: new Date().toISOString(),
            installments: Array.from({ length: req.installments }).map((_, i) => ({
                id: `inst_${Date.now()}_${i+1}`,
                dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                amount: installmentValue,
                status: 'OPEN',
                pixCode: `00020126330014BR.GOV.BCB.PIX...${Date.now()}`
            }))
        };
        loans.unshift(newLoan);
        saveToStorage(STORAGE_KEYS.LOANS, loans);

        // Update Customer stats
        const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
        const customer = customers.find((c: Customer) => c.cpf === req.cpf) || customers[0]; 
        if (customer) {
            customer.activeLoansCount += 1;
            customer.totalDebt += req.amount * 1.3;
            saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
        }
    }
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  },

  rejectLoan: async (id: string): Promise<boolean> => {
    return supabaseService.updateRequestStatus(id, LoanStatus.REJECTED);
  },

  getSettings: async (): Promise<SystemSettings> => {
    return loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings: async (settings: SystemSettings): Promise<boolean> => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    return true;
  },

  getCustomers: async (): Promise<Customer[]> => {
    return loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },

  toggleCustomerStatus: async (id: string, status: 'ACTIVE' | 'BLOCKED'): Promise<boolean> => {
    const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    const cust = customers.find((c: Customer) => c.id === id);
    if(cust) {
        cust.status = status;
        saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }
    return true;
  },

  getCollectionRules: async (): Promise<CollectionRule[]> => {
    return loadFromStorage(STORAGE_KEYS.RULES, DEFAULT_RULES);
  },

  saveCollectionRule: async (rule: CollectionRule): Promise<boolean> => {
    const rules = loadFromStorage(STORAGE_KEYS.RULES, DEFAULT_RULES);
    const index = rules.findIndex((r: CollectionRule) => r.id === rule.id);
    if (index >= 0) {
      rules[index] = rule;
    } else {
      rules.push({ ...rule, id: Date.now().toString() });
    }
    saveToStorage(STORAGE_KEYS.RULES, rules);
    return true;
  },

  deleteCollectionRule: async (id: string): Promise<boolean> => {
    let rules = loadFromStorage(STORAGE_KEYS.RULES, DEFAULT_RULES);
    rules = rules.filter((r: CollectionRule) => r.id !== id);
    saveToStorage(STORAGE_KEYS.RULES, rules);
    return true;
  },

  getClientLoans: async (): Promise<Loan[]> => {
     return loadFromStorage(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
  },

  uploadPaymentProof: async (loanId: string, installmentId: string, proofUrl: string): Promise<boolean> => {
    const loans = loadFromStorage(STORAGE_KEYS.LOANS, DEFAULT_LOANS);
    const loan = loans.find((l: Loan) => l.id === loanId);
    
    if (loan) {
        const inst = loan.installments.find((i: Installment) => i.id === installmentId);
        if (inst) {
            inst.status = 'PAID'; 
            inst.proofUrl = proofUrl;
            inst.paidAt = new Date().toISOString();
            loan.remainingAmount -= inst.amount;
            
            saveToStorage(STORAGE_KEYS.LOANS, loans);

            const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
            transactions.unshift({
                id: `tx_pay_${Date.now()}`,
                type: 'OUT',
                category: 'PAYMENT',
                amount: inst.amount,
                date: new Date().toISOString(),
                description: `Pagamento Parcela #${installmentId.split('_').pop()}`
            });
            saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
        }
    }
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  },

  getTransactions: async (): Promise<Transaction[]> => {
     return loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },

  getInteractionLogs: async (): Promise<InteractionLog[]> => {
    return MOCK_INTERACTIONS;
  },

  getWhatsappConfig: async (): Promise<WhatsappConfig> => {
    return loadFromStorage(STORAGE_KEYS.WA_CONFIG, DEFAULT_WHATSAPP_CONFIG);
  },

  saveWhatsappConfig: async (config: WhatsappConfig): Promise<boolean> => {
    saveToStorage(STORAGE_KEYS.WA_CONFIG, config);
    return true;
  }
};
