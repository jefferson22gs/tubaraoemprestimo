import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X, Percent, Zap, Smartphone, QrCode, CheckCircle2, RotateCcw, MessageSquare, Clock, Palette, Upload, Image as ImageIcon, Building2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { supabaseService } from '../../services/supabaseService';
import { whatsappService } from '../../services/whatsappService';
import { useBrand } from '../../contexts/BrandContext';
import { LoanPackage, SystemSettings, CollectionRule, CollectionRuleType, WhatsappConfig } from '../../types';
import { useToast } from '../../components/Toast';

const inputStyle = "w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none transition-colors";

export const Settings: React.FC = () => {
  const { addToast } = useToast();
  const { settings: brandSettings, updateSettings: updateBrand, resetSettings: resetBrand } = useBrand();
  
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'AUTOMATION' | 'INTEGRATION' | 'BRANDING'>('FINANCIAL');
  
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

  // Branding State (Local state to edit before save)
  const [localBrand, setLocalBrand] = useState(brandSettings);

  useEffect(() => {
    loadData();
  }, []);

  // Sync local brand state when context changes
  useEffect(() => {
    setLocalBrand(brandSettings);
  }, [brandSettings]);

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
    const qr = await whatsappService.getQrCode();
    setQrCode(qr);
    setLoadingWa(false);
    
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

  // --- Branding Handlers ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalBrand(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrand = async () => {
    await updateBrand(localBrand);
    addToast("Identidade visual e dados da empresa atualizados!", 'success');
  };

  const handleRestoreBrand = async () => {
    if (confirm("Restaurar para o padrão Tubarão Empréstimos?")) {
        await resetBrand();
        addToast("Marca restaurada para o padrão.", 'info');
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
          <p className="text-zinc-400 text-sm mt-1">Configure mensagens automáticas via WhatsApp/Email.</p>
        </div>
        <Button onClick={() => { setCurrentRule({ active: true, type: 'WHATSAPP' }); setIsRuleModalOpen(true); }} size="sm">
          <Plus size={18} /> Nova Regra
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => {
           const isBefore = rule.daysOffset < 0;
           const isAfter = rule.daysOffset > 0;
           const label = isBefore ? `${Math.abs(rule.daysOffset)} dias Antes` : isAfter ? `${rule.daysOffset} dias Depois` : 'No Vencimento';
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
          <div className="flex-1 space-y-6">
             <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                   <Smartphone size={20} className="text-green-500" /> WhatsApp API
                </h2>
                <p className="text-zinc-400 text-sm">Configure a conexão com sua API local.</p>
             </div>
             <div className="space-y-4 bg-black p-6 rounded-xl border border-zinc-800">
                <input placeholder="API URL" value={waConfig.apiUrl} onChange={e => setWaConfig({...waConfig, apiUrl: e.target.value})} className={inputStyle} />
                <input placeholder="API Key" type="password" value={waConfig.apiKey} onChange={e => setWaConfig({...waConfig, apiKey: e.target.value})} className={inputStyle} />
                <input placeholder="Instance" value={waConfig.instanceName} onChange={e => setWaConfig({...waConfig, instanceName: e.target.value})} className={inputStyle} />
                <Button onClick={handleSaveWaConfig} isLoading={loadingWa} variant="secondary" className="w-full">Salvar</Button>
             </div>
          </div>
          <div className="w-full md:w-96 flex flex-col items-center justify-center p-6 bg-black rounded-xl border border-zinc-800">
             {!waConfig.isConnected && !qrCode && <Button onClick={handleConnectWa} isLoading={loadingWa}>Gerar QR Code</Button>}
             {waConfig.isConnected && <div className="text-green-500 font-bold"><CheckCircle2 size={48}/> CONECTADO</div>}
             {qrCode && <img src={qrCode} alt="QR" className="w-48 h-48 bg-white p-2 rounded" />}
          </div>
       </div>
    </div>
  );

  const renderBrandingTab = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2 space-y-8">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Palette size={20} className="text-[#D4AF37]" /> Identidade Visual & Empresa
            </h2>
            <p className="text-zinc-400 text-sm">Personalize o nome, cores, logo e dados legais da sua empresa.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            {/* Visual Settings */}
            <div className="space-y-6">
                <h3 className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider">Visual</h3>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Nome do Sistema</label>
                    <input 
                        value={localBrand.systemName} 
                        onChange={(e) => setLocalBrand({...localBrand, systemName: e.target.value})}
                        className={inputStyle} 
                        placeholder="Ex: Minha Fintech"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Cor Primária</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={localBrand.primaryColor} 
                                onChange={(e) => setLocalBrand({...localBrand, primaryColor: e.target.value})}
                                className="h-10 w-12 bg-transparent border-0 cursor-pointer" 
                            />
                            <input 
                                value={localBrand.primaryColor} 
                                onChange={(e) => setLocalBrand({...localBrand, primaryColor: e.target.value})}
                                className={inputStyle} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Cor Secundária</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={localBrand.secondaryColor} 
                                onChange={(e) => setLocalBrand({...localBrand, secondaryColor: e.target.value})}
                                className="h-10 w-12 bg-transparent border-0 cursor-pointer" 
                            />
                            <input 
                                value={localBrand.secondaryColor} 
                                onChange={(e) => setLocalBrand({...localBrand, secondaryColor: e.target.value})}
                                className={inputStyle} 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-black p-6 rounded-xl border border-zinc-800 flex flex-col items-center justify-center">
                    <label className="block text-sm text-zinc-400 mb-4 text-center">Logotipo</label>
                    
                    <div className="relative group w-48 h-24 flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-lg overflow-hidden bg-zinc-900/50 mb-4">
                        {localBrand.logoUrl ? (
                            <img src={localBrand.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                            <span className="text-zinc-600 text-xs">Logo Padrão</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload size={24} className="text-white" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    <div className="flex gap-2">
                        {localBrand.logoUrl && (
                            <Button size="sm" variant="secondary" onClick={() => setLocalBrand({...localBrand, logoUrl: null})}>
                                Remover
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Company Info Settings */}
            <div className="space-y-6">
                <h3 className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                    <Building2 size={16} /> Dados da Empresa (Recibos/Contratos)
                </h3>
                
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Razão Social</label>
                    <input 
                        value={localBrand.companyName} 
                        onChange={(e) => setLocalBrand({...localBrand, companyName: e.target.value})}
                        className={inputStyle} 
                        placeholder="Ex: Minha Empresa Ltda."
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-2">CNPJ</label>
                    <input 
                        value={localBrand.cnpj} 
                        onChange={(e) => setLocalBrand({...localBrand, cnpj: e.target.value})}
                        className={inputStyle} 
                        placeholder="00.000.000/0001-00"
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Endereço Completo</label>
                    <input 
                        value={localBrand.address} 
                        onChange={(e) => setLocalBrand({...localBrand, address: e.target.value})}
                        className={inputStyle} 
                        placeholder="Rua Exemplo, 123 - Cidade/UF"
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Telefone de Contato</label>
                    <input 
                        value={localBrand.phone} 
                        onChange={(e) => setLocalBrand({...localBrand, phone: e.target.value})}
                        className={inputStyle} 
                        placeholder="(11) 99999-9999"
                    />
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex justify-end gap-4">
            <Button variant="secondary" onClick={handleRestoreBrand}>
                Restaurar Padrão
            </Button>
            <Button onClick={handleSaveBrand}>
                <Save size={18} className="mr-2" /> Salvar Identidade
            </Button>
        </div>
    </div>
  );

  return (
    <div className="p-8 bg-black min-h-screen text-white pb-32">
      <h1 className="text-3xl font-bold mb-8 text-[#D4AF37]">Configurações</h1>

      <div className="flex gap-6 border-b border-zinc-800 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('FINANCIAL')} className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'FINANCIAL' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>FINANCEIRO {activeTab === 'FINANCIAL' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}</button>
        <button onClick={() => setActiveTab('AUTOMATION')} className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'AUTOMATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>AUTOMAÇÃO {activeTab === 'AUTOMATION' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}</button>
        <button onClick={() => setActiveTab('INTEGRATION')} className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'INTEGRATION' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>INTEGRAÇÃO {activeTab === 'INTEGRATION' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}</button>
        <button onClick={() => setActiveTab('BRANDING')} className={`pb-4 px-2 text-sm font-bold tracking-wide transition-colors relative whitespace-nowrap ${activeTab === 'BRANDING' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>PERSONALIZAÇÃO {activeTab === 'BRANDING' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#D4AF37] rounded-t-full"></div>}</button>
      </div>

      {activeTab === 'FINANCIAL' && renderFinancialTab()}
      {activeTab === 'AUTOMATION' && renderAutomationTab()}
      {activeTab === 'INTEGRATION' && renderIntegrationTab()}
      {activeTab === 'BRANDING' && renderBrandingTab()}

      <div className="mt-16 pt-8 border-t border-zinc-800">
        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2"><RotateCcw size={18}/> Zona de Perigo</h3>
        <Button variant="danger" className="bg-red-900/10 border border-red-900/50 text-red-500 hover:bg-red-900/20" onClick={handleResetSystem}>
           Resetar Tudo
        </Button>
      </div>

      {isPkgModalOpen && (
        <Modal title={currentPkg.id ? 'Editar Pacote' : 'Novo Pacote'} onClose={() => setIsPkgModalOpen(false)}>
            <div className="space-y-4">
              <input value={currentPkg.name} onChange={e => setCurrentPkg({...currentPkg, name: e.target.value})} className={inputStyle} placeholder="Nome do Pacote" />
              <div className="grid grid-cols-2 gap-4">
                 <input type="number" value={currentPkg.minValue} onChange={e => setCurrentPkg({...currentPkg, minValue: Number(e.target.value)})} className={inputStyle} placeholder="Mínimo" />
                 <input type="number" value={currentPkg.maxValue} onChange={e => setCurrentPkg({...currentPkg, maxValue: Number(e.target.value)})} className={inputStyle} placeholder="Máximo" />
              </div>
              <input type="number" value={currentPkg.interestRate} onChange={e => setCurrentPkg({...currentPkg, interestRate: Number(e.target.value)})} className={inputStyle} placeholder="Juros %" />
              <Button onClick={handleSavePackage} isLoading={loadingPkg} className="w-full mt-4">Salvar</Button>
            </div>
        </Modal>
      )}

      {isRuleModalOpen && (
        <Modal title={currentRule.id ? 'Editar Regra' : 'Nova Regra'} onClose={() => setIsRuleModalOpen(false)}>
            <div className="space-y-4">
              <input type="number" value={currentRule.daysOffset} onChange={e => setCurrentRule({...currentRule, daysOffset: Number(e.target.value)})} className={inputStyle} placeholder="Dias (ex: -3)" />
              <textarea value={currentRule.messageTemplate} onChange={e => setCurrentRule({...currentRule, messageTemplate: e.target.value})} className={inputStyle} placeholder="Mensagem..." />
              <Button onClick={handleSaveRule} isLoading={loadingAutomation} className="w-full mt-4">Salvar</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-xl font-bold text-[#D4AF37]">{title}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
      </div>
      {children}
    </div>
  </div>
);