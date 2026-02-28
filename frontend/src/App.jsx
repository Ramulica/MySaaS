import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Settings, Plus, Database, Type, Hash, Link as LinkIcon, Save, 
  LayoutGrid, Users, Home, X, Trash2, Globe, FunctionSquare, AlertTriangle,
  RefreshCw, WifiOff, Check, ChevronDown, ArrowLeft, MoreHorizontal,
  GitMerge, GitBranch, Layers, Maximize, ZoomIn, ZoomOut, Move,
  LogIn, UserPlus, CreditCard, ShieldCheck, UserCircle, LogOut, Mail, Lock, User as UserIcon,
  CheckCircle2, Zap, Rocket, Star, ExternalLink, Activity, Info
} from 'lucide-react';

const getApiBase = () => {
  const { hostname } = window.location;
  const parts = hostname.split('.');
  // If we are on a subdomain (length > 1), we still want to point to the backend port on localhost
  return `http://${parts.length > 2 ? 'localhost' : parts[parts.length - 1]}:8000`;
};
const API_BASE = getApiBase();

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const getIconForType = (type) => {
  switch (type) {
    case 'text': return <Type size={14} className="text-slate-400" />;
    case 'number': return <Hash size={14} className="text-blue-500" />;
    case 'formula': return <FunctionSquare size={14} className="text-purple-500" />;
    case 'link': 
    case 'foreign_key': return <LinkIcon size={14} className="text-emerald-500" />;
    default: return <Database size={14} className="text-slate-400" />;
  }
};

const RELATION_TYPES = [
  { id: 'one_to_one', label: 'One-to-One', icon: <GitMerge size={16} />, desc: 'Unique record link.' },
  { id: 'one_to_many', label: 'One-to-Many', icon: <GitBranch size={16} />, desc: 'Parent can have multiple children.' },
  { id: 'many_to_many', label: 'Many-to-Many', icon: <Layers size={16} />, desc: 'Flexible linking between both sides.' },
];

const MEMBERSHIP_PLANS = [
  { id: 'basic', name: 'Starter', price: '0', coworkers: 1, tables: 10, icon: <Zap className="text-amber-500"/> },
  { id: 'pro', name: 'Professional', price: '29', coworkers: 10, tables: 50, icon: <Rocket className="text-blue-500"/>, popular: true },
  { id: 'enterprise', name: 'Enterprise', price: '99', coworkers: 100, tables: 'unlimited', icon: <Star className="text-purple-500"/> },
];

export default function App() {
  const [hostname, setHostname] = useState(window.location.hostname);
  const parts = hostname.split('.');
  
  // Logic to determine if we are on the main landing page or a business workspace
  const isPublicSite = parts.length <= 1 || (parts.length === 2 && parts[1] === 'localhost' && parts[0] === 'localhost');
  const subdomain = !isPublicSite ? parts[0] : null;
  
  const [authStatus, setAuthStatus] = useState('authenticated');
  const [currentView, setCurrentView] = useState(isPublicSite ? 'landing' : 'dashboard');
  
  const [currentUser, setCurrentUser] = useState({ 
    name: 'Boss André', 
    email: 'boss@nexus.com', 
    role: 'OWNER', 
    plan: 'Professional',
    workspace: subdomain || 'Nexus Systems',
    membersLimit: 10,
    membersCount: 3
  });

  const handleLogout = () => {
    if (isPublicSite) {
        setAuthStatus('login');
        setCurrentView('login');
    } else {
        window.location.href = 'http://localhost:5173';
    }
  };

  if (isPublicSite) {
    if (currentView === 'login') return <AuthView mode="login" onAuth={() => setAuthStatus('authenticated')} onSwitch={() => setCurrentView('register')} onBack={() => setCurrentView('landing')} />;
    if (currentView === 'register') return <AuthView mode="register" onAuth={() => setAuthStatus('authenticated')} onSwitch={() => setCurrentView('login')} onBack={() => setCurrentView('landing')} />;
    return <PublicLandingView onLogin={() => setCurrentView('login')} onRegister={() => setCurrentView('register')} />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans overflow-hidden text-slate-900 selection:bg-blue-100">
      {/* GLOBAL SIDEBAR */}
      <div className="w-20 bg-[#1e293b] flex flex-col items-center py-6 gap-8 z-30 shadow-xl border-r border-white/5">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer transition-all hover:scale-110 active:scale-90" onClick={() => setCurrentView('dashboard')}>
          <Database className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-6 flex-1 font-sans">
          <button onClick={() => setCurrentView('dashboard')} className={`p-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`} title="Dashboard"><Home size={22} /></button>
          <button onClick={() => setCurrentView('builder')} className={`p-3 rounded-xl transition-all ${currentView === 'builder' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`} title="Architecture Builder"><LayoutGrid size={22} /></button>
          <button onClick={() => setCurrentView('users')} className={`p-3 rounded-xl transition-all ${currentView === 'users' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`} title="Team Management"><Users size={22} /></button>
          <button onClick={() => setCurrentView('account')} className={`p-3 rounded-xl transition-all ${currentView === 'account' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`} title="Account & Billing"><CreditCard size={22} /></button>
        </nav>
        <button onClick={handleLogout} className="p-3 rounded-xl text-slate-400 hover:text-red-400 transition-all mt-auto" title="Exit Workspace"><LogOut size={22} /></button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'builder' && <SchemaBuilder user={currentUser} />}
        {currentView === 'users' && <UserManagementView user={currentUser} />}
        {currentView === 'dashboard' && <DashboardView user={currentUser} />}
        {currentView === 'account' && <AccountSettingsView user={currentUser} />}
      </div>
    </div>
  );
}

