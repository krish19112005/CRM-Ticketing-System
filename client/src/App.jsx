import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { 
  Send, LogOut, PlusCircle, MessageSquare, ChevronRight,
  Clock, Sparkles, Activity, Terminal, ArrowLeft
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const { user, token, login, logout } = useAuth();
  const [isAuthView, setIsAuthView] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token) fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t) => t.id === selectedTicket.id);
          setSelectedTicket(updated || null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isAuthView === 'login' ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTicketForm)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTicketForm({ title: '', description: '', priority: 'MEDIUM' });
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: commentText })
      });
      if (res.ok) {
        setCommentText('');
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setMobileDetailView(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="acrylic-card prismatic-border p-6 sm:p-8 rounded-2xl w-full max-w-md relative overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                NEXUS_CRM <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">v2.4</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400">Cybernetic Operations Console</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-xs rounded-xl font-mono">
              [ERR_AUTH]: {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isAuthView === 'register' && (
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Operator Identity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  className="w-full mt-1.5 px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700/60 text-white rounded-xl focus:bg-slate-900/90 focus:border-indigo-500 transition"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Access Handle (Email)</label>
              <input
                type="email"
                required
                placeholder="operator@nexus.io"
                className="w-full mt-1.5 px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700/60 text-white rounded-xl focus:bg-slate-900/90 focus:border-indigo-500 transition"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Security Key (Password)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full mt-1.5 px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700/60 text-white rounded-xl focus:bg-slate-900/90 focus:border-indigo-500 transition"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            {isAuthView === 'register' && (
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Clearance Level</label>
                <select
                  className="w-full mt-1.5 px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700/60 text-slate-200 rounded-xl focus:bg-slate-900/90 focus:border-indigo-500 transition"
                  value={authForm.role}
                  onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                >
                  <option value="CUSTOMER">Client Operator</option>
                  <option value="AGENT">Support Field Agent</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-sm rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition active:scale-[0.98]"
            >
              {isAuthView === 'login' ? 'Authenticate Session' : 'Register Operator'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setIsAuthView(isAuthView === 'login' ? 'register' : 'login')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition"
            >
              {isAuthView === 'login' ? "> Need security clearance? Register" : "> Existing session? Return to login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* HUD Header */}
      <header className="acrylic-card px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight font-mono">NEXUS_DESK</span>
            <span className="hidden md:inline-block ml-2 px-2 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded font-mono border border-slate-700">
              SYS_STABLE
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full radar-live bg-emerald-400 shrink-0" />
            <span className="font-mono text-slate-200 text-[11px] sm:text-xs max-w-[90px] sm:max-w-none truncate">
              {user.name}
            </span>
            <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] rounded font-mono font-bold uppercase border border-indigo-500/30">
              {user.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Workspace */}
      <div className="flex-1 flex p-2 sm:p-4 gap-3 sm:gap-4 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Ticket List Queue */}
        <section className={`acrylic-card rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-200 ${
          mobileDetailView ? 'hidden md:flex md:w-80 lg:w-96' : 'w-full md:w-80 lg:w-96 flex'
        }`}>
          <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/30 shrink-0">
            <div>
              <h2 className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {user.role === 'CUSTOMER' ? 'Incident Feed' : 'Dispatch Queue'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono">{tickets.length} ACTIVE_RECORDS</p>
            </div>
            {user.role === 'CUSTOMER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition shadow-[0_0_12px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {tickets.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-500">NO ACTIVE INCIDENTS</p>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3 sm:p-3.5 rounded-xl cursor-pointer ticket-card-hover border transition-all ${
                    selectedTicket?.id === t.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      {t.priority === 'URGENT' && (
                        <span className="w-2 h-2 rounded-full radar-urgent bg-rose-500 shrink-0 mr-0.5" />
                      )}
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md ${
                        t.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        t.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-md border ${
                      t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 truncate">{t.title}</h3>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                    <span className="flex items-center space-x-1 truncate max-w-[180px]">
                      <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="truncate">{t.customer?.name}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 md:hidden" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Details Panel */}
        <section className={`acrylic-card rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-200 ${
          mobileDetailView ? 'w-full flex-1' : 'hidden md:flex md:flex-1'
        }`}>
          {selectedTicket ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Top Bar with Mobile Back Action */}
              <div className="p-3 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-2 justify-between items-center shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <button
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                    aria-label="Back to Queue"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 truncate">
                      SRC: <span className="text-indigo-400">{selectedTicket.customer?.name}</span> • #{selectedTicket.id}
                    </p>
                  </div>
                </div>

                {user.role !== 'CUSTOMER' && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400">STATUS:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="text-[10px] sm:text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-mono focus:border-indigo-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Scrollable Transcript */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800 shadow-inner">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    // RAW_INCIDENT_REPORT
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 sm:mt-2 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1 sm:pt-2">
                  <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Transmission Log</span>
                  </div>

                  {selectedTicket.comments?.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-3 sm:p-3.5 rounded-xl border shadow-md space-y-1 ${
                        c.user?.role === 'CUSTOMER' 
                          ? 'bg-slate-900/60 border-slate-800 text-slate-200' 
                          : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200 ml-2 sm:ml-6'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1.5 sm:space-x-2">
                          <span className="text-xs font-bold text-white font-mono">{c.user?.name}</span>
                          <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            c.user?.role === 'CUSTOMER' ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {c.user?.role}
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-slate-500">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{c.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-2.5 sm:p-4 bg-slate-950/40 border-t border-slate-800/80 shrink-0">
                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Encode transmission..."
                    className="flex-1 min-w-0 bg-slate-900/70 border border-slate-800 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-blue-500 hover:to-indigo-500 transition flex items-center space-x-1 shadow-[0_0_15px_rgba(99,102,241,0.4)] shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-8 text-center font-mono">
              <Terminal className="w-10 h-10 text-slate-700 mb-2" />
              <p className="font-medium text-slate-400">// NO_SELECTION_ACTIVE</p>
              <p className="text-slate-600 mt-1 max-w-xs">Select an incident to review telemetry and log transmissions.</p>
            </div>
          )}
        </section>
      </div>

      {/* Modal - Fully Mobile Centered */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="acrylic-card prismatic-border rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono">// INITIALIZE_INCIDENT</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Incident Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gateway latency timeout on cluster #4"
                  className="w-full mt-1 bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-indigo-500"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Severity Level</label>
                <select
                  className="w-full mt-1 bg-slate-900/80 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-indigo-500"
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                >
                  <option value="LOW">LOW - Diagnostic query</option>
                  <option value="MEDIUM">MEDIUM - Partial degradation</option>
                  <option value="HIGH">HIGH - Service impairment</option>
                  <option value="URGENT">URGENT - System outage</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">Telemetry Payload</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Enter stacktrace or description..."
                  className="w-full mt-1 bg-slate-900/80 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:border-indigo-500"
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-800 text-slate-400 rounded-xl text-xs font-mono hover:bg-slate-800"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-mono font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}