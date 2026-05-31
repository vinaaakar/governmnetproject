import React, { useState, useEffect } from 'react';
import { Radio, Database, Cpu, Network, Globe, Activity, Shield, Lock, Zap } from 'lucide-react';

export const TelemetrySidebar = () => {
  const [metrics, setMetrics] = useState({
    uplink: '4.2 GB/s',
    load: '12%',
    latency: '18ms',
    sessions: '2,840'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        uplink: (4 + Math.random()).toFixed(2) + ' GB/s',
        load: Math.floor(10 + Math.random() * 15) + '%',
        latency: Math.floor(15 + Math.random() * 10) + 'ms',
        sessions: (2840 + Math.floor(Math.random() * 20)).toLocaleString()
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:block w-[400px] shrink-0 space-y-8 animate-in slide-in-from-right-10 duration-1000">
      {/* Infrastructure Health */}
      <div className="bg-white/60 backdrop-blur-md border border-white p-10 rounded-[48px] shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <h5 className="font-black text-[#0b3c6f] uppercase text-xs tracking-widest flex items-center gap-3">
            <Radio className="w-4 h-4 animate-pulse text-blue-600" /> NIC Gateway Telemetry
          </h5>
          <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black border border-green-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> SECURE
          </div>
        </div>
        
        <div className="space-y-6">
          {[
            { label: 'Registry Sync', status: 'ACTIVE', icon: <Database className="w-5 h-5" />, value: 'SYNCHRONIZED' },
            { label: 'Encryption Node', status: 'OPTIMIZED', icon: <Lock className="w-5 h-5" />, value: 'AES-256-GCM' },
            { label: 'Threat Monitor', status: 'NOMINAL', icon: <Shield className="w-5 h-5" />, value: '0 RECENT' },
            { label: 'Traffic Uplink', status: 'HIGH-SPD', icon: <Network className="w-5 h-5" />, value: metrics.uplink },
            { label: 'Registry Load', status: 'BALANCED', icon: <Globe className="w-5 h-5" />, value: metrics.load }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white/50 p-6 rounded-[24px] border border-white hover:border-blue-100 transition-colors group">
              <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                <div className="text-[#0b3c6f] group-hover:scale-110 transition-transform">{item.icon}</div>
                <span>{item.label}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-600 tracking-widest">{item.status}</p>
                <p className="text-[10px] font-bold text-slate-400">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statewide Activity Card */}
      <div className="bg-[#0b3c6f] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-400/20 transition-all duration-1000"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <Activity className="w-12 h-12 text-blue-400" />
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
               <span className="text-white font-black text-[10px] tracking-widest uppercase">TN-SDRC v4.2</span>
            </div>
          </div>
          <h5 className="text-white font-black uppercase text-xl leading-tight mb-4 tracking-tight">Statewide Governance Network</h5>
          <p className="text-blue-300/60 text-[11px] font-bold uppercase tracking-[0.15em] mb-10 leading-relaxed">Monitoring regional infrastructure across all 38 districts.</p>
          
          <div className="grid grid-cols-1 gap-4">
            <MetricBlock label="Active Sessions" value={metrics.sessions} sub="Across Nodes" />
            <div className="grid grid-cols-2 gap-4">
               <MetricBlock label="Sync Speed" value={metrics.latency} color="text-blue-400" />
               <MetricBlock label="Availability" value="99.98%" color="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Compliance Footer */}
      <div className="bg-white/40 backdrop-blur-sm border border-dashed border-slate-200 p-10 rounded-[48px] text-center">
         <Shield className="w-10 h-10 text-slate-300 mx-auto mb-6" />
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
           This terminal is a restricted access node of the National Informatics Centre. 
           Unauthorized access attempts are monitored and reported to the cyber cell.
         </p>
      </div>
    </div>
  );
};

const MetricBlock = ({ label, value, sub, color = "text-white" }) => (
  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner hover:bg-white/10 transition-colors">
    <p className="text-[9px] font-black text-blue-300 uppercase mb-2 tracking-widest opacity-70">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <span className="text-[10px] font-bold text-blue-400/40 uppercase">{sub}</span>}
    </div>
  </div>
);
