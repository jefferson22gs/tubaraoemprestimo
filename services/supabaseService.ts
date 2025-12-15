

import { LoanRequest, LoanStatus, LoanPackage, SystemSettings, Customer, CollectionRule, Loan, InteractionLog, Transaction, WhatsappConfig, BrandSettings, UserAccess, UserRole, Installment, Campaign, GoalsSettings } from '../types';

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
    USERS_LIST: 'tubarao_users_list',
    BRAND: 'tubarao_brand_config',
    CAMPAIGNS: 'tubarao_campaigns',
    GOALS: 'tubarao_goals'
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
        console.error(`Error saving ${key}`, e);
    }
};

// --- DEFAULTS ---

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
    systemName: "TUBARÃO EMPRÉSTIMO",
    logoUrl: null,
    primaryColor: "#FF0000",
    secondaryColor: "#D4AF37",
    backgroundColor: "#000000",
    companyName: "Tubarão Empréstimos S.A.",
    cnpj: "00.000.000/0001-00",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 99999-9999"
};

const DEFAULT_USERS_LIST: UserAccess[] = [
    { id: 'admin_1', name: 'Admin', email: 'admin@tubarao.com', role: UserRole.ADMIN, createdAt: '2023-01-01T00:00:00Z' },
    { id: 'client_1', name: 'Marcos Vinícius', email: 'marcos@client.com', role: UserRole.CLIENT, createdAt: '2023-01-15T00:00:00Z' }
];

// --- SERVICE ---

