import React from 'react';
import { ShieldCheck, Shield, CheckCircle2 } from 'lucide-react';

export const HeaderBar = () => (
  <header className="h-[80px] bg-[#0b3c6f] text-white px-10 flex items-center justify-between shadow-2xl sticky top-0 z-[100] border-b border-white/10">
    <div className="flex items-center gap-8">
      <div className="w-14 h-14 bg-white p-1 rounded-sm flex items-center justify-center shadow-lg border border-white/20">
        <ShieldCheck className="w-10 h-10 text-[#0b3c6f]" />
      </div>
      <div>
        <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Government of Tamil Nadu</h1>
        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.4em] mt-1.5">Unified Complaint Routing System (UCRS) • NIC Secure Access Gateway</p>
      </div>
    </div>
    <div className="flex items-center gap-10">
      <div className="hidden xl:flex flex-col items-end">
        <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Node Status</span>
        <span className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div> TN-SDRC-01 ONLINE
        </span>
      </div>
      <div className="h-10 w-px bg-white/10 hidden xl:block"></div>
      <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
         <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">AES-256 Encrypted</span>
         <Shield className="w-4 h-4 text-blue-300" />
      </div>
    </div>
  </header>
);

export const StepProgress = ({ currentStep, steps }) => (
  <div className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/40 backdrop-blur-md p-10 rounded-[32px] border border-white/50 shadow-sm">
    <div className="flex items-center gap-8">
      <div className="w-16 h-16 bg-[#0b3c6f] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/20">
        <Shield className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Secure Administrative Gateway</p>
        <h2 className="text-4xl font-black text-[#0b3c6f] uppercase tracking-tight">Access Control Center</h2>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-4 transition-all duration-500 ${
              currentStep === s.id ? 'bg-[#0b3c6f] text-white border-blue-100 ring-8 ring-blue-50' : 
              currentStep > s.id ? 'bg-green-600 text-white border-green-100' : 'bg-white text-slate-300 border-slate-100 shadow-inner'
            }`}>
              {currentStep > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.id}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              currentStep === s.id ? 'text-[#0b3c6f]' : 'text-slate-400'
            }`}>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-12 h-1 mb-6 rounded-full transition-colors duration-500 ${currentStep > s.id ? 'bg-green-600' : 'bg-slate-100'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);
export const SecureGatewayRecovery = ({ error, onRetry }) => (
  <div className="animate-in zoom-in-95 duration-700 max-w-2xl mx-auto py-20 w-full text-center">
    <div className="bg-white border-4 border-red-600 rounded-[48px] shadow-[0_40px_100px_rgba(220,38,38,0.15)] overflow-hidden p-16">
      <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-red-100 animate-pulse">
        <Shield className="w-16 h-16 text-red-600" />
      </div>
      <h3 className="text-4xl font-black text-[#0b3c6f] uppercase tracking-tighter mb-6">Gateway Synchronization Failure</h3>
      <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed px-10">
        The administrative registry node encountered a synchronization exception. Local session integrity has been preserved.
      </p>
      
      <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[32px] mb-14 text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-3">Diagnostic Code:</p>
        <p className="text-sm font-black text-[#0b3c6f] font-mono break-all">{error || 'REGISTRY_REFERENCE_ERROR'}</p>
      </div>

      <button 
        onClick={onRetry}
        className="w-full bg-[#0b3c6f] text-white py-8 rounded-[28px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-900 transition-all active:scale-[0.98]"
      >
        Re-synchronize Registry Node
      </button>
    </div>
  </div>
);
