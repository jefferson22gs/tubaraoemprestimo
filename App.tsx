
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';

// Pages - Public
import { Home } from './pages/client/Home';
import { Wizard } from './pages/client/Wizard';
import { Login } from './pages/auth/Login';

// Pages - Client
import { ClientDashboard } from './pages/client/ClientDashboard';
import { Contracts } from './pages/client/Contracts';
import { Profile } from './pages/client/Profile';
import { Statement } from './pages/client/Statement';

// Pages - Admin
import { Dashboard } from './pages/admin/Dashboard';
import { Requests } from './pages/admin/Requests';
import { Settings } from './pages/admin/Settings';
import { Customers } from './pages/admin/Customers';
import { Interactions } from './pages/admin/Interactions';

// Components
import { Chatbot } from './components/Chatbot';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { ToastProvider } from './components/Toast';
import { LayoutDashboard, FileText, Settings as SettingsIcon, LogOut, Users, Bot } from 'lucide-react';
import { supabaseService } from './services/supabaseService';

// --- Layouts ---

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-[#D4AF37] bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50';
  
  // Security Check (Simple Role Based)
  const user = supabaseService.auth.getUser();
  if (!user || user.role !== 'ADMIN') {
      return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold tracking-tight text-[#D4AF37]">TUBARÃO</h1>
          <span className="text-xs text-zinc-500 tracking-widest uppercase">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin')}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/requests" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/requests')}`}>
            <FileText size={20} /> Solicitações
          </Link>
          <Link to="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/customers')}`}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/admin/interactions" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/interactions')}`}>
            <Bot size={20} /> Monitoramento IA
          </Link>
          <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/settings')}`}>
            <SettingsIcon size={20} /> Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/10 rounded-lg transition-all">
            <LogOut size={20} /> Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-black">
        {children}
      </main>
    </div>
  );
};

const ClientLayout: React.FC<{ children: React.ReactNode; showNav?: boolean; showBottomNav?: boolean }> = ({ children, showNav = true, showBottomNav = false }) => {
  // Security Check
  const user = supabaseService.auth.getUser();
  const isPublicRoute = useLocation().pathname === '/' || useLocation().pathname === '/wizard';
  
  if (!isPublicRoute && (!user || user.role !== 'CLIENT')) {
     return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#FF0000] selection:text-white pb-safe">
      {/* Desktop/Public Navbar */}
      {showNav && (
        <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
              {/* Shark Icon Mini */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#FF0000]">
                 <path d="M22 19.5C22 19.5 19 19.5 17 17.5C15 15.5 14 12 14 12L12 2C12 2 10 11 6 15C2 19 2 22 2 22H22V19.5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              <span><span className="text-[#FF0000]">TUBARÃO</span> EMPRÉSTIMOS</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                 <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400 hidden md:block">Olá, {user.name.split(' ')[0]}</span>
                    <Link to="/client/profile" className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold text-xs">
                        {user.name.substring(0,2).toUpperCase()}
                    </Link>
                 </div>
              ) : (
                 <>
                    <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Entrar</Link>
                    <Link to="/wizard" className="bg-[#FF0000] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20">Simular</Link>
                 </>
              )}
            </div>
          </div>
        </nav>
      )}
      
      {/* Page Content */}
      <div className={showNav ? 'pt-16' : ''}>
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      {showBottomNav && <BottomNav />}
      
      {/* Global AI Chatbot */}
      <Chatbot />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC FLOW --- */}
          {/* 1. Main Landing Page */}
          <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
          
          {/* 2. Login (Entry Point for existing users) */}
          <Route path="/login" element={<Login />} />
          
          {/* 3. Application Wizard (Acquisition) */}
          <Route path="/wizard" element={<ClientLayout><Wizard /></ClientLayout>} />
          
          {/* --- CLIENT FLOW (Protected) --- */}
          <Route path="/client/dashboard" element={<ClientLayout showNav={false} showBottomNav={true}><ClientDashboard /></ClientLayout>} />
          <Route path="/client/contracts" element={<ClientLayout showNav={false} showBottomNav={true}><Contracts /></ClientLayout>} />
          <Route path="/client/profile" element={<ClientLayout showNav={false} showBottomNav={true}><Profile /></ClientLayout>} />
          <Route path="/client/statement" element={<ClientLayout showNav={false} showBottomNav={true}><Statement /></ClientLayout>} />
          
          {/* --- ADMIN FLOW (Protected) --- */}
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/requests" element={<AdminLayout><Requests /></AdminLayout>} />
          <Route path="/admin/customers" element={<AdminLayout><Customers /></AdminLayout>} />
          <Route path="/admin/interactions" element={<AdminLayout><Interactions /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