export const supabaseService = {
    resetSystem: async () => {
        localStorage.clear();
        window.location.reload();
    },

    // Auth & Users
    auth: {
        signIn: async (credentials: any) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const users = loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST);
                    const foundUser = users.find((u: UserAccess) => u.email === credentials.identifier || u.email === credentials.identifier.toLowerCase());

                    let user;
                    if (foundUser) {
                        user = { ...foundUser, token: 'mock_token_' + Date.now() };
                    } else {
                        const isAdmin = credentials.identifier === 'admin';
                        user = {
                            id: isAdmin ? 'admin_1' : 'client_1',
                            name: isAdmin ? 'Admin' : 'Marcos Vinícius',
                            role: isAdmin ? 'ADMIN' : 'CLIENT',
                            token: 'mock_token_' + Date.now(),
                            avatarUrl: null
                        };
                    }
                    saveToStorage(STORAGE_KEYS.USER, user);
                    resolve({ user, error: null });
                }, 800);
            });
        },
        signOut: async () => {
            localStorage.removeItem(STORAGE_KEYS.USER);
            return Promise.resolve();
        },
        getUser: () => loadFromStorage<any>(STORAGE_KEYS.USER, null)
    },

    changePassword: async (oldPass: string, newPass: string): Promise<boolean> => {
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
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

    getUsers: async (): Promise<UserAccess[]> => loadFromStorage(STORAGE_KEYS.USERS_LIST, DEFAULT_USERS_LIST),

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

    // Branding
    getBrandSettings: async (): Promise<BrandSettings> => loadFromStorage(STORAGE_KEYS.BRAND, DEFAULT_BRAND_SETTINGS),
    updateBrandSettings: async (settings: BrandSettings): Promise<boolean> => { saveToStorage(STORAGE_KEYS.BRAND, settings); return true; },
    resetBrandSettings: async (): Promise<BrandSettings> => { saveToStorage(STORAGE_KEYS.BRAND, DEFAULT_BRAND_SETTINGS); return DEFAULT_BRAND_SETTINGS; },

    // Packages
    getPackages: async (): Promise<LoanPackage[]> => loadFromStorage(STORAGE_KEYS.PACKAGES, []),
    savePackage: async (pkg: LoanPackage) => {
        const list = loadFromStorage(STORAGE_KEYS.PACKAGES, []);
        const idx = list.findIndex((p: LoanPackage) => p.id === pkg.id);
        if (idx >= 0) list[idx] = pkg; else list.push({ ...pkg, id: Date.now().toString() });
        saveToStorage(STORAGE_KEYS.PACKAGES, list);
        return true;
    },
    deletePackage: async (id: string) => {
        const list = loadFromStorage(STORAGE_KEYS.PACKAGES, []).filter((p: LoanPackage) => p.id !== id);
        saveToStorage(STORAGE_KEYS.PACKAGES, list);
        return true;
    },

    // Settings
    getSettings: async (): Promise<SystemSettings> => loadFromStorage(STORAGE_KEYS.SETTINGS, { monthlyInterestRate: 5, lateFeeRate: 2 }),
    updateSettings: async (s: SystemSettings) => { saveToStorage(STORAGE_KEYS.SETTINGS, s); return true; },

    // Requests
    getRequests: async (): Promise<LoanRequest[]> => loadFromStorage(STORAGE_KEYS.REQUESTS, []),
    submitRequest: async (data: any) => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        requests.unshift({
            id: `req_${Date.now()}`,
            clientName: data.name,
            cpf: data.cpf,
            email: data.email,
            phone: data.phone || '5511999999999',
            amount: Number(data.income) * 3 || 5000,
            installments: 12,
            status: LoanStatus.PENDING,
            date: new Date().toISOString(),
            // New fields
            references: {
                fatherPhone: data.fatherPhone,
                motherPhone: data.motherPhone,
                spousePhone: data.spousePhone
            },
            documents: {
                selfieUrl: data.selfie,
                idCardUrl: data.idCardFront,
                idCardBackUrl: data.idCardBack,
                proofOfAddressUrl: data.proofAddress,
                proofIncomeUrl: data.proofIncome,
                vehicleUrl: data.vehicleFront,
                // Videos
                videoSelfieUrl: data.videoSelfie,
                videoHouseUrl: data.videoHouse,
                videoVehicleUrl: data.videoVehicle
            },
            signatureUrl: data.signature
        });
        saveToStorage(STORAGE_KEYS.REQUESTS, requests);

        const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
        if (!customers.find((c: Customer) => c.cpf === data.cpf)) {
            customers.push({
                id: `cust_${Date.now()}`,
                name: data.name,
                cpf: data.cpf,
                email: data.email,
                phone: data.phone || '',
                status: 'ACTIVE',
                internalScore: 500,
                totalDebt: 0,
                activeLoansCount: 0,
                joinedAt: new Date().toISOString()
            });
            saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
        }
        return true;
    },

    approveLoan: async (id: string) => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        const req = requests.find((r: LoanRequest) => r.id === id);
        if (req) {
            req.status = LoanStatus.APPROVED;
            saveToStorage(STORAGE_KEYS.REQUESTS, requests);

            const loans = loadFromStorage(STORAGE_KEYS.LOANS, []);
            loans.unshift({
                id: `loan_${id.split('_')[1]}`,
                amount: req.amount,
                installmentsCount: req.installments,
                remainingAmount: req.amount * 1.3,
                status: LoanStatus.APPROVED,
                startDate: new Date().toISOString(),
                installments: Array.from({ length: req.installments }).map((_, i) => ({
                    id: `inst_${Date.now()}_${i + 1}`,
                    dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: (req.amount * 1.3) / req.installments,
                    status: 'OPEN'
                }))
            });
            saveToStorage(STORAGE_KEYS.LOANS, loans);
        }
        return true;
    },

    rejectLoan: async (id: string) => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        const req = requests.find((r: LoanRequest) => r.id === id);
        if (req) { req.status = LoanStatus.REJECTED; saveToStorage(STORAGE_KEYS.REQUESTS, requests); }
        return true;
    },

    // Supplemental Documents (Admin Request)
    requestSupplementalDoc: async (requestId: string, description: string) => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        const req = requests.find((r: LoanRequest) => r.id === requestId);
        if (req) {
            req.status = LoanStatus.WAITING_DOCS;
            req.supplementalInfo = {
                requestedAt: new Date().toISOString(),
                description: description,
                docUrl: undefined
            };
            saveToStorage(STORAGE_KEYS.REQUESTS, requests);
            return true;
        }
        return false;
    },

    // Client Upload Supplemental Doc
    uploadSupplementalDoc: async (requestId: string, docUrl: string) => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        const req = requests.find((r: LoanRequest) => r.id === requestId);
        if (req && req.supplementalInfo) {
            req.status = LoanStatus.PENDING; // Go back to pending for admin review
            req.supplementalInfo.docUrl = docUrl;
            req.supplementalInfo.uploadedAt = new Date().toISOString();
            saveToStorage(STORAGE_KEYS.REQUESTS, requests);
            return true;
        }
        return false;
    },

    getClientLoans: async (): Promise<Loan[]> => loadFromStorage(STORAGE_KEYS.LOANS, []),
    getClientPendingRequest: async (): Promise<LoanRequest | null> => {
        const requests = loadFromStorage(STORAGE_KEYS.REQUESTS, []);
        // Check for pending or waiting docs
        return requests.find((r: LoanRequest) => r.status === LoanStatus.PENDING || r.status === LoanStatus.WAITING_DOCS) || null;
    },

    uploadPaymentProof: async (loanId: string, installmentId: string, proofUrl: string): Promise<boolean> => {
        const loans = loadFromStorage(STORAGE_KEYS.LOANS, []);
        const loan = loans.find((l: Loan) => l.id === loanId);
        if (loan) {
            const inst = loan.installments.find((i: Installment) => i.id === installmentId);
            if (inst) {
                inst.status = 'PAID';
                inst.proofUrl = proofUrl;
                inst.paidAt = new Date().toISOString();
                loan.remainingAmount -= inst.amount;
                saveToStorage(STORAGE_KEYS.LOANS, loans);
            }
        }
        return true;
    },

    // CRM & Rules
    getCustomers: async (): Promise<Customer[]> => loadFromStorage(STORAGE_KEYS.CUSTOMERS, []),
    toggleCustomerStatus: async (id: string, status: string) => {
        const list = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
        const item = list.find((c: Customer) => c.id === id);
        if (item) { item.status = status; saveToStorage(STORAGE_KEYS.CUSTOMERS, list); }
        return true;
    },

    // Pre-approval
    sendPreApproval: async (customerId: string, amount: number) => {
        const list = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
        const customer = list.find((c: Customer) => c.id === customerId);
        if (customer) {
            customer.preApprovedOffer = {
                amount: amount,
                createdAt: new Date().toISOString()
            };
            saveToStorage(STORAGE_KEYS.CUSTOMERS, list);
            return true;
        }
        return false;
    },

    // Client check for pre-approval
    getPreApproval: async (): Promise<number | null> => {
        const user = loadFromStorage<any>(STORAGE_KEYS.USER, null);
        if (!user) return null;

        const customers = loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
        // Find customer by email/name simulation
        const customer = customers.find((c: Customer) => c.email === user.email);

        if (customer && customer.preApprovedOffer) {
            return customer.preApprovedOffer.amount;
        }
        return null;
    },

    getCollectionRules: async (): Promise<CollectionRule[]> => loadFromStorage(STORAGE_KEYS.RULES, []),
    saveCollectionRule: async (rule: CollectionRule) => {
        const list = loadFromStorage(STORAGE_KEYS.RULES, []);
        const idx = list.findIndex((r: CollectionRule) => r.id === rule.id);
        if (idx >= 0) list[idx] = rule; else list.push({ ...rule, id: Date.now().toString() });
        saveToStorage(STORAGE_KEYS.RULES, list);
        return true;
    },
    deleteCollectionRule: async (id: string) => {
        const list = loadFromStorage(STORAGE_KEYS.RULES, []).filter((r: CollectionRule) => r.id !== id);
        saveToStorage(STORAGE_KEYS.RULES, list);
        return true;
    },

    getTransactions: async (): Promise<Transaction[]> => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []),
    getInteractionLogs: async (): Promise<InteractionLog[]> => [],

    getWhatsappConfig: async (): Promise<WhatsappConfig> => loadFromStorage(STORAGE_KEYS.WA_CONFIG, { apiUrl: '', apiKey: '', instanceName: '', isConnected: false }),
    saveWhatsappConfig: async (c: WhatsappConfig) => { saveToStorage(STORAGE_KEYS.WA_CONFIG, c); return true; },

    // Campaigns
    getCampaigns: async (): Promise<Campaign[]> => loadFromStorage(STORAGE_KEYS.CAMPAIGNS, []),
    saveCampaign: async (cmp: Campaign) => {
        const list = loadFromStorage(STORAGE_KEYS.CAMPAIGNS, []);
        const idx = list.findIndex((c: Campaign) => c.id === cmp.id);
        if (idx >= 0) list[idx] = cmp; else list.push({ ...cmp, id: Date.now().toString() });
        saveToStorage(STORAGE_KEYS.CAMPAIGNS, list);
        return true;
    },
    deleteCampaign: async (id: string) => {
        const list = loadFromStorage(STORAGE_KEYS.CAMPAIGNS, []).filter((c: Campaign) => c.id !== id);
        saveToStorage(STORAGE_KEYS.CAMPAIGNS, list);
        return true;
    },
    getActiveCampaigns: async (): Promise<Campaign[]> => {
        const list = loadFromStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, []);
        const now = new Date();
        // Sort by priority desc
        return list
            .filter(c => c.active && new Date(c.startDate) <= now && new Date(c.endDate) >= now)
            .sort((a, b) => b.priority - a.priority);
    },

    // Goals & Projections
    getGoalsSettings: async (): Promise<GoalsSettings> => {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

        const defaultGoals: GoalsSettings = {
            monthlyLoanGoal: 600000,
            monthlyClientGoal: 60,
            monthlyApprovalRateGoal: 75,
            projections: [
                { month: 'Jan', target: 80000 },
                { month: 'Fev', target: 95000 },
                { month: 'Mar', target: 110000 },
                { month: 'Abr', target: 125000 },
                { month: 'Mai', target: 140000 },
                { month: 'Jun', target: 155000 },
                { month: 'Jul', target: 170000 },
                { month: 'Ago', target: 185000 },
                { month: 'Set', target: 200000 },
                { month: 'Out', target: 215000 },
                { month: 'Nov', target: 230000 },
                { month: 'Dez', target: 250000 }
            ],
            expectedGrowthRate: 12,
            goalPeriod: currentMonth
        };

        return loadFromStorage(STORAGE_KEYS.GOALS, defaultGoals);
    },

    saveGoalsSettings: async (goals: GoalsSettings): Promise<boolean> => {
        saveToStorage(STORAGE_KEYS.GOALS, goals);
        return true;
    }
};
