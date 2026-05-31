import React, { useState, useEffect } from 'react';
import { 
  Navigation, Landmark, Building2, ChevronRight, Fingerprint, Lock, 
  AlertTriangle, ShieldCheck, RefreshCw, Radio, Database, Cpu, Network, CheckCircle2,
  Zap, Mail, AlertCircle, Key, Globe, Activity, Shield
} from 'lucide-react';
import { generateOfficerIdentity } from '../../utils/authIdentityGenerator';

// ... TalukSelector and OfficeSelector (omitted for brevity, keeping them same)

export const SecureLoginForm = ({ 
  email, setEmail, employeeId, setEmployeeId, password, setPassword, onSubmit, 
  isAuthenticating, authStage, authProgress, authError, authSuccess,
  selectedDept, selectedOffice, selectedDistrict, selectedTaluk 
}) => {
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    const id = generateOfficerIdentity(selectedDistrict, selectedTaluk, selectedDept);
    setIdentity(id);
    if (id) {
      setEmail(id.email);
      setEmployeeId(id.employeeId);
      setPassword(id.defaultPassword);
    }
  }, [selectedDept, selectedDistrict, selectedTaluk, setEmail, setEmployeeId, setPassword]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-2xl mx-auto py-10 w-full">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 relative overflow-hidden group">
        {/* Infrastructure Backdrop */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield className="w-64 h-64 -mr-20 -mt-20 rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-[#0b3c6f] tracking-tight mb-2 uppercase">Secure Gateway</h2>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black border border-blue-100 tracking-widest uppercase">Registry Verified</span>
                 <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Uplink Active
                 </span>
              </div>
            </div>
            <div className="text-right">
               <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Clearance Level</p>
                 <p className="text-lg font-black text-blue-600 uppercase tracking-tighter">{identity ? `LEVEL ${identity.clearanceLevel}` : 'PENDING'}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 group-hover:border-blue-200 transition-colors">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500" /> Administrative Node</p>
              <p className="text-sm font-bold text-[#0b3c6f] mb-1">{selectedOffice?.officeName}</p>
              <p className="text-[11px] font-black text-blue-600/60 uppercase tracking-wider">{identity?.officeCode || 'GENERATING NODE...'}</p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 group-hover:border-blue-200 transition-colors">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Lock className="w-3 h-3 text-blue-500" /> Secure Encryption</p>
              <p className="text-sm font-bold text-[#0b3c6f] mb-1">Statewide TLS 1.3</p>
              <p className="text-[11px] font-black text-green-600 uppercase tracking-wider">Node: {selectedDistrict?.code || 'TN'}-ALPHA-2026</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Official Email ID</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-5 pl-16 pr-8 text-sm font-bold text-[#0b3c6f] focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="officer@tn.gov.in"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Employee ID</label>
                <div className="relative group">
                  <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-5 pl-16 pr-8 text-sm font-bold text-[#0b3c6f] focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    placeholder="NIC-7821-X"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Secure Passcode</label>
              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-5 pl-16 pr-8 text-sm font-bold text-[#0b3c6f] focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full py-8 rounded-[28px] font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 relative overflow-hidden shadow-2xl active:scale-[0.98] ${
                isAuthenticating 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-[#0b3c6f] text-white hover:bg-blue-900 hover:-translate-y-1 hover:shadow-blue-200'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verifying Node...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-blue-400" />
                  Authenticate Access
                </>
              )}
            </button>
          </form>

          {authError && (
             <div className="mt-8 bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-start gap-6 animate-in slide-in-from-top-4 duration-300 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
                <AlertCircle className="w-10 h-10 text-red-600 shrink-0" />
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Infrastructure Alert</p>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">CODE: ERR_AUTH_DISTRICT_POLICY</span>
                   </div>
                   <p className="text-sm font-bold text-red-900 leading-tight mb-4">{authError}</p>
                   <button onClick={() => setPassword('')} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                     <RefreshCw className="w-3 h-3" /> Retry Secure Handshake
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Staged Authentication Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-[100] bg-[#0b3c6f]/98 backdrop-blur-2xl flex items-center justify-center p-10 animate-in fade-in duration-500">
           <div className="max-w-2xl w-full text-center">
              <div className="mb-16 relative">
                 <div className="absolute inset-0 bg-blue-400/20 blur-[120px] rounded-full animate-pulse" />
                 <ShieldCheck className="w-32 h-32 text-blue-400 mx-auto relative z-10 animate-bounce" />
              </div>
              
              <div className="space-y-10 relative z-10">
                 <div>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{authStage}</h3>
                    <p className="text-blue-300/60 font-black uppercase text-xs tracking-[0.5em]">TN-SDRC Governance Uplink</p>
                 </div>

                 <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                      style={{ width: `${authProgress}%` }}
                    />
                 </div>

                 <div className="flex justify-between items-center text-blue-400/40 font-black text-[10px] tracking-[0.3em] uppercase">
                    <span>Registry: {selectedDistrict?.name}</span>
                    <span>{authProgress}% Verified</span>
                    <span>Node: {identity?.officeCode}</span>
                 </div>

                 <div className="pt-12 grid grid-cols-3 gap-8">
                    <div className={`p-6 rounded-3xl border transition-all duration-500 ${authProgress > 20 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-lg' : 'border-white/5 text-white/10'}`}>
                       <Cpu className="w-8 h-8 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Handshake</p>
                    </div>
                    <div className={`p-6 rounded-3xl border transition-all duration-500 ${authProgress > 50 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-lg' : 'border-white/5 text-white/10'}`}>
                       <Database className="w-8 h-8 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Registry</p>
                    </div>
                    <div className={`p-6 rounded-3xl border transition-all duration-500 ${authProgress > 80 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-lg' : 'border-white/5 text-white/10'}`}>
                       <Lock className="w-8 h-8 mx-auto mb-3" />
                       <p className="text-[9px] font-black uppercase tracking-widest">Clearance</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// I must restore the other selectors that I omitted for brevity
export const TalukSelector = ({ taluks, onSelect, loading }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-700">
    <div className="mb-10 bg-white/60 backdrop-blur-md border border-white p-10 rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-[#0b3c6f]"></div>
      <div className="flex items-center gap-8">
        <div className="w-20 h-20 bg-[#0b3c6f] text-white rounded-[24px] flex items-center justify-center shadow-2xl">
          <Navigation className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-[#0b3c6f] uppercase leading-none tracking-tight mb-3">Identify Administrative Node</h3>
          <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em]">Synchronizing Regional Network</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black text-[#0b3c6f] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{taluks.length} ACTIVE NODES</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {loading ? (
        [...Array(6)].map((_, i) => <div key={i} className="h-60 bg-white border border-slate-100 rounded-[32px] animate-pulse"></div>)
      ) : taluks.map(t => (
        <button key={t._id} onClick={() => onSelect(t)} className="bg-[#0b3c6f] border-2 border-white/10 p-10 rounded-[32px] text-left hover:border-blue-400/50 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col min-h-[240px] glassmorphism">
          <div className="absolute top-0 left-0 w-0 h-1 bg-blue-400 group-hover:w-full transition-all duration-700"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h4 className="font-black text-2xl text-white uppercase tracking-tight group-hover:text-blue-200 transition-colors">{t.name}</h4>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-2">ADMINISTRATIVE NODE</p>
            </div>
            <span className="text-[11px] font-black bg-white/10 text-white px-3 py-1 rounded-xl border border-white/20 backdrop-blur-md">[{t.code || 'Z-NODE'}]</span>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-blue-300/60 mb-2 tracking-widest">Villages</span>
              <span className="text-xl font-black text-white">{t.villagesCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-blue-300/60 mb-2 tracking-widest">Regional Offices</span>
              <span className="text-xl font-black text-white">{t.officesCount}</span>
            </div>
          </div>
          <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
             <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><span className="text-[10px] font-black text-green-400 uppercase tracking-widest">SYNCHRONIZED</span></div>
             <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-2 transition-all" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

const InfrastructureNodeCard = ({ office, onSelect }) => {
  const { panchayats, regionalOffices, slaHealth, latency, load } = office.telemetry || {};
  return (
    <button 
      onClick={() => onSelect(office)}
      className="relative group bg-white border-2 border-slate-100 rounded-[32px] p-8 text-left transition-all duration-500 hover:border-[#0b3c6f] hover:shadow-[0_20px_60px_-15px_rgba(11,60,111,0.3)] active:scale-[0.98] overflow-hidden flex flex-col min-h-[380px]"
    >
      {/* Infrastructure Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-blue-50/0 group-hover:from-[#0b3c6f]/5 group-hover:to-blue-50/50 transition-all duration-700"></div>
      
      {/* Active Node Pulse */}
      <div className="absolute top-8 right-8 w-4 h-4 z-10">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-[#0b3c6f] to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 border border-blue-400/20">
          <Building2 className="w-7 h-7" />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Infrastructure Code</p>
          <p className="text-xs font-black text-[#0b3c6f] font-mono tracking-tighter bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{office.officeCode}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mb-8">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">{office.officeType}</p>
        <h5 className="text-xl font-black text-[#0b3c6f] uppercase tracking-tight leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
          {office.officeName}
        </h5>
      </div>

      {/* Telemetry Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-2xl"></div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Panchayats</p>
          <p className="text-sm font-black text-[#0b3c6f] ml-2">{panchayats || '14'}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-l-2xl"></div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Reg. Offices</p>
          <p className="text-sm font-black text-[#0b3c6f] ml-2">{regionalOffices || '22'}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-l-2xl"></div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Active Officers</p>
          <div className="flex items-center gap-1.5 ml-2">
            <Cpu className="w-3 h-3 text-emerald-600" />
            <span className="text-sm font-black text-[#0b3c6f]">{office.activeOfficers || '48'}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Throughput</p>
          <p className="text-sm font-black text-[#0b3c6f] ml-2">{office.complaintCapacity || '1000'}/d</p>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
         <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">SLA Health</p>
            <p className="text-xs font-black text-green-600">{slaHealth || '97.4%'}</p>
         </div>
         <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Latency</p>
            <p className="text-xs font-black text-blue-500">{latency || '18ms'}</p>
         </div>
      </div>

      {/* Interactive Bottom Layer */}
      <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
         <div className="flex items-center gap-2">
           <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
           <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Routing Telemetry Active</span>
         </div>
         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#0b3c6f] group-hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
         </div>
      </div>
    </button>
  );
};

export const OfficeSelector = ({ offices, onSelect, loading, selectedDistrict, selectedTaluk, selectedDept, onBack }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-700">
    <div className="mb-12 bg-[#0b3c6f] text-white p-12 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(11,60,111,0.3)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-2xl">
            <Network className="w-12 h-12 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-400/20 text-blue-200 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-400/30 uppercase tracking-[0.2em]">Statewide Registry Node</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-green-300 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            <h3 className="text-4xl font-black uppercase leading-tight tracking-tighter">
              {selectedTaluk?.name} <span className="text-blue-400">Administrative Grid</span>
            </h3>
            <p className="text-xs font-bold text-blue-200/60 uppercase tracking-[0.3em] mt-2">
              {selectedDistrict?.name} District • {selectedDept?.name} Sector
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl backdrop-blur-md">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-1">Operational Nodes</p>
            <p className="text-3xl font-black text-white">{offices.length} Units Found</p>
          </div>
          <button 
            onClick={onBack}
            className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 group"
          >
            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
            Re-synchronize Region
          </button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {loading ? (
        [...Array(6)].map((_, i) => (
          <div key={i} className="h-[300px] bg-slate-50 border-2 border-slate-100 rounded-[40px] animate-pulse"></div>
        ))
      ) : (
        offices.map(office => (
          <InfrastructureNodeCard 
            key={office._id} 
            office={office} 
            onSelect={onSelect} 
          />
        ))
      )}
    </div>
  </div>
);

