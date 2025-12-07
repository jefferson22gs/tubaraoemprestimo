
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X, Percent, Zap, Smartphone, QrCode, CheckCircle2, RotateCcw, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../../components/Button';
import { supabaseService } from '../../services/supabaseService';
import { whatsappService } from '../../services/whatsappService';
import { LoanPackage, SystemSettings, CollectionRule, CollectionRuleType, WhatsappConfig } from '../../types';
import { useToast } from '../../components/Toast';

// Add these classes via Tailwind utility or keep inline style, ensuring input-field class exists
const inputStyle = "w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none transition-colors";

export const Settings: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'AUTOMATION' | 'INTEGRATION'>('FINANCIAL');
  
  // Financial State
  const [settings, setSettings] = useState<SystemSettings>({ monthlyInterestRate: 0, lateFeeRate: 0 });
  const [packages, setPackages] = useState<LoanPackage[]>([]);
  const [loadingFinancial, setLoadingFinancial] = useState(false);
  const [loadingPkg, setLoadingPkg] = useState(false);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<Partial<LoanPackage>>({});

  // Automation State
  const [rules, setRules] = useState<CollectionRule[]>([]);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<CollectionRule>>({});

  // Integration State
  const [waConfig, setWaConfig] = useState<WhatsappConfig>({ apiUrl: '', apiKey: '', instanceName: '', isConnected: false });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingWa, setLoadingWa] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [settingsData, packagesData, rulesData, waData] = await Promise.all([
      supabaseService.getSettings(),
      supabaseService.getPackages(),
      supabaseService.getCollectionRules(),
      whatsappService.getConfig()
    ]);
    setSettings(settingsData);
    setPackages(packagesData);
    setRules(rulesData);
    setWaConfig(waData);
  };

  // --- Financial Handlers ---
  const handleSaveSettings = async () => {
    setLoadingFinancial(true);
    await supabaseService.updateSettings(settings);
    setLoadingFinancial(false);
    addToast('Taxas atualizadas!', 'success');
  };

  const handleSavePackage = async () => {
    if (!currentPkg.name || !currentPkg.minValue || !currentPkg.maxValue) return;
    setLoadingPkg(true);
    const pkgToSave = {
        ...currentPkg,
        id: currentPkg.id || '', 
        interestRate: currentPkg.interestRate || 0,
        minInstallments: currentPkg.minInstallments || 1,
        maxInstallments: currentPkg.maxInstallments || 12,
    } as LoanPackage;

    await supabaseService.savePackage(pkgToSave);
    setLoadingPkg(false);
    setIsPkgModalOpen(false);
    loadData();
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Excluir este pacote?')) {
      await supabaseService.deletePackage(id);
      loadData();
    }
  };

  // --- Automation Handlers ---
  const handleSaveRule = async () => {
    if (!currentRule.messageTemplate) return;
    setLoadingAutomation(true);
    const ruleToSave = {
      ...currentRule,
      id: currentRule.id || '',
      daysOffset: currentRule.daysOffset || 0,
      type: currentRule.type || 'WHATSAPP',
      active: currentRule.active ?? true
    } as CollectionRule;

    await supabaseService.saveCollectionRule(ruleToSave);
    setLoadingAutomation(false);
    setIsRuleModalOpen(false);
    loadData();
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Excluir esta regra de automação?')) {
      await supabaseService.deleteCollectionRule(id);
      loadData();
    }
  };

  // --- Integration Handlers ---
  const handleSaveWaConfig = async () => {
    setLoadingWa(true);
    await whatsappService.updateConfig(waConfig);
    setLoadingWa(false);
    addToast('Configuração salva!', 'success');
  };

  const handleConnectWa = async () => {
    setLoadingWa(true);
    // Simulate fetching QR Code
    const qr = await whatsappService.getQrCode();
    setQrCode(qr);
    setLoadingWa(false);
    
    // Simulate connection success after 5 seconds
    setTimeout(async () => {
        const updated = { ...waConfig, isConnected: true };
        setWaConfig(updated);
        await whatsappService.updateConfig(updated);
        setQrCode(null);
        addToast('WhatsApp Conectado com sucesso!', 'success');
    }, 5000);
  };

  const handleDisconnectWa = async () => {
    if(confirm("Desconectar instância?")) {
        await whatsappService.disconnect();
        setWaConfig(prev => ({ ...prev, isConnected: false }));
        addToast('WhatsApp desconectado.', 'info');
    }
  };

  const handleResetSystem = async () => {
    if (confirm("ATENÇÃO: Isso apagará TODOS os dados (empréstimos, clientes, configurações) e restaurará o estado inicial do sistema. Continuar?")) {
      await supabaseService.resetSystem();
    }
  };

  // --- Render Helpers ---

  const renderFinancialTab = () => (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
        {/* Global Rates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Percent size={20} className="text-[#D4AF37]" /> Taxas Globais
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Juros Mensal (%)</label>
                <input type="number" step="0.1" value={settings.monthlyInterestRate} onChange={(e) => setSettings({...settings, monthlyInterestRate: Number(e.target.value)})} className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Multa Atraso (%)</label>
                <input type="number" step="0.1" value={settings.lateFeeRate} onChange={(e) => setSettings({...settings, lateFeeRate: Number(e.target.value)})} className={inputStyle} />
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveSettings} isLoading={loadingFinancial} className="w-full"><Save size={18} /> Salvar Taxas</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Pacotes de Empréstimo</h2>
              <Button onClick={() => { setCurrentPkg({}); setIsPkgModalOpen(true); }} size="sm"><Plus size={18} /> Novo</Button>
            </div>
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-black border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#D4AF37]/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-white">{pkg.name}</h3>
                    <div className="text-sm text-zinc-400 flex flex-wrap gap-4 mt-1">
                      <span>R$ {pkg.minValue.toLocaleString()} - {pkg.maxValue.toLocaleString()}</span>
                      <span className="text-[#D4AF37]">{pkg.interestRate}% a.m.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { setCurrentPkg(pkg); setIsPkgModalOpen(true); }} className="px-3"><Edit2 size={16} /></Button>
                    <Button variant="danger" onClick={() => handleDeletePackage(pkg.id)} className="px-3"><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-[#D4AF37]" /> Régua de Cobrança
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Configure mensagens automáticas via WhatsApp/Email baseadas no vencimento.</p>
        </div>
        <Button onClick={() => { setCurrentRule({ active: true, type: 'WHATSAPP' }); setIsRuleModalOpen(true); }} size="sm">
          <Plus size={18} /> Nova Regra
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => {
           const isBefore = rule.daysOffset < 0;
           const isAfter = rule.daysOffset > 0;
           const label = isBefore 
             ? `${Math.abs(rule.daysOffset)} dias Antes` 
             : isAfter 
               ? `${rule.daysOffset} dias Depois` 
               : 'No Vencimento';
           const color = isBefore ? 'text-blue-400' : isAfter ? 'text-red-400' : 'text-yellow-400';

           return (
            <div key={rule.id} className="relative group bg-black border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-[#D4AF37]/50 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                   {rule.type === 'WHATSAPP' ? <MessageSquare size={24} className="text-green-500"/> : <Clock size={24} className="text-blue-500"/>}
                </div>
                <div>
                   <div className={`text-sm font-bold uppercase tracking-wider mb-1 ${color}`}>{label}</div>
                   <p className="text-zinc-300 italic">"{rule.messageTemplate}"</p>
                   <div className="mt-2 text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded w-fit">
                      Canal: {rule.type}
                   </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border-l border-zinc-800 pl-6">
                <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`}></div>
                   <span className="text-sm text-zinc-500">{rule.active ? 'Ativa' : 'Pausada'}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setCurrentRule(rule); setIsRuleModalOpen(true); }} className="px-3"><Edit2 size={16} /></Button>
                  <Button variant="danger" onClick={() => handleDeleteRule(rule.id)} className="px-3"><Trash2 size={16} /></Button>
                </div>
              </div>
            </div>
           )
        })}
      </div>
    </div>
  );

  const renderIntegrationTab = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="flex flex-col md:flex-row gap-8">
          {/* Config Form */}
          <div className="flex-1 space-y-6">
             <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                   <Smartphone size={20} className="text-green-500" /> WhatsApp API (Evolution/Baileys)
                </h2>
                <p className="text-zinc-400 text-sm">Configure a conexão com sua API local para disparos automáticos.</p>
             </div>

             <div className="space-y-4 bg-black p-6 rounded-xl border border-zinc-800">
                <input 
                   placeholder="API URL (ex: http://localhost:8080)" 
                   value={waConfig.apiUrl}
                   onChange={e => setWaConfig({...waConfig, apiUrl: e.target.value})}
                   className={inputStyle}
                />
                <input 
                   placeholder="Global API Key" 
                   type="password"
                   value={waConfig.apiKey}
                   onChange={e => setWaConfig({...waConfig, apiKey: e.target.value})}
                   className={inputStyle}
                />
                <input 
                   placeholder="Instance Name (ex: tubarao)" 
                   value={waConfig.instanceName}
                   onChange={e => setWaConfig({...waConfig, instanceName: e.target.value})}
                   className={inputStyle}
                />
                <Button onClick={handleSaveWaConfig} isLoading={loadingWa} variant="secondary" className="w-full">
                   Salvar Configuração
                </Button>
             </div>
          </div>

          {/* Connection Status & QR Code */}
          <div className="w-full md:w-96 flex flex-col items-center justify-center p-6 bg-black rounded-xl border border-zinc-800">
             <div className="mb-4">
                {waConfig.isConnected ? (
                   <div className="flex flex-col items-center text-green-500 animate-in zoom-in">
                      <CheckCircle2 size={64} className="mb-2" />
                      <span className="font-bold text-lg">CONECTADO</span>
                      <span className="text-xs text-zinc-500 mt-1">Instância: {waConfig.instanceName}</span>
                   </div>
                ) : qrCode ? (
                   <div className="bg-white p-2 rounded-lg animate-in fade-in">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                   </div>
                ) : (
                   <div className="w-48 h-48 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-zinc-600 flex-col gap-2">
                      <QrCode size={40} />
                      <span className="text-xs">Aguardando Conexão</span>
                   </div>
                )}
             </div>

             <div className="w-full space-y-2">
                {!waConfig.isConnected && !qrCode && (
                   <Button onClick={handleConnectWa} isLoading={loadingWa} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 border-none">
                      Gerar QR Code
                   </Button>
                )}
                {waConfig.isConnected && (
                   <Button onClick={handleDisconnectWa} variant="danger" className="w-full">
                      Desconectar
                   </Button>
                )}
                <div className="text-center mt-2">
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Status da Sessão</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="p-8 bg-black min-h-screen text-white pb-32">
      <h1 className="text-3xl font-bold mb-8 text-[#D4AF37]">Configurações do Sistema</h1>

      {/* Tabs Header */}
      <div className="flex gap-6 border-b border-zinc-800 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('FINANCIAL')} 
          className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'FINANCIAL' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          FINANCEIRO
          {activeTab === 'FINANCIAL' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('AUTOMATION')} 
          className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'AUTOMATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          AUTOMAÇÃO & CRM
          {activeTab === 'AUTOMATION' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('INTEGRATION')} 
          className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'INTEGRATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          INTEGRAÇÃO
          {activeTab === 'INTEGRATION' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'FINANCIAL' && renderFinancialTab()}
      {activeTab === 'AUTOMATION' && renderAutomationTab()}
      {activeTab === 'INTEGRATION' && renderIntegrationTab()}

      {/* Danger Zone */}
      <div className="mt-16 pt-8 border-t border-zinc-800">
        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2"><RotateCcw size={18}/> Zona de Perigo</h3>
        <p className="text-zinc-500 text-sm mb-4">Ações irreversíveis para testes e demonstração.</p>
        <Button variant="danger" className="bg-red-900/10 border border-red-900/50 text-red-500 hover:bg-red-900/20" onClick={handleResetSystem}>
           Resetar Dados de Demonstração
        </Button>
      </div>

      {/* Package Modal */}
      {isPkgModalOpen && (
        <Modal title={currentPkg.id ? 'Editar Pacote' : 'Novo Pacote'} onClose={() => setIsPkgModalOpen(false)}>
            <div className="space-y-4">
              <input value={currentPkg.name} onChange={e => setCurrentPkg({...currentPkg, name: e.target.value})} className={inputStyle} placeholder="Nome do Pacote" />
              <div className="grid grid-cols-2 gap-4">
                 <input type="number" value={currentPkg.minValue} onChange={e => setCurrentPkg({...currentPkg, minValue: Number(e.target.value)})} className={inputStyle} placeholder="Mínimo (R$)" />
                 <input type="number" value={currentPkg.maxValue} onChange={e => setCurrentPkg({...currentPkg, maxValue: Number(e.target.value)})} className={inputStyle} placeholder="Máximo (R$)" />
              </div>
              <input type="number" value={currentPkg.interestRate} onChange={e => setCurrentPkg({...currentPkg, interestRate: Number(e.target.value)})} className={inputStyle} placeholder="Juros (%)" />
              <div className="flex gap-3 pt-4">
                 <Button onClick={handleSavePackage} isLoading={loadingPkg} className="w-full">Salvar</Button>
              </div>
            </div>
        </Modal>
      )}

      {/* Rule Modal */}
      {isRuleModalOpen && (
        <Modal title={currentRule.id ? 'Editar Regra' : 'Nova Regra'} onClose={() => setIsRuleModalOpen(false)}>
            <div className="space-y-4">
              <div>
                <label className="label">Quando enviar?</label>
                <div className="flex gap-2">
                   <input type="number" value={currentRule.daysOffset} onChange={e => setCurrentRule({...currentRule, daysOffset: Number(e.target.value)})} className={`${inputStyle} w-24`} />
                   <div className="text-zinc-500 text-sm self-center">Dias em relação ao vencimento (-3 = 3 dias antes)</div>
                </div>
              </div>
              
              <div>
                 <label className="label">Canal</label>
                 <select value={currentRule.type} onChange={e => setCurrentRule({...currentRule, type: e.target.value as CollectionRuleType})} className={inputStyle}>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                 </select>
              </div>

              <div>
                 <label className="label">Mensagem</label>
                 <textarea 
                    value={currentRule.messageTemplate} 
                    onChange={e => setCurrentRule({...currentRule, messageTemplate: e.target.value})} 
                    className={`${inputStyle} h-32 resize-none`} 
                    placeholder="Olá {nome}, sua fatura vence hoje..."
                 />
                 <div className="text-xs text-zinc-500 mt-1">Variáveis disponíveis: {'{nome}'}, {'{valor}'}, {'{vencimento}'}</div>
              </div>
              
              <div className="flex items-center gap-2">
                 <input type="checkbox" checked={currentRule.active} onChange={e => setCurrentRule({...currentRule, active: e.target.checked})} className="accent-[#D4AF37] w-5 h-5" />
                 <label className="text-sm text-zinc-300">Regra Ativa</label>
              </div>

              <div className="flex gap-3 pt-4">
                 <Button onClick={handleSaveRule} isLoading={loadingAutomation} className="w-full">Salvar Regra</Button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

// Helper components for styles
const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-xl font-bold text-[#D4AF37]">{title}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
      </div>
      {children}
    </div>
  </div>
);
