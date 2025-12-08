
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Upload, User, MapPin, Camera as CameraIcon, PenTool, AlertCircle, FileText, Image as ImageIcon, Car, ScanFace, X, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Camera } from '../../components/Camera';
import { SignaturePad } from '../../components/SignaturePad';
import { supabaseService } from '../../services/supabaseService';
import { aiService } from '../../services/aiService';
import { useToast } from '../../components/Toast';

const steps = [
  { id: 1, title: 'Pessoal', icon: User },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Garantias', icon: CameraIcon },
  { id: 4, title: 'Finalizar', icon: PenTool },
];

export const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifyingBiometrics, setVerifyingBiometrics] = useState(false);
  const [analyzingDocs, setAnalyzingDocs] = useState(false);
  const [errors, setErrors] = useState<{ cpf?: string; cep?: string; biometrics?: string; doc?: string }>({});
  const [showTerms, setShowTerms] = useState(false);
  
  // State updated to hold arrays for files
  const [formData, setFormData] = useState({
    name: '', cpf: '', email: '', phone: '', birthDate: '',
    cep: '', address: '', number: '', income: '', occupation: '',
    selfie: '', 
    idCardFront: [] as string[], 
    idCardBack: [] as string[], 
    proofAddress: [] as string[], 
    proofIncome: [] as string[],
    
    // Vehicle Data
    hasVehicle: false,
    vehicleCRLV: [] as string[],
    vehicleFront: [] as string[],
    vehicleBack: [] as string[],
    vehicleSide: [] as string[],

    signature: '', 
    termsAccepted: false
  });

  // CPF Validation Helper
  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length === 0) return undefined;
    if (cleanCPF.length < 11) return "CPF incompleto";
    if (/^(\d)\1+$/.test(cleanCPF)) return "CPF inválido";
    return undefined;
  };

  const fetchAddress = async (cleanCep: string) => {
    setErrors(prev => ({ ...prev, cep: undefined }));
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado." }));
        setFormData(prev => ({ ...prev, address: '' }));
      } else {
        setFormData(prev => ({
          ...prev,
          address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }));
      }
    } catch (e) {
      console.error("Erro CEP", e);
      setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP." }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cpf') {
      const nums = value.replace(/\D/g, '').slice(0, 11);
      newValue = nums.replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      const error = validateCPF(newValue);
      setErrors(prev => ({ ...prev, cpf: error }));
    }

    if (name === 'cep') {
      let v = value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
      newValue = v;
      const cleanCep = v.replace(/\D/g, '');
      if (cleanCep.length === 8) fetchAddress(cleanCep);
      else setErrors(prev => ({ ...prev, cep: undefined }));
    }

    setFormData({ ...formData, [name]: newValue });
  };

  // Multiple File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: string[] = [];
      const promises = Array.from(files).map((file: File) => {
          return new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  newFiles.push(reader.result as string);
                  resolve();
              };
              reader.readAsDataURL(file);
          });
      });

      Promise.all(promises).then(() => {
          setFormData(prev => ({
              ...prev,
              [fieldName]: [...(prev[fieldName as keyof typeof prev] as string[]), ...newFiles]
          }));
      });
    }
  };

  const removeFile = (fieldName: string, index: number) => {
      setFormData(prev => {
          const currentFiles = prev[fieldName as keyof typeof prev] as string[];
          const newFiles = currentFiles.filter((_, i) => i !== index);
          return { ...prev, [fieldName]: newFiles };
      });
  };

  const validateDocuments = async (): Promise<boolean> => {
    setAnalyzingDocs(true);
    setErrors(prev => ({ ...prev, doc: undefined }));
    
    // Only analyze the first front ID image
    if (formData.idCardFront.length > 0) {
        try {
            const result = await aiService.analyzeDocument(formData.idCardFront[0]);
            
            if (!result.valid) {
                // If AI fails to read, we don't block but warn (fallback to human review)
                console.warn("OCR failed to read document");
                setAnalyzingDocs(false);
                return true; 
            }

            const cleanInputCPF = formData.cpf.replace(/\D/g, '');
            const cleanDocCPF = result.cpf.replace(/\D/g, '');
            
            // Fuzzy name check
            const inputNameParts = formData.name.toUpperCase().split(' ');
            const docName = result.name.toUpperCase();
            const nameMatch = inputNameParts.some(part => docName.includes(part) && part.length > 2);

            if (cleanDocCPF && cleanInputCPF !== cleanDocCPF) {
                const msg = `CPF do documento (${result.cpf}) não confere com o digitado.`;
                setErrors(prev => ({ ...prev, doc: msg }));
                addToast(msg, 'error');
                setAnalyzingDocs(false);
                return false;
            }

            if (!nameMatch && result.name.length > 5) {
                 const msg = `Nome no documento (${result.name}) parece diferente do cadastro.`;
                 // Warning only, don't block strictly for names due to OCR complexity
                 addToast(msg, 'warning');
            }

        } catch (e) {
            console.error("Validation error", e);
        }
    }
    
    setAnalyzingDocs(false);
    return true;
  };

  const validateBiometrics = async (): Promise<boolean> => {
    setVerifyingBiometrics(true);
    setErrors(prev => ({ ...prev, biometrics: undefined }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Validation: Success if selfie exists and at least one ID photo exists
    const isMatch = formData.selfie.length > 100 && formData.idCardFront.length > 0;
    setVerifyingBiometrics(false);

    if (isMatch) return true;
    else {
      const msg = "A selfie não corresponde ao documento. Tente novamente.";
      setErrors(prev => ({ ...prev, biometrics: msg }));
      addToast(msg, 'error');
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (errors.cpf || !formData.cpf || !formData.name || !formData.email) {
        addToast("Preencha os dados obrigatórios.", 'warning');
        return;
      }
    }
    if (currentStep === 2) {
       if (errors.cep || !formData.cep || !formData.address || !formData.number || !formData.income || formData.proofIncome.length === 0) {
          addToast("Endereço e Comprovante de Renda são obrigatórios.", 'warning');
          return;
       }
    }
    if (currentStep === 3) {
      if (!formData.selfie || formData.idCardFront.length === 0 || formData.idCardBack.length === 0 || formData.proofAddress.length === 0) {
        addToast("Selfie e Documentos (RG/Endereço) são obrigatórios.", 'warning');
        return;
      }
      if (formData.hasVehicle) {
        if (formData.vehicleCRLV.length === 0 || formData.vehicleFront.length === 0) {
           addToast("Fotos do veículo são obrigatórias.", 'warning');
           return;
        }
      }
      
      // 1. Analyze Document Data (OCR)
      const docsValid = await validateDocuments();
      if (!docsValid) return;

      // 2. Validate Biometrics (Face Match)
      const bioValid = await validateBiometrics();
      if (!bioValid) return;
    }
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await supabaseService.submitRequest(formData);
    setLoading(false);
    addToast("Solicitação enviada com sucesso!", 'success');
    navigate('/');
  };

  // UI Component for Multiple Uploads with Preview
  const renderUploadArea = (name: string, label: string, files: string[]) => (
    <div className="space-y-3">
        <label className="text-sm text-zinc-400 font-medium block">{label}</label>
        
        <div className="grid grid-cols-3 gap-2">
            {files.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-black group">
                    <img src={file} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => removeFile(name, idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            
            <div className="relative group">
                <input 
                    type="file" 
                    id={name}
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, name)}
                    className="hidden" 
                />
                <label 
                    htmlFor={name} 
                    className="flex flex-col items-center justify-center w-full aspect-square rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-[#D4AF37] cursor-pointer transition-all"
                >
                    <Plus size={24} className="text-zinc-500 group-hover:text-[#D4AF37]" />
                    <span className="text-[10px] text-zinc-500 mt-1">Adicionar</span>
                </label>
            </div>
        </div>
    </div>
  );

  const isFormComplete = 
    formData.termsAccepted && 
    formData.signature && 
    formData.selfie && 
    formData.idCardFront.length > 0;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-12">
      {/* Header Mobile */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-900 p-4 flex items-center justify-between">
         <div className="flex items-center gap-2" onClick={() => navigate('/')}>
             <ChevronLeft className="text-zinc-400" />
             <span className="font-bold">Solicitação</span>
         </div>
         <div className="text-sm font-medium text-[#D4AF37]">Passo {currentStep}/4</div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        
        {/* Progress Steps */}
        <div className="flex justify-between mb-8 px-2 relative">
           {/* Connecting Line */}
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 -translate-y-1/2 rounded-full"></div>
           
           {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-black px-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 
                  isCompleted ? 'bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]' : 
                  'bg-zinc-900 text-zinc-600 border border-zinc-800'
                }`}>
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          
          {(verifyingBiometrics || analyzingDocs) && (
             <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">
                    {analyzingDocs ? 'Analisando Documento (OCR)...' : 'Analisando Biometria'}
                </h3>
                <p className="text-zinc-400 text-sm">
                    {analyzingDocs ? 'Nossa IA está lendo seus dados.' : 'Aguarde enquanto nossa IA valida sua identidade.'}
                </p>
             </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-2">Dados Pessoais</h2>
              
              <div className="space-y-4">
                <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Seu nome" />
                
                <div>
                  <Input 
                     label="CPF" 
                     name="cpf" 
                     value={formData.cpf} 
                     onChange={handleChange} 
                     placeholder="000.000.000-00"
                     error={errors.cpf} 
                  />
                </div>

                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nome@email.com" />
                <Input label="Data de Nascimento" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-2">Localização & Renda</h2>
              
              <div className="space-y-4">
                <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" error={errors.cep} />
                <Input label="Endereço" name="address" value={formData.address} onChange={()=>{}} readOnly className="opacity-60 cursor-not-allowed" />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Número" name="number" value={formData.number} onChange={handleChange} placeholder="123" />
                    <Input label="Renda Mensal" name="income" type="number" value={formData.income} onChange={handleChange} placeholder="R$ 0,00" />
                </div>
                
                <div className="pt-2 border-t border-zinc-800 mt-4">
                    {renderUploadArea('proofIncome', 'Comprovante de Renda (PDF/Foto)', formData.proofIncome)}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <h2 className="text-xl font-bold text-white">Validação</h2>
              
              {errors.biometrics && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  {errors.biometrics}
                </div>
              )}
              
              {errors.doc && (
                <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  {errors.doc}
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                   <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><ScanFace className="text-[#D4AF37]" size={18}/> Selfie</h3>
                   <Camera 
                     label="Tirar Selfie" 
                     onCapture={(img) => setFormData({...formData, selfie: img})} 
                   />
                </div>

                <div className="space-y-6">
                   {renderUploadArea('idCardFront', 'RG/CNH (Frente)', formData.idCardFront)}
                   {renderUploadArea('idCardBack', 'RG/CNH (Verso)', formData.idCardBack)}
                   {renderUploadArea('proofAddress', 'Comp. Residência', formData.proofAddress)}
                </div>

                <div className="pt-4 border-t border-zinc-800">
                   <label className="flex items-center gap-3 p-4 bg-black border border-zinc-800 rounded-xl cursor-pointer hover:border-[#D4AF37] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.hasVehicle}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasVehicle: e.target.checked }))}
                        className="accent-[#D4AF37] w-5 h-5"
                      />
                      <div className="flex-1">
                          <span className="block text-sm font-bold text-white">Possui Veículo?</span>
                          <span className="text-xs text-zinc-500">Aumente suas chances de aprovação.</span>
                      </div>
                      <Car size={24} className={formData.hasVehicle ? "text-[#D4AF37]" : "text-zinc-600"} />
                   </label>

                   {formData.hasVehicle && (
                      <div className="mt-4 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                          {renderUploadArea('vehicleCRLV', 'Doc. (CRLV)', formData.vehicleCRLV)}
                          {renderUploadArea('vehicleFront', 'Foto Frente', formData.vehicleFront)}
                      </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
              <h2 className="text-xl font-bold text-white">Assinatura</h2>
              
              <SignaturePad onSign={(sig) => setFormData({...formData, signature: sig})} />
              
              <div className="flex items-start gap-3 p-4 bg-black border border-zinc-800 rounded-xl">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                  className="mt-1 accent-[#D4AF37] w-5 h-5 cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-zinc-400 select-none">
                  Li e concordo com os <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#D4AF37] font-bold cursor-pointer hover:underline">Termos de Uso</span>. Declaro que as informações enviadas são verdadeiras.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-black/90 border-t border-zinc-900 flex gap-4 z-40 backdrop-blur-md">
           {currentStep > 1 && (
             <Button onClick={handleBack} variant="secondary" className="flex-1" disabled={verifyingBiometrics || analyzingDocs}>
                Voltar
             </Button>
           )}
           
           {currentStep < 4 ? (
             <Button onClick={handleNext} className="flex-1" isLoading={verifyingBiometrics || analyzingDocs}>
                {verifyingBiometrics || analyzingDocs ? 'Validando...' : 'Continuar'}
             </Button>
           ) : (
             <Button onClick={handleSubmit} className="flex-1" isLoading={loading} disabled={!isFormComplete}>
                Finalizar Pedido
             </Button>
           )}
        </div>

      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Termos de Uso</h3>
                    <button onClick={() => setShowTerms(false)}><X className="text-zinc-500 hover:text-white" /></button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-zinc-300 space-y-4">
                    <p><strong>1. ACEITAÇÃO</strong><br/>Ao utilizar a plataforma Tubarão Empréstimos, você concorda com a coleta e processamento de seus dados para fins de análise de crédito.</p>
                    <p><strong>2. VERACIDADE</strong><br/>Você declara que todas as informações, documentos e biometria fornecidos são verdadeiros e autênticos, sob pena de responsabilidade civil e criminal.</p>
                    <p><strong>3. CONSULTA</strong><br/>Autorizo a consulta de meu CPF em órgãos de proteção ao crédito (SPC/Serasa) e no Sistema de Informações de Crédito (SCR) do Banco Central.</p>
                    <p><strong>4. BIOMETRIA</strong><br/>Consinto com a coleta da minha imagem facial (selfie) para fins de prevenção à fraude e validação de identidade (Liveness Check).</p>
                    <p><strong>5. JUROS E MULTAS</strong><br/>Estou ciente das taxas de juros aplicadas e que o atraso no pagamento acarretará multas e juros moratórios conforme contrato.</p>
                </div>
                <div className="p-6 border-t border-zinc-800 bg-black/50 rounded-b-2xl">
                    <Button onClick={() => { setFormData({...formData, termsAccepted: true}); setShowTerms(false); }} className="w-full">
                        Li e Concordo
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Reusable Input Component for Wizard
const Input = ({ label, error, className = "", ...props }: any) => (
    <div>
        <label className="block text-xs text-zinc-400 mb-1.5 ml-1">{label}</label>
        <input 
            className={`w-full bg-black border rounded-lg p-3 text-white text-sm focus:border-[#D4AF37] outline-none transition-colors ${error ? 'border-red-900 focus:border-red-500' : 'border-zinc-700'} ${className}`}
            {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
);
