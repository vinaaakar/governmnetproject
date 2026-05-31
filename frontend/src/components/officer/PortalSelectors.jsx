import React from 'react';
import { 
  LayoutGrid, Search, Map, Cpu, Radio, Navigation, Landmark, Building2, ChevronRight, Globe,
  Zap, Droplets, Hammer, Coins, Shield, Stethoscope, Home
} from 'lucide-react';

const ICON_MAP = {
  Zap, Droplets, Building2, Hammer, Coins, Shield, Stethoscope, Home
};

export const DepartmentSelector = ({ departments, onSelect }) => (
  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div className="mb-12"><h3 className="text-2xl font-black text-[#0b3c6f] uppercase tracking-tight flex items-center gap-4"><LayoutGrid className="w-8 h-8" /> Select Operations Bureau</h3></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {departments.map(d => {
          const Icon = ICON_MAP[d.iconName] || Building2;
          return (
            <button key={d.id} onClick={() => onSelect(d)} className="bg-white border border-slate-200 p-10 rounded-[32px] text-left transition-all hover:border-[#0b3c6f] hover:shadow-2xl flex flex-col min-h-[300px] group overflow-hidden">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#0b3c6f] mb-10 border border-slate-100 shadow-md transition-all">
                <Icon className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-[#0b3c6f] uppercase mb-3">{d.name}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">{d.desc}</p>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{d.coverage}</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#0b3c6f] group-hover:translate-x-2 transition-all" />
              </div>
            </button>
          );
        })}
    </div>
  </div>
);

export const DistrictSelector = ({ districts, searchQuery, setSearchQuery, onSelect }) => (
  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-[#0b3c6f] text-white p-12 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(11,60,111,0.3)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      
      <div className="flex items-center gap-8 relative z-10">
        <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-2xl">
          <Globe className="w-12 h-12 text-blue-300" />
        </div>
        <div>
          <h3 className="text-4xl font-black uppercase leading-none tracking-tighter mb-3">Statewide Node Discovery</h3>
          <div className="flex items-center gap-3">
            <span className="bg-blue-400/20 text-blue-200 text-[9px] font-black px-4 py-1.5 rounded-full border border-blue-400/30 uppercase tracking-[0.2em]">Administrative Discovery Layer</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-green-300 uppercase tracking-widest">Global Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-[450px] relative z-10">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-300" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Locate District Node (e.g. Madurai)..." 
          className="w-full pl-20 pr-10 py-7 bg-white/10 border-2 border-white/10 rounded-[32px] outline-none focus:border-blue-400 focus:bg-white/20 focus:shadow-2xl transition-all font-bold text-lg placeholder:text-blue-300/40 backdrop-blur-md" 
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {districts.map(d => (
        <button 
          key={d.id || d.name} 
          onClick={() => onSelect(d)} 
          className="bg-white border-2 border-slate-100 p-10 rounded-[48px] text-left hover:border-[#0b3c6f] hover:shadow-[0_40px_80px_-20px_rgba(11,60,111,0.2)] transition-all duration-500 group relative overflow-hidden flex flex-col min-h-[340px]"
        >
          {/* Cluster Indicator */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-all duration-500 opacity-20 group-hover:opacity-100" 
               style={{ backgroundImage: `linear-gradient(to right, ${d.cluster === 'North' ? '#2563eb, #4338ca' : d.cluster === 'South' ? '#10b981, #0f766e' : d.cluster === 'West' ? '#f59e0b, #d97706' : d.cluster === 'East' ? '#f43f5e, #be123c' : '#9333ea, #6d28d9'})` }}>
          </div>

          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="font-black text-3xl text-[#0b3c6f] uppercase tracking-tighter group-hover:text-blue-700 transition-colors">{d.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{d.cluster} Cluster Node</p>
            </div>
            <div className="w-4 h-4 mt-2">
              <div className="absolute w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
              <span className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest block">Taluks</span>
              <span className="text-2xl font-black text-[#0b3c6f]">{d.taluks}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
              <span className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest block">SLA Health</span>
              <span className="text-2xl font-black text-green-600">{d.sla || '94%'}</span>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Throughput: {d.capacity}</span>
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">SLA Compliance: {d.sla}</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#0b3c6f] group-hover:text-white transition-all duration-500">
               <ChevronRight className="w-6 h-6" />
             </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
