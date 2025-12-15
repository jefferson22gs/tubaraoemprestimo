// 📄 Document Generator - Contratos, Recibos e Declarações
import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Eye, Receipt as ReceiptIcon, Award, FileCheck, Plus, Search, Filter, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { documentService } from '../../services/adminService';
import { supabaseService } from '../../services/supabaseService';
import { useBrand } from '../../contexts/BrandContext';
import { Receipt, DischargeDeclaration, Customer, Loan } from '../../types';
import { useToast } from '../../components/Toast';

export const DocumentsPage: React.FC = () => {
    const { addToast } = useToast();
    const { settings: brandSettings } = useBrand();
    const [activeTab, setActiveTab] = useState<'receipts' | 'declarations' | 'contracts'>('receipts');
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [declarations, setDeclarations] = useState<DischargeDeclaration[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'receipt' | 'declaration'>('receipt');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedLoanId, setSelectedLoanId] = useState('');
    const [previewHTML, setPreviewHTML] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [customersData, loansData] = await Promise.all([
            supabaseService.getCustomers(),
            supabaseService.getClientLoans()
        ]);
        setCustomers(customersData);
        setLoans(loansData);
        setReceipts(documentService.getReceipts());
        setDeclarations(documentService.getDeclarations());
    };

    const handleGenerateReceipt = () => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) {
            addToast('Selecione um cliente', 'warning');
            return;
        }

        const receipt = documentService.generateReceipt({
            customerId: customer.id,
            customerName: customer.name,
            loanId: selectedLoanId || 'N/A',
            installmentId: Date.now().toString(),
            amount: 1000, // In production, would be from actual installment
            paymentDate: new Date().toISOString(),
            paymentMethod: 'PIX'
        });

        addToast('Recibo gerado com sucesso!', 'success');
        setIsModalOpen(false);
        loadData();

        // Show preview
        const html = documentService.receiptToHTML(receipt, brandSettings);
        showPreview(html);
    };

    const handleGenerateDeclaration = () => {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (!customer) {
            addToast('Selecione um cliente', 'warning');
            return;
        }

        const declaration = documentService.generateDischarge({
            customerId: customer.id,
            customerName: customer.name,
            cpf: customer.cpf,
            loanId: selectedLoanId || 'N/A',
            originalAmount: 10000, // In production, from loan
            totalPaid: 12000,
            startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        });

        addToast('Declaração gerada com sucesso!', 'success');
        setIsModalOpen(false);
        loadData();

        // Show preview
        const html = documentService.dischargeToHTML(declaration, brandSettings);
        showPreview(html);
    };

    const showPreview = (html: string) => {
        setPreviewHTML(html);
    };

    const handlePrint = () => {
        if (!previewHTML) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(previewHTML);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleDownload = (type: 'receipt' | 'declaration', item: Receipt | DischargeDeclaration) => {
        const html = type === 'receipt'
            ? documentService.receiptToHTML(item as Receipt, brandSettings)
            : documentService.dischargeToHTML(item as DischargeDeclaration, brandSettings);

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${item.id}.html`;
        a.click();
        addToast('Documento baixado!', 'success');
    };

    const filteredReceipts = receipts.filter(r =>
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDeclarations = declarations.filter(d =>
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-black min-h-screen text-white pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-2">
                    <FileText size={32} /> Gerador de Documentos
                </h1>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => { setModalType('receipt'); setIsModalOpen(true); }}>
                        <ReceiptIcon size={18} /> Gerar Recibo
                    </Button>
                    <Button onClick={() => { setModalType('declaration'); setIsModalOpen(true); }}>
                        <Award size={18} /> Declaração de Quitação
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
                {(['receipts', 'declarations', 'contracts'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#D4AF37] text-black' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        {tab === 'receipts' ? 'Recibos' : tab === 'declarations' ? 'Quitações' : 'Contratos'}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#D4AF37] outline-none"
                    />
                </div>
            </div>

            {activeTab === 'receipts' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">ID</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Cliente</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Valor</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Data</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Método</th>
                                    <th className="text-right py-4 px-6 text-zinc-400 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReceipts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-zinc-500">
                                            Nenhum recibo gerado
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReceipts.map(receipt => (
                                        <tr key={receipt.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                            <td className="py-4 px-6 font-mono text-zinc-400">#{receipt.id.slice(-6)}</td>
                                            <td className="py-4 px-6 font-bold text-white">{receipt.customerName}</td>
                                            <td className="py-4 px-6 text-green-400">R$ {receipt.amount.toLocaleString()}</td>
                                            <td className="py-4 px-6 text-zinc-400">
                                                {new Date(receipt.paymentDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded">
                                                    {receipt.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => showPreview(documentService.receiptToHTML(receipt, brandSettings))}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg"
                                                        title="Visualizar"
                                                    >
                                                        <Eye size={16} className="text-zinc-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload('receipt', receipt)}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg"
                                                        title="Download"
                                                    >
                                                        <Download size={16} className="text-zinc-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'declarations' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">ID</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Cliente</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">CPF</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Valor Original</th>
                                    <th className="text-left py-4 px-6 text-zinc-400 font-medium">Data</th>
                                    <th className="text-right py-4 px-6 text-zinc-400 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeclarations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-zinc-500">
                                            Nenhuma declaração gerada
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDeclarations.map(decl => (
                                        <tr key={decl.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                            <td className="py-4 px-6 font-mono text-zinc-400">#{decl.id.slice(-6)}</td>
                                            <td className="py-4 px-6 font-bold text-white">{decl.customerName}</td>
                                            <td className="py-4 px-6 text-zinc-400">{decl.cpf}</td>
                                            <td className="py-4 px-6 text-[#D4AF37]">R$ {decl.originalAmount.toLocaleString()}</td>
                                            <td className="py-4 px-6 text-zinc-400">
                                                {new Date(decl.generatedAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => showPreview(documentService.dischargeToHTML(decl, brandSettings))}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg"
                                                        title="Visualizar"
                                                    >
                                                        <Eye size={16} className="text-zinc-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload('declaration', decl)}
                                                        className="p-2 hover:bg-zinc-800 rounded-lg"
                                                        title="Download"
                                                    >
                                                        <Download size={16} className="text-zinc-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'contracts' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                    <FileCheck size={64} className="mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-400">Gerador de contratos em desenvolvimento</p>
                    <p className="text-sm text-zinc-500 mt-2">Em breve você poderá criar templates de contratos personalizados</p>
                </div>
            )}

            {/* Generate Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#D4AF37]">
                                {modalType === 'receipt' ? 'Gerar Recibo' : 'Declaração de Quitação'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Cliente</label>
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none"
                                >
                                    <option value="">Selecione um cliente</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={modalType === 'receipt' ? handleGenerateReceipt : handleGenerateDeclaration}
                                className="w-full"
                            >
                                {modalType === 'receipt' ? 'Gerar Recibo' : 'Gerar Declaração'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewHTML && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="bg-zinc-900 p-4 flex justify-between items-center">
                            <h2 className="text-white font-bold">Preview do Documento</h2>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="p-2 hover:bg-zinc-800 rounded-lg">
                                    <Printer size={20} className="text-white" />
                                </button>
                                <button onClick={() => setPreviewHTML(null)} className="p-2 hover:bg-zinc-800 rounded-lg">
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
                            <iframe
                                srcDoc={previewHTML}
                                className="w-full h-[600px] border-0"
                                title="Document Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
