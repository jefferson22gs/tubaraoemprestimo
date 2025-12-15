import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit2, Calendar, Link as LinkIcon, Image as ImageIcon, CheckCircle, XCircle, Search } from 'lucide-react';
import { Button } from '../../components/Button';
import { supabaseService } from '../../services/supabaseService';
import { Campaign } from '../../types';
import { useToast } from '../../components/Toast';

const inputStyle = "w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none transition-colors";

export const Marketing: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    frequency: 'ONCE',
    active: true,
    priority: 1
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const data = await supabaseService.getCampaigns();
    setCampaigns(data);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
        addToast("Título e descrição são obrigatórios.", 'warning');
        return;
    }

    setLoading(true);
    const campaignToSave = {
        ...formData,
        id: formData.id || '',
        active: formData.active ?? true,
        priority: formData.priority || 1
    } as Campaign;

    await supabaseService.saveCampaign(campaignToSave);
    setLoading(false);
    setIsModalOpen(false);
    addToast("Campanha salva com sucesso!", 'success');
    loadCampaigns();
  };

  const handleDelete = async (id: string) => {
      if (confirm("Excluir esta campanha permanentemente?")) {
          await supabaseService.deleteCampaign(id);
          addToast("Campanha removida.", 'info');
          loadCampaigns();
      }
  };

  const handleEdit = (c: Campaign) => {
      setFormData(c);
      setIsModalOpen(true);
  };

  const handleCreate = () => {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        frequency: 'ONCE',
        active: true,
        priority: 1
      });
      setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-2">
                <Megaphone size={32} /> Marketing & Indicações
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gerencie banners e promoções para o app do cliente.</p>
        </div>
        
        <Button onClick={handleCreate}>
            <Plus size={18} className="mr-2"/> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
             <div key={camp.id} className={`group bg-zinc-900 border rounded-2xl overflow-hidden transition-all hover:-translate-y-1 shadow-lg ${camp.active ? 'border-zinc-800 hover:border-[#D4AF37]/50' : 'border-red-900/30 opacity-75'}`}>
                 <div className="relative h-40 bg-black">
                    {camp.imageUrl ? (
                        <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-950">
                            <ImageIcon size={48} />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${camp.active ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            {camp.active ? 'Ativa' : 'Inativa'}
                        </span>
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-black/80 text-white border border-zinc-700">
                             {camp.frequency === 'ONCE' ? '1x' : camp.frequency === 'DAILY' ? 'Diário' : 'Sempre'}
                        </span>
                    </div>
                 </div>
                 
                 <div className="p-5">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{camp.title}</h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2 h-10">{camp.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 font-mono">
                        <div className="flex items-center gap-1"><Calendar size={12}/> {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-zinc-800 pt-4">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(camp)} className="flex-1">
                            <Edit2 size={16} className="mr-2"/> Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(camp.id)}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                 </div>
             </div>
          ))}
      </div>

      {campaigns.length === 0 && (
          <div className="text-center py-20 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
              <Megaphone size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma campanha ativa.</p>
              <p className="text-sm">Crie promoções de parceiros ou indicações para engajar seus clientes.</p>
          </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6">
                    {formData.id ? 'Editar Campanha' : 'Nova Campanha'}
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Título da Promoção</label>
                        <input 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className={inputStyle}
                            placeholder="Ex: Ganhe 10% no iFood"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Descrição Curta</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className={`${inputStyle} h-24 resize-none`}
                            placeholder="Ex: Use o cupom TUBARAO10 no Marmitex do Alemão..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-zinc-400 mb-1">Link de Ação (Opcional)</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input 
                                    value={formData.link}
                                    onChange={e => setFormData({...formData, link: e.target.value})}
                                    className={`${inputStyle} pl-10`}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm text-zinc-400 mb-1">Imagem</label>
                             <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="campaign-img"
                                />
                                <label htmlFor="campaign-img" className="flex items-center justify-center gap-2 bg-black border border-zinc-700 rounded-lg p-3 text-sm cursor-pointer hover:border-[#D4AF37] transition-colors">
                                    <ImageIcon size={16} /> {formData.imageUrl ? 'Alterar Imagem' : 'Enviar Imagem'}
                                </label>
                             </div>
                        </div>
                    </div>
                    
                    {formData.imageUrl && (
                        <div className="h-32 w-full rounded-lg overflow-hidden border border-zinc-800">
                             <img src={formData.imageUrl} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Início</label>
                            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Fim</label>
                            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className={inputStyle} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm text-zinc-400 mb-1">Frequência</label>
                             <select 
                                value={formData.frequency}
                                onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                                className={inputStyle}
                             >
                                 <option value="ONCE">Apenas uma vez</option>
                                 <option value="DAILY">Uma vez ao dia</option>
                                 <option value="ALWAYS">Sempre visível</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm text-zinc-400 mb-1">Prioridade (1-10)</label>
                             <input type="number" min="1" max="10" value={formData.priority} onChange={e => setFormData({...formData, priority: Number(e.target.value)})} className={inputStyle} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-zinc-800">
                         <input 
                            type="checkbox" 
                            id="active"
                            checked={formData.active}
                            onChange={e => setFormData({...formData, active: e.target.checked})}
                            className="accent-[#D4AF37] w-5 h-5"
                         />
                         <label htmlFor="active" className="text-white text-sm cursor-pointer select-none">Campanha Ativa?</label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                        <Button onClick={handleSave} isLoading={loading} className="flex-1">Salvar Campanha</Button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};