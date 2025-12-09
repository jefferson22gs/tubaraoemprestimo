
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';

// Pages
// Home removed
import { Wizard } from './pages/client/Wizard';
import { Login } from './pages/auth/Login';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { Contracts } from './pages/client/Contracts';
import { Profile } from './pages/client/Profile';
import { Statement } from './pages/client/Statement';
import { HelpCenter } from './pages/client/HelpCenter';
import { Dashboard } from './pages/admin/Dashboard';
import { Requests } from './pages/admin/Requests';
import { Settings } from './pages/admin/Settings';
import { Customers } from './pages/admin/Customers';
import { Interactions } from './pages/admin/Interactions';
import { Users as UsersPage } from './pages/admin/Users';
import { Marketing } from './pages/admin/Marketing';
import { DemoSimulator } from './pages/public/DemoSimulator';

// Components
import { Chatbot } from './components/Chatbot';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { InstallPrompt } from './components/InstallPrompt';
import { ToastProvider } from './components/Toast';
import { LayoutDashboard, FileText, Settings as SettingsIcon, LogOut, Users, Bot, Menu, X, UserCog, Home as HomeIcon, PieChart, User as UserIcon, Megaphone } from 'lucide-react';
import { Logo } from './components/Logo';
import { supabaseService } from './services/supabaseService';
import { BrandProvider, useBrand } from './contexts/BrandContext';

// --- Layouts ---

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path ? 'text-[#D4AF37] bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50';
  const user = supabaseService.auth.getUser();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-zinc-800 flex justify-center shrink-0">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin')}`}><LayoutDashboard size={20} /> Dashboard</Link>
        <Link to="/admin/requests" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/requests')}`}><FileText size={20} /> Solicitações</Link>
        <Link to="/admin/customers" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/customers')}`}><Users size={20} /> Clientes</Link>
        <Link to="/admin/marketing" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/marketing')}`}><Megaphone size={20} /> Marketing</Link>
        <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/users')}`}><UserCog size={20} /> Acessos</Link>
        <Link to="/admin/interactions" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/interactions')}`}><Bot size={20} /> IA Logs</Link>
        <Link to="/admin/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/settings')}`}><SettingsIcon size={20} /> Configurações</Link>
      </nav>
      <div className="p-4 border-t border-zinc-800 shrink-0">
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/10 rounded-lg transition-all"><LogOut size={20} /> Sair</Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-zinc-950 border-b border-zinc-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 hidden md:flex flex-col">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col pt-16 animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-black pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

const ClientLayout: React.FC<{ children: React.ReactNode; showNav?: boolean; showBottomNav?: boolean }> = ({ children, showNav = true, showBottomNav = false }) => {
  const user = supabaseService.auth.getUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  
  const isDemoMode = location.pathname.includes('/demo');
  const isPublicRoute = ['/login', '/wizard', '/demo'].includes(location.pathname);

  const isActive = (path: string) => location.pathname === path ? 'text-[#D4AF37] bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50';

  if (!isPublicRoute && !isDemoMode && (!user || user.role !== 'CLIENT')) {
    return <Navigate to="/login" replace />;
  }

  const ClientNavContent = () => (
    <>
      <div className="p-6 border-b border-zinc-800 flex justify-center shrink-0">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {user && (
          <>
            <Link to="/client/dashboard" onClick={() => setIsClientMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/client/dashboard')}`}>
              <LayoutDashboard size={20} /> Início
            </Link>
            <Link to="/client/contracts" onClick={() => setIsClientMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/client/contracts')}`}>
              <FileText size={20} /> Meus Contratos
            </Link>
            <Link to="/client/statement" onClick={() => setIsClientMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/client/statement')}`}>
              <PieChart size={20} /> Extrato
            </Link>
            <Link to="/client/profile" onClick={() => setIsClientMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/client/profile')}`}>
              <UserIcon size={20} /> Meu Perfil
            </Link>
          </>
        )}
        {!user && (
          <Link to="/login" onClick={() => setIsClientMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/login')}`}>
            <LogOut size={20} /> Entrar
          </Link>
        )}
      </nav>
      {user && (
        <div className="p-4 border-t border-zinc-800 shrink-0">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/10 rounded-lg transition-all">
            <LogOut size={20} /> Sair
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#FF0000] selection:text-white pb-safe">
      {/* Mobile Sidebar (Drawer) for Client */}
      {isClientMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={() => setIsClientMenuOpen(false)}>
          <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <ClientNavContent />
          </aside>
        </div>
      )}

      {showNav && (
        <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Trigger */}
              <button onClick={() => setIsClientMenuOpen(true)} className="md:hidden text-zinc-400 hover:text-white p-1">
                <Menu size={24} />
              </button>
              <Link to={user ? "/client/dashboard" : "/login"}><Logo size="sm" /></Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400 hidden md:block">Olá, {user.name.split(' ')[0]}</span>
                  <Link to="/client/profile" className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-xs">{user.name.substring(0,2).toUpperCase()}</Link>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors hidden md:block">Entrar</Link>
                  <Link to="/wizard" className="bg-[#FF0000] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20">Simular</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
      
      <div className={showNav ? 'pt-16' : ''}>{children}</div>
      {showBottomNav && <BottomNav />}
      <Chatbot />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <BrandProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </BrandProvider>
    );
  }

  return (
    <BrandProvider>
      <ToastProvider>
        <Router>
          <InstallPrompt />
          <Routes>
            {/* Redirect Root to Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth / Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/wizard" element={<ClientLayout><Wizard /></ClientLayout>} />
            <Route path="/demo" element={<DemoSimulator />} />
            
            {/* Client Protected */}
            {/* Set showNav={false} for Dashboard to avoid double headers */}
            <Route path="/client/dashboard" element={<ClientLayout showNav={false} showBottomNav={true}><ClientDashboard /></ClientLayout>} />
            <Route path="/client/contracts" element={<ClientLayout showNav={true} showBottomNav={true}><Contracts /></ClientLayout>} />
            <Route path="/client/profile" element={<ClientLayout showNav={true} showBottomNav={true}><Profile /></ClientLayout>} />
            <Route path="/client/statement" element={<ClientLayout showNav={true} showBottomNav={true}><Statement /></ClientLayout>} />
            <Route path="/client/help" element={<ClientLayout showNav={true} showBottomNav={true}><HelpCenter /></ClientLayout>} />
            
            {/* Admin Protected */}
            <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/requests" element={<AdminLayout><Requests /></AdminLayout>} />
            <Route path="/admin/customers" element={<AdminLayout><Customers /></AdminLayout>} />
            <Route path="/admin/marketing" element={<AdminLayout><Marketing /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><UsersPage /></AdminLayout>} />
            <Route path="/admin/interactions" element={<AdminLayout><Interactions /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
          </Routes>
        </Router>
      </ToastProvider>
    </BrandProvider>
  );
}
