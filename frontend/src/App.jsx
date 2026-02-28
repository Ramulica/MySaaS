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
  const { protocol, hostname } = window.location;
  // Talk to port 8000 on the same host (handles subdomains for django-tenants)
  return `${protocol}//${hostname}:8000`;
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
  { id: 'one_to_many', label: 'One-to-Many', icon: <GitBranch size={16} />, desc: 'One parent, many children.' },
  { id: 'many_to_many', label: 'Many-to-Many', icon: <Layers size={16} />, desc: 'Flexible many-sided linking.' },
];

const MEMBERSHIP_PLANS = [
  { id: 'basic', name: 'Starter', price: '0', coworkers: 1, tables: 10, icon: <Zap className="text-amber-500"/> },
  { id: 'pro', name: 'Professional', price: '29', coworkers: 10, tables: 50, icon: <Rocket className="text-blue-500"/>, popular: true },
  { id: 'enterprise', name: 'Enterprise', price: '99', coworkers: 100, tables: 'unlimited', icon: <Star className="text-purple-500"/> },
];

export default function App() {
  const [hostname, setHostname] = useState(window.location.hostname);
  const parts = hostname.split('.');
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

  if (isPublicSite) {
    if (currentView === 'login') return <AuthView mode="login" onAuth={() => setAuthStatus('authenticated')} onSwitch={() => setCurrentView('register')} onBack={() => setCurrentView('landing')} />;
    if (currentView === 'register') return <AuthView mode="register" onAuth={() => setAuthStatus('authenticated')} onSwitch={() => setCurrentView('login')} onBack={() => setCurrentView('landing')} />;
    return <PublicLandingView onLogin={() => setCurrentView('login')} onRegister={() => setCurrentView('register')} />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans overflow-hidden text-slate-900">
      <div className="w-20 bg-[#1e293b] flex flex-col items-center py-6 gap-8 z-30 shadow-xl border-r border-white/5">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30 cursor-pointer transition-all hover:scale-110" onClick={() => setCurrentView('dashboard')}>
          <Database className="text-white" size={24} />
        </div>
        <nav className="flex flex-col gap-6 flex-1">
          <button onClick={() => setCurrentView('dashboard')} className={`p-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><Home size={22} /></button>
          <button onClick={() => setCurrentView('builder')} className={`p-3 rounded-xl transition-all ${currentView === 'builder' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutGrid size={22} /></button>
          <button onClick={() => setCurrentView('users')} className={`p-3 rounded-xl transition-all ${currentView === 'users' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><Users size={22} /></button>
          <button onClick={() => setCurrentView('account')} className={`p-3 rounded-xl transition-all ${currentView === 'account' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}><CreditCard size={22} /></button>
        </nav>
        <button onClick={() => window.location.href = 'http://localhost:5173'} className="p-3 rounded-xl text-slate-400 hover:text-red-400 transition-all mt-auto"><LogOut size={22} /></button>
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

function PublicLandingView({ onLogin, onRegister }) {
  return (
    <div className="h-screen overflow-y-auto bg-slate-50 font-sans">
      <nav className="max-w-7xl mx-auto px-12 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3 text-3xl font-black tracking-tighter text-slate-900">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg text-white"><Database size={28}/></div>
          NEXUS
        </div>
        <div className="flex gap-4">
          <button onClick={onLogin} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900">Login</button>
          <button onClick={onRegister} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Create Workspace</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-12 pt-32 pb-48 text-center">
        <h1 className="text-[9rem] font-black text-slate-900 tracking-tighter mb-8 leading-[0.8]">Logic <br/><span className="text-blue-600">Infrastructure.</span></h1>
        <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-20">The ultimate SaaS plane for business logic, custom entities, and team collaboration.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {MEMBERSHIP_PLANS.map(plan => (
            <div key={plan.id} className={`bg-white p-14 rounded-[4rem] shadow-2xl border flex flex-col items-start text-left relative transition-all hover:-translate-y-4 ${plan.popular ? 'border-blue-500 ring-8 ring-blue-500/5' : 'border-slate-100'}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 shadow-inner">{plan.icon}</div>
              <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
              <p className="text-7xl font-black tracking-tighter mb-12">${plan.price}</p>
              <button onClick={onRegister} className={`w-full py-7 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${plan.popular ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-black'}`}>Start with {plan.name}</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function AuthView({ mode, onAuth, onSwitch, onBack }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ws, setWs] = useState('');

    const handleAction = async () => {
        // 1. First, get the CSRF cookie from the backend
        try {
            await fetch(`${API_BASE}/api/csrf/`, { credentials: 'include' });
            
            if (mode === 'register') {
                // Official SaaS Redirect logic
                const slug = ws.trim().toLowerCase() || 'acme';
                window.location.href = `http://${slug}.localhost:5173`;
            } else {
                // Login logic
                const res = await fetch(`${API_BASE}/api/auth/login/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ email, password })
                });
                if (res.ok) onAuth();
            }
        } catch (err) {
            console.error("Auth process failed.", err);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 relative font-sans p-6 text-left">
            <button onClick={onBack} className="absolute top-12 left-12 p-5 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-all"><ArrowLeft size={24}/></button>
            <div className="w-full max-w-md p-14 bg-white rounded-[4rem] shadow-2xl border border-slate-100 relative z-10">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-200"><Database size={32} /></div>
                <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{mode === 'login' ? 'Sync Portal' : 'Workspace Launch'}</h2>
                <div className="space-y-4 mt-8">
                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold shadow-inner outline-none focus:ring-4 focus:ring-blue-500/5" placeholder="Email Address" />
                    {mode === 'register' && (
                        <div className="relative">
                            <input value={ws} onChange={e => setWs(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold shadow-inner outline-none focus:ring-4 focus:ring-blue-500/5" placeholder="Subdomain (e.g. acme)" />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black">.localhost</span>
                        </div>
                    )}
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold shadow-inner outline-none focus:ring-4 focus:ring-blue-500/5" placeholder="Password" />
                    <button onClick={handleAction} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all mt-6 uppercase text-xs tracking-widest active:scale-95">{mode === 'login' ? 'Sync' : 'Initialize'}</button>
                </div>
                <button onClick={onSwitch} className="w-full text-center mt-10 text-slate-400 font-black text-[10px] hover:text-blue-600 uppercase tracking-widest tracking-[0.2em]">{mode === 'login' ? 'Create New Workspace' : 'Existing Boss? Login'}</button>
            </div>
        </div>
    );
}

function UserManagementView({ user }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const coworkers = [
    { id: 1, name: 'John Editor', email: 'john@nexus.com', role: 'EDITOR', status: 'active' },
    { id: 2, name: 'Elena Admin', email: 'elena@nexus.com', role: 'ADMIN', status: 'active' },
  ];

  return (
    <div className="p-20 max-w-6xl mx-auto h-full overflow-y-auto scrollbar-hide font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="text-left">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 italic">Team <br/><span className="text-blue-600 not-italic uppercase">Access</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em]">Managing coworkers for {user?.workspace}</p>
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-5 tracking-widest uppercase text-xs font-sans">
          <Plus size={24}/> New Coworker
        </button>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden font-sans">
        <table className="w-full text-left font-sans">
          <thead className="bg-slate-50 border-b border-slate-100 font-black text-[10px] uppercase text-slate-400 tracking-[0.3em]">
            <tr><th className="px-14 py-10">Member</th><th className="px-14 py-10">Authority Role</th><th className="px-14 py-10">Status</th><th className="px-14 py-10 text-right pr-14">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr className="bg-blue-50/20">
              <td className="px-14 py-12 flex items-center gap-8 text-left">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-100">B</div>
                <div className="text-left"><p className="font-black text-slate-900 text-xl tracking-tight">{user?.name}</p><p className="text-sm text-slate-400 font-bold tracking-widest uppercase text-[10px]">{user?.email}</p></div>
              </td>
              <td className="px-14 py-12"><span className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Boss (Owner)</span></td>
              <td className="px-14 py-12 font-black text-emerald-500 text-[10px] uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16}/> Root Control</td>
              <td className="px-14 py-12 text-right pr-14 opacity-20"><Settings size={28}/></td>
            </tr>
            {coworkers.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-14 py-12 flex items-center gap-8 text-left">
                  <div className="w-20 h-20 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-black text-2xl group-hover:scale-110 transition-transform shadow-inner">{m.name[0]}</div>
                  <div className="text-left"><p className="font-black text-slate-900 text-xl tracking-tight">{m.name}</p><p className="text-sm text-slate-400 font-bold">{m.email}</p></div>
                </td>
                <td className="px-14 py-12">
                   <div className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest text-slate-500 flex items-center gap-4 transition-all uppercase shadow-sm group-hover:border-blue-400 cursor-pointer">{m.role} <ChevronDown size={14}/></div>
                </td>
                <td className="px-14 py-12"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{m.status}</span></td>
                <td className="px-14 py-12 text-right pr-14"><button className="text-slate-200 hover:text-red-500 transition-all p-5 hover:bg-red-50 rounded-[1.5rem] active:scale-90"><Trash2 size={24}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchemaBuilder({ user }) {
  const [tables, setTables] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [isTableSettingsOpen, setIsTableSettingsOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const canvasRef = useRef(null);

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
      const response = await fetch(`${API_BASE}/api/builder/units/`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAvailableUnits(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error("Units failed."); }
  }, []);

  const fetchSchema = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUnits();
      const response = await fetch(`${API_BASE}/api/builder/schema/`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data.tables) ? data.tables : []);
      }
    } catch (err) { console.error("Plane offline."); } finally { setIsLoading(false); }
  }, [fetchUnits]);

  useEffect(() => { fetchSchema(); }, [fetchSchema]);

  const handleUpdateColumn = (tableId, colId, updates) => {
    setTables(prev => prev.map(t => t.id === tableId ? { 
        ...t, columns: t.columns.map(c => (c.id === colId ? { ...c, ...updates } : c)) 
    } : t));
  };

  const handleAddColumn = (tableId) => {
    const newColId = `c_${Date.now()}`;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, columns: [...t.columns, { id: newColId, name: 'new_field', type: 'text' }] } : t));
    setSelectedTableId(tableId);
    setEditingFieldId(newColId);
    setIsTableSettingsOpen(true);
  };

  const handleDeleteColumn = (tableId, colId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, columns: t.columns.filter(c => c.id !== colId) } : t));
    setEditingFieldId(null);
  };

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

  const groupedUnits = useMemo(() => {
    return availableUnits.reduce((acc, unit) => {
      if (!acc[unit.category]) acc[unit.category] = [];
      acc[unit.category].push(unit);
      return acc;
    }, {});
  }, [availableUnits]);

  if (isLoading) return <div className="flex-1 flex items-center justify-center bg-slate-50 font-black uppercase text-xs text-slate-400 gap-4"><RefreshCw className="animate-spin text-blue-600" size={24}/> Initializing Architecture</div>;

  return (
    <div className="flex flex-1 overflow-hidden relative font-sans">
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm font-sans">
        <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
            <div className="text-left font-sans">
                <h2 className="font-black text-xl text-slate-800 tracking-tighter leading-none mb-1 uppercase text-left">Blueprint</h2>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-left">{user?.workspace?.toUpperCase()}</p>
            </div>
            <button onClick={() => setIsTableModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg active:scale-90 transition-all"><Plus size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide font-sans text-left">
          {tables.map(t => (
            <div key={t.id} onClick={() => {setSelectedTableId(t.id); setIsTableSettingsOpen(true);}} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group shadow-sm hover:shadow-md text-left font-sans">
              <div className={`w-3 h-3 rounded-full ${t.color} shadow-lg`}></div>
              <span className="font-bold text-slate-700 flex-1 truncate text-sm text-left">{t.name}</span>
              <MoreHorizontal size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      <div ref={canvasRef} onMouseDown={handleCanvasMouseDown} className={`flex-1 relative bg-[#f1f5f9] overflow-hidden select-none cursor-${isPanning ? 'grabbing' : 'default'}`}>
        <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.05s ease-out' }} className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 w-[20000px] h-[20000px] -translate-x-1/2 -translate-y-1/2" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            {tables.map(table => (
              <div key={table.id} className="absolute w-[250px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden pointer-events-auto z-10 hover:border-blue-400 transition-all group/table font-sans text-left" style={{ left: table.x, top: table.y }}>
                <div onMouseDown={(e) => handleMouseDown(e, table)} className={`${table.color} px-6 py-4 flex items-center justify-between cursor-move text-white shadow-inner h-[54px] font-sans text-left`}><span className="font-black tracking-tight uppercase text-[11px] tracking-widest italic font-sans text-left">{table.name}</span><Settings size={18} className="opacity-40 hover:opacity-100 cursor-pointer transition-all font-sans" onClick={(e) => { e.stopPropagation(); setSelectedTableId(table.id); setIsTableSettingsOpen(true); }} /></div>
                <div className="py-2 bg-white font-sans text-left">
                  {table.columns?.map(col => (
                    <div key={col.id} onClick={() => { setSelectedTableId(table.id); setEditingFieldId(col.id); setIsTableSettingsOpen(true); }} className="flex items-center justify-between px-5 h-[38px] border-b border-slate-50 last:border-0 hover:bg-slate-50 text-[11px] cursor-pointer group font-bold text-slate-600 transition-colors font-sans text-left">
                      <div className="flex items-center gap-3 font-sans text-left">
                        {col.isPk ? <span className="text-amber-500 font-black uppercase text-[8px] tracking-widest border border-amber-200 px-1.5 py-0.5 rounded bg-amber-50/50">PK</span> : getIconForType(col.type)}
                        <span className={col.isPk ? 'font-black text-slate-800' : 'truncate max-w-[120px]'}>{col.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all font-sans">
                        {col.unit && <span className="text-[9px] bg-blue-600 px-2 py-0.5 rounded-full font-black text-white shadow-lg shadow-blue-100 uppercase tracking-widest">{availableUnits.find(u => u.id === col.unit)?.symbol || col.unit}</span>}
                        <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 font-sans">{col.type}</span>
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleAddColumn(table.id)} className="w-full py-4 bg-slate-50/80 text-blue-600 text-[10px] font-black uppercase border-t hover:bg-white transition-colors tracking-[0.2em] font-sans active:bg-blue-50 text-center font-sans">+ Add Attribute</button>
              </div>
            ))}
        </div>
        <div className="absolute bottom-12 right-12 flex flex-col gap-3 z-50 font-sans">
          <div className="bg-white p-2.5 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col gap-2 font-sans">
            <button onClick={() => setTransform(prev => ({...prev, scale: Math.min(prev.scale + 0.2, 2.5)}))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all active:scale-90 font-sans"><ZoomIn size={24}/></button>
            <div className="h-px bg-slate-100 mx-2" />
            <button onClick={() => setTransform(prev => ({...prev, scale: Math.max(prev.scale - 0.2, 0.2)}))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all active:scale-90 font-sans"><ZoomOut size={24}/></button>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-center shadow-2xl border border-white/10 backdrop-blur-md font-sans">{Math.round(transform.scale * 100)}%</div>
        </div>
      </div>

      {/* --- TABLE SETTINGS --- */}
      <div className={`fixed inset-0 z-40 flex items-center justify-center transition-all duration-500 ${isTableSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} font-sans`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md font-sans" onClick={() => setIsTableSettingsOpen(false)}></div>
        <div className={`relative bg-white w-full max-w-6xl h-[80vh] rounded-[4rem] shadow-2xl overflow-hidden transition-all duration-500 transform ${isTableSettingsOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-12 opacity-0'} font-sans`}>
          {selectedTable && (
            <div className="flex h-full font-sans">
              <div className="w-80 bg-slate-50 border-r border-slate-100 p-12 flex flex-col shadow-inner font-sans text-left">
                <div className={`${selectedTable.color} w-24 h-24 rounded-[2.5rem] mb-8 shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110 shadow-blue-500/20 font-sans`}><Database size={48} /></div>
                <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase font-sans text-left">{selectedTable.name}</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 font-sans text-left font-sans">Entity Architecture</p>
                <button onClick={() => {if(window.confirm("Destroy logical entity?")) { setTables(tables.filter(t => t.id !== selectedTable.id)); setIsTableSettingsOpen(false); }}} className="mt-auto flex items-center justify-center gap-4 text-red-400 hover:text-red-600 font-black text-[11px] uppercase p-8 border-2 border-dashed border-red-100 hover:border-red-200 rounded-[2.5rem] transition-all font-sans"><Trash2 size={20}/> Delete Node</button>
              </div>
              <div className="flex-1 flex flex-col bg-white overflow-hidden font-sans">
                <div className="p-12 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10 font-sans text-left">
                    <div className="flex-1 mr-12 font-sans text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-3 ml-2 italic font-sans text-left">Entity Label</label><input className="text-5xl font-black text-slate-900 focus:outline-none border-b-4 border-transparent focus:border-blue-500 w-full transition-all bg-transparent tracking-tighter font-sans uppercase italic text-left" value={selectedTable.name} onChange={(e) => setTables(tables.map(t => t.id === selectedTable.id ? { ...t, name: e.target.value } : t))} /></div>
                    <button onClick={() => setIsTableSettingsOpen(false)} className="p-5 hover:bg-slate-100 rounded-full text-slate-400 border border-slate-100 transition-all hover:rotate-90 active:scale-90 font-sans"><X size={32}/></button>
                </div>
                <div className="p-12 overflow-y-auto flex-1 scrollbar-hide bg-slate-50/30 font-sans text-left">
                  <div className="flex items-center justify-between mb-12 font-black uppercase tracking-[0.3em] text-slate-900 text-[12px] ml-2 italic font-sans text-left">Structural Blueprint<button onClick={() => handleAddColumn(selectedTable.id)} className="bg-blue-600 text-white text-[11px] font-black px-10 py-4 rounded-[1.5rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 flex items-center gap-4 transition-all active:scale-95 tracking-widest uppercase font-sans"><Plus size={20}/> New Attribute</button></div>
                  <div className="grid grid-cols-1 gap-5 font-sans text-left">
                    {selectedTable.columns?.map((col) => (
                      <div key={col.id} onClick={() => setEditingFieldId(col.id)} className="p-8 bg-white hover:bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-blue-400 transition-all group flex items-center justify-between cursor-pointer shadow-sm hover:shadow-2xl font-sans text-left">
                        <div className="flex items-center gap-6 font-sans text-left font-sans">
                          <div className={`p-5 rounded-[1.5rem] transition-all group-hover:scale-110 ${col.isPk ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600 border border-white shadow-inner'} font-sans`}>{col.isPk ? <Globe size={28} /> : getIconForType(col.type)}</div>
                          <div className="font-sans text-left"><p className="font-black text-slate-900 tracking-tight text-2xl leading-none mb-2 font-sans text-left">{col.name}</p><p className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] font-sans text-left">{col.type}</p></div>
                        </div>
                        <div className="flex items-center gap-5 font-sans text-left">
                           {col.type === 'link' && col.relationType && (<span className="px-5 py-2.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl uppercase border border-emerald-100 tracking-widest shadow-sm shadow-emerald-50 font-sans">{col.relationType.replace(/_/g, ' ')}</span>)}
                           {col.unit && <span className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-lg shadow-blue-100 uppercase tracking-widest font-sans">{availableUnits.find(u => u.id === col.unit)?.symbol || col.unit}</span>}
                           {!col.isPk && (<button onClick={(e) => { e.stopPropagation(); handleDeleteColumn(selectedTable.id, col.id); }} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-90 font-sans"><Trash2 size={24} /></button>)}
                           <MoreHorizontal size={32} className="text-slate-100 group-hover:text-blue-500 transition-all font-sans text-left" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-12 bg-slate-50 border-t flex justify-end shadow-inner font-sans text-left"><button onClick={() => setIsTableSettingsOpen(false)} className="bg-slate-900 text-white font-black px-16 py-6 rounded-[2.5rem] shadow-2xl hover:bg-black active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-5 italic font-sans text-left"><Check size={28} strokeWidth={3}/> Commit Updates</button></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- FIELD PROPERTIES --- */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ${editingFieldId ? 'opacity-100' : 'opacity-0 pointer-events-none'} font-sans`}>
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm font-sans" onClick={() => setEditingFieldId(null)}></div>
        <div className={`relative bg-white w-full max-w-2xl rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-400 transform ${editingFieldId ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'} font-sans`}>
          {selectedField && (
            <div className="flex flex-col h-full shadow-2xl font-sans">
              <div className="p-14 border-b border-slate-50 bg-slate-50/50 flex items-center gap-10 font-sans">
                 <button onClick={() => setEditingFieldId(null)} className="p-5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-900 shadow-md transition-all hover:-translate-x-2 active:scale-90 font-sans"><ArrowLeft size={28}/></button>
                 <div className="font-sans text-left"><h4 className="text-4xl font-black text-slate-900 leading-none mb-1 tracking-tighter font-sans text-left">Attribute Config</h4><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] font-sans text-left">{selectedField.name}</p></div>
              </div>
              <div className="p-14 space-y-12 overflow-y-auto scrollbar-hide max-h-[70vh] bg-white font-sans text-left">
                <div className="grid grid-cols-1 gap-12 font-sans text-left">
                    <div className="space-y-4 font-sans text-left font-sans text-left"><label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-[0.4em] font-sans italic text-left font-sans text-left">Identify Name</label><input disabled={selectedField.isPk} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-10 py-6 font-black text-2xl outline-none focus:ring-[12px] focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all shadow-inner font-sans tracking-tight text-left font-sans text-left" value={selectedField.name} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { name: e.target.value })} /></div>
                    <div className="space-y-4 font-sans text-left font-sans text-left">
                        <label className="text-[11px] font-black text-slate-400 uppercase ml-2 tracking-[0.4em] font-sans italic text-left font-sans text-left">Logic Pattern</label>
                        <div className="grid grid-cols-2 gap-4 font-sans text-left font-sans text-left">
                            {['text', 'number', 'formula', 'link'].map(type => (
                                <button key={type} disabled={selectedField.isPk} onClick={() => handleUpdateColumn(selectedTable.id, selectedField.id, { type })} className={`flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all font-black text-[12px] uppercase tracking-[0.2em] shadow-sm ${selectedField.type === type ? 'bg-blue-600 text-white border-blue-600 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200 hover:bg-white hover:text-blue-600 hover:shadow-xl'} font-sans text-left font-sans text-left`}>
                                    <div className={`p-3 rounded-xl ${selectedField.type === type ? 'bg-white/20' : 'bg-white shadow-inner'} font-sans text-left font-sans text-left`}>{getIconForType(type)}</div> {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {(selectedField.type === 'number' || selectedField.type === 'formula') && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans text-left font-sans text-left">
                        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 font-black text-blue-600 text-[12px] uppercase tracking-[0.3em] italic font-sans text-left font-sans text-left font-sans text-left">Measurement Detail</div>
                        <div className="space-y-10 font-sans text-left font-sans text-left font-sans text-left">
                          {Object.entries(groupedUnits).map(([category, units]) => (
                            <div key={category} className="space-y-4 font-sans text-left font-sans text-left font-sans text-left">
                              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3 italic border-l-4 border-blue-100 pl-4 font-sans text-left font-sans text-left font-sans text-left">{category}</p>
                              <div className="flex gap-4 flex-wrap font-sans text-left font-sans text-left font-sans text-left">
                                {units.map(u => (
                                    <button key={u.id} onClick={() => handleUpdateColumn(selectedTable.id, selectedField.id, { unit: u.id })} className={`px-7 py-4 rounded-[1.5rem] text-[12px] font-black transition-all border-2 shadow-sm ${selectedField.unit === u.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-500 hover:bg-white hover:text-blue-600'} font-sans text-left font-sans text-left font-sans text-left text-left`}>{u.label}</button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                )}

                {selectedField.type === 'formula' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans text-left font-sans text-left">
                        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 font-black text-purple-600 text-[12px] uppercase tracking-[0.3em] italic font-sans text-left font-sans text-left font-sans text-left">Computation Intelligence</div>
                        <div className="bg-purple-50 p-10 rounded-[3.5rem] border-2 border-purple-100 flex items-start gap-8 shadow-inner relative font-sans text-left font-sans text-left font-sans text-left"><span className="text-6xl font-mono font-black text-purple-200 mt-1 font-sans text-left font-sans text-left font-sans text-left">=</span><textarea placeholder="e.g. {price} * 1.19" className="w-full bg-transparent text-3xl font-mono font-bold text-purple-800 outline-none resize-none placeholder:text-purple-200 min-h-[200px] font-sans text-left font-sans text-left font-sans text-left" value={selectedField.formula || ''} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { formula: e.target.value })} /></div>
                    </div>
                )}

                {selectedField.type === 'link' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans text-left font-sans text-left">
                        <div className="space-y-5 font-sans text-left font-sans text-left">
                          <label className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] ml-2 italic font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Target Node</label>
                          <div className="relative font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left"><select className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] px-10 py-7 font-black text-2xl text-emerald-900 outline-none focus:ring-[15px] focus:ring-emerald-500/5 appearance-none focus:bg-white transition-all shadow-inner font-sans uppercase tracking-widest text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left" value={selectedField.relation || ''} onChange={(e) => handleUpdateColumn(selectedTable.id, selectedField.id, { relation: e.target.value })}><option value="">SELECT TARGET...</option>{tables.filter(t => t.id !== selectedTable.id).map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}</select><ChevronDown className="absolute right-10 top-8 text-emerald-400 pointer-events-none font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left" size={32}/></div>
                        </div>
                    </div>
                )}
              </div>
              <div className="p-14 bg-slate-50 border-t border-slate-100 flex justify-end mt-auto shadow-inner font-sans text-left font-sans text-left font-sans text-left"><button onClick={() => setEditingFieldId(null)} className="bg-slate-900 text-white font-black px-20 py-7 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-95 text-sm uppercase tracking-[0.3em] flex items-center gap-5 italic font-sans text-left font-sans text-left font-sans text-left"><Check size={32} strokeWidth={3}/> Update Structural Logic</button></div>
            </div>
          )}
        </div>
      </div>

      {isTableModalOpen && (<div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 font-sans text-left font-sans text-left font-sans text-left"><div className="bg-white p-20 rounded-[5rem] shadow-2xl w-full max-w-2xl border-4 border-white/50 animate-in fade-in zoom-in duration-500 relative overflow-hidden font-sans text-left font-sans text-left font-sans text-left"><div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 font-sans text-left font-sans text-left font-sans text-left font-sans text-left"></div><h3 className="text-6xl font-black mb-4 text-slate-900 tracking-tighter relative z-10 italic uppercase leading-none font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">New Node <br/><span className="text-blue-600 font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Identity</span></h3><p className="text-slate-400 font-bold mb-14 text-lg relative z-10 tracking-widest uppercase font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Structural Initiation.</p><div className="relative z-10 mb-14 font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left"><input autoFocus className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] px-12 py-8 text-3xl font-black outline-none focus:ring-[20px] focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all shadow-inner uppercase tracking-tighter placeholder:text-slate-200 font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left" placeholder="Identity Name..." value={newTableName} onChange={e => setNewTableName(e.target.value)} /></div><div className="flex justify-end gap-10 relative z-10 font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left"><button onClick={() => setIsTableModalOpen(false)} className="px-10 font-black text-slate-300 hover:text-slate-500 transition-colors uppercase text-[12px] tracking-[0.4em] font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Discard</button><button onClick={handleAddTable} className="bg-blue-600 text-white font-black px-16 py-8 rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-[0_25px_60px_-15px_rgba(37,99,235,0.5)] active:scale-95 uppercase text-[12px] tracking-[0.3em] italic font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Launch Node</button></div></div></div>)}
    </div>
  );
}

function AccountSettingsView({ user }) {
  return (
    <div className="p-20 max-w-6xl mx-auto h-full overflow-y-auto scrollbar-hide font-sans text-center font-sans text-center">
        <div className="opacity-20 font-black text-slate-400 uppercase text-6xl tracking-tighter mb-20 font-sans text-center font-sans text-center font-sans text-center font-sans text-center">Account Profile</div>
        <div className="bg-white p-20 rounded-[4rem] shadow-2xl border border-slate-100 max-w-2xl mx-auto font-sans text-left font-sans text-left font-sans text-left">
            <h3 className="text-2xl font-black mb-8 font-sans text-left font-sans text-left font-sans text-left font-sans text-left">Boss Context</h3>
            <div className="space-y-6 text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left font-sans text-left">
                <div className="font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans text-left block mb-1">Identity</label><p className="text-2xl font-black font-sans text-left">{user?.name}</p></div>
                <div className="font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans text-left block mb-1">Verified Email</label><p className="text-xl font-bold text-blue-600 font-sans text-left">{user?.email}</p></div>
                <div className="font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left font-sans text-left text-left"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans text-left block mb-1">Membership</label><p className="text-xl font-black text-slate-900 uppercase tracking-tighter font-sans text-left">{user?.plan}</p></div>
            </div>
        </div>
    </div>
  );
}