// --- PUBLIC COMPONENTS ---
function PublicLandingView({ onLogin, onRegister }) {
  return (
    <div className="h-screen overflow-y-auto bg-slate-50 font-sans selection:bg-blue-100">
      <nav className="max-w-7xl mx-auto px-12 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3 text-3xl font-black tracking-tighter text-slate-900">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg text-white"><Database size={28}/></div>
          NEXUS
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Login</button>
          <button onClick={onRegister} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95">Create Workspace</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-32 pb-48">
        <div className="text-center mb-32">
          <h1 className="text-[9rem] font-black text-slate-900 tracking-tighter mb-10 leading-[0.8] font-sans">Logic <br/><span className="text-blue-600">Infrastructure.</span></h1>
          <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-16">The ultimate SaaS plane for business logic, custom entities, and team collaboration. Designed for Bosses who demand precision.</p>
          <button onClick={onRegister} className="bg-blue-600 text-white px-16 py-8 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-[0_20px_60px_-15px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all active:scale-95">Get Your Workspace Subdomain</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {MEMBERSHIP_PLANS.map(plan => (
            <div key={plan.id} className={`bg-white p-14 rounded-[4rem] shadow-2xl border flex flex-col relative overflow-hidden transition-all hover:-translate-y-4 ${plan.popular ? 'border-blue-500 ring-8 ring-blue-500/5' : 'border-slate-100'}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 shadow-inner">{plan.icon}</div>
              <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-7xl font-black tracking-tighter">${plan.price}</span>
                <span className="text-slate-400 font-black uppercase text-[11px] tracking-widest">/ Month</span>
              </div>
              <ul className="space-y-6 mb-16 flex-1">
                <li className="flex items-center gap-4 text-slate-600 font-bold text-lg"><CheckCircle2 className="text-emerald-500" size={24}/> {plan.coworkers} Coworker Seats</li>
                <li className="flex items-center gap-4 text-slate-600 font-bold text-lg"><CheckCircle2 className="text-emerald-500" size={24}/> {plan.tables} Tables</li>
                <li className="flex items-center gap-4 text-slate-600 font-bold text-lg"><CheckCircle2 className="text-emerald-500" size={24}/> Real-time Sync</li>
              </ul>
              <button onClick={onRegister} className={`w-full py-7 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${plan.popular ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-black'}`}>Start with {plan.name}</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function AuthView({ mode, onAuth, onSwitch, onBack }) {
    const [workspaceName, setWorkspaceName] = useState('');
    
    const handleAction = () => {
        if (mode === 'register') {
            const slug = workspaceName.trim().toLowerCase() || 'new-biz';
            // Official redirect to subdomain logic
            window.location.href = `http://${slug}.localhost:5173`;
        } else {
            onAuth();
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 relative font-sans p-6">
            <button onClick={onBack} className="absolute top-12 left-12 p-5 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all active:scale-90 shadow-sm border border-transparent hover:border-slate-100"><ArrowLeft size={24}/></button>
            <div className="w-full max-w-md p-14 bg-white rounded-[4rem] shadow-2xl border border-slate-100 relative z-10">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-200"><Database size={32} /></div>
                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{mode === 'login' ? 'Nexus Sync' : 'Workspace Launch'}</h2>
                <p className="text-slate-400 font-bold mb-10 leading-snug">{mode === 'login' ? 'Access your private architecture.' : 'Create a Boss account and initialize your tenant.'}</p>
                <div className="space-y-4">
                    {mode === 'register' && <input className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold shadow-inner" placeholder="Full Name" />}
                    <input className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold shadow-inner" placeholder="Email Identity" />
                    {mode === 'register' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-blue-600 uppercase ml-1 tracking-widest">Business Subdomain</label>
                            <div className="relative">
                                <input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold shadow-inner pr-32" placeholder="acme" />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm">.nexus.io</span>
                            </div>
                        </div>
                    )}
                    <input type="password" name="password" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold shadow-inner" placeholder="Secure Password" />
                    <button onClick={handleAction} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all mt-6 uppercase text-xs tracking-widest active:scale-95">{mode === 'login' ? 'Sync Plane' : 'Initialize Workspace'}</button>
                </div>
                <button onClick={onSwitch} className="w-full text-center mt-10 text-slate-400 font-black text-[10px] hover:text-blue-600 uppercase tracking-widest transition-colors tracking-[0.2em]">{mode === 'login' ? 'Create New Tenant' : 'Existing Boss? Login'}</button>
            </div>
        </div>
    );
}

// --- WORKSPACE COMPONENTS ---
function UserManagementView({ user }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const coworkers = [
    { id: 1, name: 'John Editor', email: 'john@nexus.com', role: 'EDITOR', status: 'active' },
    { id: 2, name: 'Alice Viewer', email: 'alice@nexus.com', role: 'VIEWER', status: 'pending' },
    { id: 3, name: 'Mark Admin', email: 'mark@nexus.com', role: 'ADMIN', status: 'active' },
  ];

  return (
    <div className="p-20 max-w-6xl mx-auto h-full overflow-y-auto scrollbar-hide font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 italic">Team <br/><span className="text-blue-600 not-italic uppercase">Access</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em]">Managing coworkers for {user?.workspace}</p>
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-5 tracking-widest uppercase text-xs">
          <Plus size={24}/> New Coworker
        </button>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400 tracking-[0.3em]">
            <tr><th className="px-14 py-10">Member Identity</th><th className="px-14 py-10">Authority Role</th><th className="px-14 py-10">Rules</th><th className="px-14 py-10 text-right pr-14">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-sans">
            <tr className="bg-blue-50/20">
              <td className="px-14 py-12 flex items-center gap-8">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-100">B</div>
                <div><p className="font-black text-slate-900 text-xl tracking-tight">{user?.name}</p><p className="text-sm text-slate-400 font-bold">{user?.email}</p></div>
              </td>
              <td className="px-14 py-12"><span className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Boss (Owner)</span></td>
              <td className="px-14 py-12 font-black text-blue-600 text-xs uppercase tracking-widest flex items-center gap-3"><ShieldCheck size={20}/> Unlimited Access</td>
              <td className="px-14 py-12 text-right pr-14 opacity-20"><Settings size={28}/></td>
            </tr>
            {coworkers.map(m => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-14 py-12 flex items-center gap-8">
                  <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-black text-2xl group-hover:scale-110 transition-transform shadow-inner">{m.name[0]}</div>
                  <div><p className="font-black text-slate-900 text-xl tracking-tight">{m.name}</p><p className="text-sm text-slate-400 font-bold">{m.email}</p></div>
                </td>
                <td className="px-14 py-12">
                   <button className="bg-slate-100 hover:bg-white border-2 border-transparent hover:border-slate-200 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest text-slate-600 flex items-center gap-4 transition-all active:scale-95 shadow-sm uppercase">{m.role} <ChevronDown size={14}/></button>
                </td>
                <td className="px-14 py-12"><button className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-8 py-3 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm active:scale-95">Set Logic Rules</button></td>
                <td className="px-14 py-12 text-right pr-14"><button className="text-slate-200 hover:text-red-500 transition-all p-5 hover:bg-red-50 rounded-[1.5rem] active:scale-90"><Trash2 size={24}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardView({ user }) {
  return (
    <div className="p-20 max-w-6xl mx-auto h-full overflow-y-auto scrollbar-hide font-sans">
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-[5rem] font-black text-slate-900 tracking-tighter leading-[0.8] mb-6 uppercase italic">Operational <br/><span className="text-blue-600">Hub</span></h1>
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">{user?.workspace}</span>
            <span className="text-slate-200 font-light text-2xl">/</span>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{user?.plan} Membership</span>
          </div>
        </div>
        <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-2xl flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner"><Activity size={32}/></div>
            <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Network Status</p>
            <p className="font-black text-emerald-500 uppercase text-xs flex items-center gap-2"><CheckCircle2 size={14}/> Synchronized</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Logic Entities', value: '12', icon: <LayoutGrid className="text-blue-600"/>, color: 'hover:border-blue-200' },
          { label: 'Active Team', value: user?.membersCount, icon: <Users className="text-emerald-600"/>, color: 'hover:border-emerald-200' },
          { label: 'Calculated Logic', value: '42', icon: <FunctionSquare className="text-purple-600"/>, color: 'hover:border-purple-200' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-6 group ${stat.color} transition-all cursor-pointer hover:shadow-2xl`}>
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">{stat.icon}</div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{stat.label}</p>
            <p className="text-6xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SCHEMA BUILDER ---
function SchemaBuilder({ user }) {
  const [tables, setTables] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isTableSettingsOpen, setIsTableSettingsOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const canvasRef = useRef(null);

  // Variable definitions restored to fix ReferenceError
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedField = selectedTable?.columns?.find(c => c.id === editingFieldId);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.code === 'Space') setIsSpacePressed(true); };
    const handleKeyUp = (e) => { if (e.code === 'Space') setIsSpacePressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/builder/units/`);
      if (response.ok) {
        const data = await response.json();
        setAvailableUnits(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Units sync failed."); }
  }, []);

  const fetchSchema = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      await fetchUnits();
      const response = await fetch(`${API_BASE}/api/builder/schema/`);
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data.tables) ? data.tables : []);
      } else { setError(`Access Forbidden.`); }
    } catch (err) { setError("Plane Offline."); } finally { setIsLoading(false); }
  }, [fetchUnits]);

  useEffect(() => { fetchSchema(); }, [fetchSchema]);

  const handleSaveSchema = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/builder/schema/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
        body: JSON.stringify({ tables }),
      });
      if (response.ok) alert("Workspace logic plane synchronized.");
      else alert("Only the Boss André can modify this plane.");
    } catch { alert("Network Error."); } finally { setIsSaving(false); }
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const centerX = (window.innerWidth / 2 - transform.x) / transform.scale - 125;
    const centerY = (window.innerHeight / 2 - transform.y) / transform.scale - 100;
    const newId = `temp_${Date.now()}`;
    setTables([...tables, {
      id: newId, name: newTableName, x: centerX, y: centerY,
      color: 'bg-blue-600',
      columns: [{ id: `pk_${newId}`, name: 'id', type: 'number', isPk: true }]
    }]);
    setNewTableName(''); setIsTableModalOpen(false);
  };

  const handleUpdateColumn = (tableId, colId, updates) => {
    setTables(prev => prev.map(t => t.id === tableId ? { 
        ...t, columns: t.columns.map(c => (c.id === colId ? { ...c, ...updates } : c)) 
    } : t));
  };

  const handleAddColumn = (tableId) => {
    const newColId = `c_${Date.now()}`;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, columns: [...t.columns, { id: newColId, name: 'new_attribute', type: 'text' }] } : t));
    setSelectedTableId(tableId);
    setEditingFieldId(newColId);
    setIsTableSettingsOpen(true);
  };

  const handleDeleteColumn = (tableId, colId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, columns: t.columns.filter(c => c.id !== colId) } : t));
    setEditingFieldId(null);
  };

  // --- MOUSE ENGINE (FIXED MATH) ---
  const handleMouseDown = (e, table) => {
    if (e.button === 0 && !isSpacePressed) {
      e.stopPropagation();
      const mouseX = (e.clientX - transform.x) / transform.scale;
      const mouseY = (e.clientY - transform.y) / transform.scale;
      setDraggingTable(table.id);
      setDragOffset({ x: mouseX - (table.x || 0), y: mouseY - (table.y || 0) });
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (draggingTable) {
      const mouseX = (e.clientX - transform.x) / transform.scale;
      const mouseY = (e.clientY - transform.y) / transform.scale;
      setTables(prev => prev.map(t => t.id === draggingTable ? { ...t, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y } : t));
    } else if (isPanning) {
      setTransform(prev => ({ ...prev, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
    }
  }, [draggingTable, dragOffset, isPanning, panStart, transform]);

  const handleMouseUp = useCallback(() => { setDraggingTable(null); setIsPanning(false); }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale - e.deltaY * zoomSpeed, 0.2), 2.5);
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
      return { x: newX, y: newY, scale: newScale };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const relationshipLines = useMemo(() => {
    const lines = [];
    const tableWidth = 250;
    const headerHeight = 48; 
    const rowHeight = 35;
    tables.forEach(sourceTable => {
        sourceTable.columns.forEach((col, colIdx) => {
            if (col.type === 'link' && col.relation) {
                const targetTable = tables.find(t => String(t.id) === String(col.relation));
                if (targetTable) {
                    const sourceY = sourceTable.y + headerHeight + (colIdx * rowHeight) + (rowHeight / 2);
                    const targetY = targetTable.y + headerHeight + (0 * rowHeight) + (rowHeight / 2);
                    const isTargetRight = targetTable.x > sourceTable.x;
                    const sourceX = isTargetRight ? sourceTable.x + tableWidth : sourceTable.x;
                    const targetX = isTargetRight ? targetTable.x : targetTable.x + tableWidth;
                    lines.push({ from: { x: sourceX, y: sourceY }, to: { x: targetX, y: targetY }, type: col.relationType || 'one_to_many', isTargetRight });
                }
            }
        });
    });
    return lines;
  }, [tables]);

  const groupedUnits = useMemo(() => {
    return availableUnits.reduce((acc, unit) => {
      if (!acc[unit.category]) acc[unit.category] = [];
      acc[unit.category].push(unit);
      return acc;
    }, {});
  }, [availableUnits]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center bg-slate-50"><RefreshCw className="animate-spin text-blue-600" size={32}/></div>;

  return (
    <div className="flex flex-1 overflow-hidden relative font-sans">
      {/* SIDEBAR FOR BUILDER */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm font-sans">
        <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
            <div>
                <h2 className="font-black text-xl text-slate-800 tracking-tighter leading-none mb-1">Architecture</h2>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user?.workspace?.toUpperCase()}</p>
            </div>
            <button onClick={() => setIsTableModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-90"><Plus size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide font-sans">
          {tables.map(t => (
            <div key={t.id} onClick={() => {setSelectedTableId(t.id); setIsTableSettingsOpen(true);}} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm hover:shadow-md">
              <div className={`w-3 h-3 rounded-full ${t.color} shadow-lg`}></div>
              <span className="font-bold text-slate-700 flex-1 truncate text-sm">{t.name}</span>
              <MoreHorizontal size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
        <div className="p-6 bg-slate-50 border-t"><button onClick={handleSaveSchema} disabled={isSaving} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl active:scale-95 text-xs uppercase tracking-widest">{isSaving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>} Sync Workspace</button></div>
      </div>

      <div ref={canvasRef} onMouseDown={handleCanvasMouseDown} className={`flex-1 relative bg-[#f1f5f9] overflow-hidden select-none cursor-${isPanning ? 'grabbing' : 'default'}`}>
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.05s ease-out' }} className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 w-[20000px] h-[20000px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '30px 40px' }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs><marker id="trident" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M 0 0 L 10 6 L 0 12 M 10 0 L 10 12" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" /></marker></defs>
              {relationshipLines.map((conn, i) => {
                const dx = Math.abs(conn.to.x - conn.from.x);
                const cp1x = conn.from.x + (conn.isTargetRight ? Math.min(dx/2, 120) : -Math.min(dx/2, 120));
                const cp2x = conn.to.x + (conn.isTargetRight ? -Math.min(dx/2, 120) : Math.min(dx/2, 120));
                const d = `M ${conn.from.x} ${conn.from.y} C ${cp1x} ${conn.from.y}, ${cp2x} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`;
                return <path key={i} d={d} fill="none" stroke="#cbd5e1" strokeWidth="3" markerStart={conn.type.includes('many') ? "url(#trident)" : ""} className="transition-all duration-300" />;
              })}
            </svg>
            {tables.map(table => (
              <div key={table.id} className="absolute w-[250px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden pointer-events-auto z-10 hover:border-blue-400 transition-all group/table" style={{ left: table.x, top: table.y }}>
                <div onMouseDown={(e) => handleMouseDown(e, table)} className={`${table.color} px-6 py-4 flex items-center justify-between cursor-move text-white shadow-inner h-[54px]`}><span className="font-black tracking-tight uppercase text-[11px] tracking-widest italic">{table.name}</span><Settings size={18} className="opacity-40 hover:opacity-100 cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); setSelectedTableId(table.id); setIsTableSettingsOpen(true); }} /></div>
                <div className="py-2 bg-white">
                  {table.columns?.map(col => (
                    <div key={col.id} onClick={() => { setSelectedTableId(table.id); setEditingFieldId(col.id); setIsTableSettingsOpen(true); }} className="flex items-center justify-between px-5 h-[38px] border-b border-slate-50 last:border-0 hover:bg-slate-50 text-[11px] cursor-pointer group font-bold text-slate-600 transition-colors">
                      <div className="flex items-center gap-3">
                        {col.isPk ? <span className="text-amber-500 font-black uppercase text-[8px] tracking-widest border border-amber-200 px-1.5 py-0.5 rounded bg-amber-50/50">PK</span> : getIconForType(col.type)}
                        <span className={col.isPk ? 'font-black text-slate-800' : 'truncate max-w-[120px]'}>{col.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all">
                        {col.unit && <span className="text-[9px] bg-blue-600 px-2 py-0.5 rounded-full font-black text-white shadow-lg shadow-blue-100 uppercase tracking-widest">{availableUnits.find(u => u.id === col.unit)?.symbol || col.unit}</span>}
                        <span className="text-[8px] uppercase font-black tracking-widest text-slate-400">{col.type}</span>
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleAddColumn(table.id)} className="w-full py-4 bg-slate-50/80 text-blue-600 text-[10px] font-black uppercase border-t hover:bg-white transition-colors tracking-[0.2em] font-sans active:bg-blue-50">+ Add Attribute</button>
              </div>
            ))}
        </div>
        <div className="absolute bottom-12 right-12 flex flex-col gap-3 z-50">
          <div className="bg-white p-2.5 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col gap-2">
            <button onClick={() => setTransform(prev => ({...prev, scale: Math.min(prev.scale + 0.2, 2.5)}))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all active:scale-90"><ZoomIn size={24}/></button>
            <div className="h-px bg-slate-100 mx-2" />
            <button onClick={() => setTransform(prev => ({...prev, scale: Math.max(prev.scale - 0.2, 0.2)}))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all active:scale-90"><ZoomOut size={24}/></button>
            <div className="h-px bg-slate-100 mx-2" />
            <button onClick={() => setTransform({x: 0, y: 0, scale: 1})} className="p-4 hover:bg-slate-50 rounded-2xl text-blue-600 transition-all active:scale-90"><Maximize size={20}/></button>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-center shadow-2xl border border-white/10 backdrop-blur-md">{Math.round(transform.scale * 100)}%</div>
        </div>
      </div>

      {/* --- TABLE SETTINGS --- */}
      <div className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-500 ${isTableSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md font-sans" onClick={() => setIsTableSettingsOpen(false)}></div>
        <div className={`relative bg-white w-full max-w-6xl h-[80vh] rounded-[4rem] shadow-2xl overflow-hidden transition-all duration-500 transform ${isTableSettingsOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-12 opacity-0'}`}>
          {selectedTable && (
            <div className="flex h-full font-sans">
              <div className="w-80 bg-slate-50 border-r border-slate-100 p-12 flex flex-col shadow-inner">
                <div className={`${selectedTable.color} w-24 h-24 rounded-[2.5rem] mb-8 shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110 shadow-blue-500/20`}><Database size={48} /></div>
                <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter leading-none italic uppercase">{selectedTable.name}</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Entity Intelligence</p>
                <button onClick={() => {if(window.confirm("Destroy logical entity?")) { setTables(tables.filter(t => t.id !== selectedTable.id)); setIsTableSettingsOpen(false); }}} className="mt-auto flex items-center justify-center gap-4 text-red-400 hover:text-red-600 font-black text-[11px] uppercase p-8 border-2 border-dashed border-red-100 hover:border-red-200 rounded-[2.5rem] transition-all"><Trash2 size={20}/> Delete Plane Node</button>
              </div>
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="p-12 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex-1 mr-12 font-sans"><label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-3 ml-2 italic">Entity Primary Label</label><input className="text-5xl font-black text-slate-900 focus:outline-none border-b-4 border-transparent focus:border-blue-500 w-full transition-all bg-transparent tracking-tighter font-sans uppercase italic" value={selectedTable.name} onChange={(e) => setTables(tables.map(t => t.id === selectedTable.id ? { ...t, name: e.target.value } : t))} /></div>
                    <button onClick={() => setIsTableSettingsOpen(false)} className="p-5 hover:bg-slate-100 rounded-full text-slate-400 border border-slate-100 transition-all hover:rotate-90 active:scale-90"><X size={32}/></button>
                </div>
                <div className="p-12 overflow-y-auto flex-1 scrollbar-hide bg-slate-50/30">
                  <div className="flex items-center justify-between mb-12 font-black uppercase tracking-[0.3em] text-slate-900 text-[12px] ml-2 italic">Structural Blueprint<button onClick={() => handleAddColumn(selectedTable.id)} className="bg-blue-600 text-white text-[11px] font-black px-10 py-4 rounded-[1.5rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 flex items-center gap-4 transition-all active:scale-95 tracking-widest uppercase"><Plus size={20}/> New Attribute</button></div>
                  <div className="grid grid-cols-1 gap-5 font-sans">
                    {selectedTable.columns?.map((col) => (
                      <div key={col.id} onClick={() => setEditingFieldId(col.id)} className="p-8 bg-white hover:bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-400 transition-all group flex items-center justify-between cursor-pointer shadow-sm hover:shadow-2xl">
                        <div className="flex items-center gap-6">
                          <div className={`p-5 rounded-[1.5rem] transition-all group-hover:scale-110 ${col.isPk ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600 border border-white shadow-inner'}`}>{col.isPk ? <Globe size={28} /> : getIconForType(col.type)}</div>
                          <div><p className="font-black text-slate-900 tracking-tight text-2xl leading-none mb-2">{col.name}</p><p className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em]">{col.type}</p></div>
                        </div>
                        <div className="flex items-center gap-5">
                           {col.type === 'link' && col.relationType && (<span className="px-5 py-2.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl uppercase border border-emerald-100 tracking-widest shadow-sm shadow-emerald-50">{col.relationType.replace(/_/g, ' ')}</span>)}
                           {col.unit && <span className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest">{availableUnits.find(u => u.id === col.unit)?.symbol || col.unit}</span>}
                           {!col.isPk && (<button onClick={(e) => { e.stopPropagation(); handleDeleteColumn(selectedTable.id, col.id); }} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"><Trash2 size={24} /></button>)}
                           <MoreHorizontal size={32} className="text-slate-100 group-hover:text-blue-500 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-12 bg-slate-50 border-t flex justify-end shadow-inner"><button onClick={() => setIsTableSettingsOpen(false)} className="bg-slate-900 text-white font-black px-16 py-6 rounded-[2.5rem] shadow-2xl hover:bg-black active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-5 italic"><Check size={28} strokeWidth={3}/> Sync Structural Logic</button></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- FIELD INTELLIGENCE (TIER 2) --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ${editingFieldId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditingFieldId(null)}></div>
        <div className={`relative bg-white w-full max-w-2xl rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-400 transform ${editingFieldId ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}>
          {selectedField && (
            <div className="flex flex-col h-full shadow-2xl font-sans">
              <div className="p-14 border-b border-slate-50 bg-slate-50/50 flex items-center gap-10">
                 <button onClick={() => setEditingFieldId(null)} className="p-5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-900 shadow-md transition-all hover:-translate-x-2 active:scale-90"><ArrowLeft size={28}/></button>
                 <div><h4 className="text-4xl font-black text-slate-900 leading-none mb-1 tracking-tighter">Attribute Node</h4><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">{selectedField.name}</p></div>
              </div>
              <div className="p-14 space-y-12 overflow-y-auto scrollbar-hide max-h-[70vh] bg-white">
                <div className="grid grid-cols-1 gap-12 font-sans">
                    <div className="space-y-4"><label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-[0.4em] font-sans italic">Attribute Identifier</label><input disabled={selectedField.isPk} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-10 py-6 font-black text-2xl outline-none focus:ring-[12px] focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all shadow-inner font-sans tracking-tight" value={selectedField.name} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { name: e.target.value })} /></div>
                    <div className="space-y-4 font-sans">
                        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-[0.4em] font-sans italic">Logic Primitive</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['text', 'number', 'formula', 'link'].map(type => (
                                <button key={type} disabled={selectedField.isPk} onClick={() => handleUpdateColumn(selectedTable.id, selectedField.id, { type })} className={`flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all font-black text-[12px] uppercase tracking-[0.2em] shadow-sm ${selectedField.type === type ? 'bg-blue-600 text-white border-blue-600 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200 hover:bg-white hover:text-blue-600 hover:shadow-xl'}`}>
                                    <div className={`p-3 rounded-xl ${selectedField.type === type ? 'bg-white/20' : 'bg-white shadow-inner'}`}>{getIconForType(type)}</div> {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {(selectedField.type === 'number' || selectedField.type === 'formula') && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 font-black text-blue-600 text-[12px] uppercase tracking-[0.3em] italic">Measurement Intelligence</div>
                        <div className="space-y-10">
                          {Object.entries(groupedUnits).map(([category, units]) => (
                            <div key={category} className="space-y-4">
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3 italic border-l-4 border-blue-100 pl-4">{category}</p>
                              <div className="flex gap-4 flex-wrap">
                                {units.map(u => (
                                    <button key={u.id} onClick={() => handleUpdateColumn(selectedTable.id, selectedField.id, { unit: u.id })} className={`px-7 py-4 rounded-[1.5rem] text-[12px] font-black transition-all border-2 shadow-sm ${selectedField.unit === u.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-500 hover:bg-white hover:text-blue-600'}`}>{u.label}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                )}

                {selectedField.type === 'formula' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 font-black text-purple-600 text-[12px] uppercase tracking-[0.3em] italic">Computation Plane</div>
                        <div className="bg-purple-50 p-10 rounded-[3.5rem] border-2 border-purple-100 flex items-start gap-8 shadow-inner relative"><span className="text-6xl font-mono font-black text-purple-200 mt-1">=</span><textarea placeholder="e.g. {price} * 1.19" className="w-full bg-transparent text-3xl font-mono font-bold text-purple-800 outline-none resize-none placeholder:text-purple-200 min-h-[200px]" value={selectedField.formula || ''} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { formula: e.target.value })} /></div>
                    </div>
                )}

                {selectedField.type === 'link' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="space-y-5">
                          <label className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] ml-2 italic">Destination Target</label>
                          <div className="relative"><select className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] px-10 py-7 font-black text-2xl text-emerald-900 outline-none focus:ring-[15px] focus:ring-emerald-500/5 appearance-none focus:bg-white transition-all shadow-inner font-sans uppercase tracking-widest" value={selectedField.relation || ''} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { relation: e.target.value })}><option value="">SELECT DESTINATION NODE...</option>{tables.filter(t => t.id !== selectedTable.id).map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}</select><ChevronDown className="absolute right-10 top-8 text-emerald-400 pointer-events-none" size={32}/></div>
                        </div>
                        <div className="space-y-6">
                          <label className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] ml-2 italic">Relational Cardinality</label>
                          <div className="grid grid-cols-1 gap-5">
                            {RELATION_TYPES.map(rel => (
                              <button key={rel.id} onClick={() => handleUpdateColumn(selectedTable.id, selectedField.id, { relationType: rel.id })} className={`flex items-center gap-8 p-8 rounded-[3rem] border-2 transition-all text-left ${selectedField.relationType === rel.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-[0_30px_60px_-15px_rgba(5,150,105,0.4)]' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-500 hover:bg-white group'}`}>
                                <div className={`p-5 rounded-[1.5rem] transition-all ${selectedField.relationType === rel.id ? 'bg-white/20' : 'bg-white border-2 border-slate-100 shadow-inner group-hover:scale-110 group-hover:text-emerald-500'}`}>{rel.icon}</div>
                                <div className="flex-1 font-sans">
                                  <p className="font-black text-lg uppercase tracking-widest mb-1">{rel.label}</p>
                                  <p className={`text-[12px] font-bold ${selectedField.relationType === rel.id ? 'text-white/70' : 'text-slate-400'}`}>{rel.desc}</p>
                                </div>
                                {selectedField.relationType === rel.id && <div className="bg-white text-emerald-600 p-3 rounded-full shadow-inner"><Check size={24} strokeWidth={4}/></div>}
                              </button>
                            ))}
                          </div>
                        </div>
                    </div>
                )}
              </div>
              <div className="p-14 bg-slate-50 border-t border-slate-100 flex justify-end mt-auto shadow-inner"><button onClick={() => setEditingFieldId(null)} className="bg-slate-900 text-white font-black px-20 py-7 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-95 text-sm uppercase tracking-[0.3em] flex items-center gap-5 italic"><Check size={32} strokeWidth={3}/> Update Node Logic</button></div>
            </div>
          )}
        </div>
      </div>

      {isTableModalOpen && (<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 font-sans"><div className="bg-white p-20 rounded-[5rem] shadow-2xl w-full max-w-2xl border-4 border-white/50 animate-in fade-in zoom-in duration-500 relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32"></div><h3 className="text-6xl font-black mb-4 text-slate-900 tracking-tighter relative z-10 italic uppercase leading-none">New Node <br/><span className="text-blue-600">Identity</span></h3><p className="text-slate-400 font-bold mb-14 text-lg relative z-10 tracking-widest uppercase">Initialize structural identity.</p><div className="relative z-10 mb-14"><input autoFocus className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] px-12 py-8 text-3xl font-black outline-none focus:ring-[20px] focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all shadow-inner uppercase tracking-tighter placeholder:text-slate-200" placeholder="Identity Name..." value={newTableName} onChange={e => setNewTableName(e.target.value)} /></div><div className="flex justify-end gap-10 relative z-10"><button onClick={() => setIsTableModalOpen(false)} className="px-10 font-black text-slate-300 hover:text-slate-500 transition-colors uppercase text-[12px] tracking-[0.4em]">Discard</button><button onClick={handleAddTable} className="bg-blue-600 text-white font-black px-16 py-8 rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-[0_25px_60px_-15px_rgba(37,99,235,0.5)] active:scale-95 uppercase text-[12px] tracking-[0.3em] italic">Launch Node</button></div></div></div>)}
    </div>
  );
}

function AccountSettingsView({ user }) {
  return (
    <div className="p-20 max-w-6xl mx-auto h-full overflow-y-auto scrollbar-hide font-sans text-center">
        <div className="opacity-20 font-black text-slate-400 uppercase text-6xl tracking-tighter mb-20">Account intelligence</div>
        <div className="bg-white p-20 rounded-[4rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black mb-8">Boss Identity</h3>
            <div className="space-y-6 text-left">
                <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label><p className="text-2xl font-black">{user?.name}</p></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label><p className="text-xl font-bold text-blue-600">{user?.email}</p></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Plan</label><p className="text-xl font-black text-slate-900 uppercase tracking-tighter">{user?.plan}</p></div>
            </div>
        </div>
    </div>
  );
}