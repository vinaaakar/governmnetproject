import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, LayoutDashboard, FileText, Map as MapIcon, 
  BarChart3, Settings, LogOut, Bell, Search, Filter,
  ChevronDown, ChevronRight, AlertCircle, Clock,
  CheckCircle2, ArrowUpRight, MessageSquare, MapPin,
  Building2, User, Activity, Shield, Zap, Info,
  ExternalLink, FilterX, MoreHorizontal, Download,
  Navigation, Cpu, Radio, Globe, Layers, Eye, RefreshCw,
  Share2
} from 'lucide-react';
import api from '../utils/api';
import { useInactivityLogout } from '../utils/sessionManager';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Resilient Session Extraction
  const [officerInfo, setOfficerInfo] = useState(() => {
    const stateOfficer = location.state?.officer;
    const localOfficer = JSON.parse(localStorage.getItem('officerInfo') || '{}');
    const officer = stateOfficer || localOfficer;
    
    // Safety defaults
    return {
      ...officer,
      fullName: officer?.fullName || 'Authorized Officer',
      email: officer?.email || 'officer@tn.gov.in',
      department: officer?.department || 'Government Department',
      district: officer?.district || 'Tamil Nadu',
      taluk: officer?.taluk || 'Regional HQ'
    };
  });

  console.log("DASHBOARD STATE:", location.state);
  console.log("RESOLVED OFFICER INFO:", officerInfo);
  const [stats, setStats] = useState({
    active: 0, highPriority: 0, pendingSLA: 0, resolvedToday: 0, aiRouted: 0, villageCoverage: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const mapRef = React.useRef(null);

  useEffect(() => {
    if (activeTab !== 'Geospatial Activity' || loading) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    // Small delay to ensure container element is rendered in DOM
    const timer = setTimeout(() => {
      if (typeof window.L === 'undefined') {
        console.error("Leaflet CDN is not loaded yet");
        return;
      }

      const container = document.getElementById('geospatial-map');
      if (!container) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Determine map center based on complaints or default Uthamapalayam/Theni coordinates
      const getMapCenter = () => {
        const validComplaint = complaints.find(c => c.location?.latitude && c.location?.longitude);
        if (validComplaint) {
          return [validComplaint.location.latitude, validComplaint.location.longitude];
        }
        if (officerInfo.taluk?.toLowerCase().includes('uthamapalayam') || officerInfo.district?.toLowerCase().includes('theni')) {
          return [9.8143, 77.3292];
        }
        return [11.1271, 78.6569];
      };

      const center = getMapCenter();
      const map = window.L.map('geospatial-map', {
        zoomControl: false // Custom zoom control position for visual balance
      }).setView(center, 12);
      
      mapRef.current = map;

      // Add Zoom Control at bottomright for clean layout aesthetics
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Voyager Basemap (extremely sleek, modern and matching our premium theme)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '© OpenStreetMap © CartoDB'
      }).addTo(map);

      // Add custom-styled priority markers with ripple pings
      complaints.forEach(c => {
        if (c.location?.latitude && c.location?.longitude) {
          const marker = window.L.marker([c.location.latitude, c.location.longitude]).addTo(map);
          
          const color = c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#f59e0b' : '#10b981';
          const priorityClass = c.priority === 'High' ? 'red' : c.priority === 'Medium' ? 'amber' : 'emerald';
          
          const customIcon = window.L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="relative flex items-center justify-center">
                     <div class="absolute w-8 h-8 rounded-full opacity-20 animate-ping" style="background-color: ${color}"></div>
                     <div class="relative w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg" style="background-color: ${color}">
                       <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                     </div>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          
          marker.setIcon(customIcon);
          
          const popupContent = `
            <div style="font-family: 'Outfit', sans-serif; padding: 6px; width: 220px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: ${color}20; color: ${color}; padding: 3px 8px; border-radius: 9999px; border: 1px solid ${color}30;">
                  ${c.priority} Priority
                </span>
                <span style="font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; background: #f1f5f9; padding: 3px 8px; border-radius: 9999px;">
                  ${c.status}
                </span>
              </div>
              <h5 style="margin: 4px 0 6px 0; font-size: 13px; font-weight: 800; color: #0b3c6f; text-transform: uppercase; letter-spacing: -0.01em;">
                ${c.title}
              </h5>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #475569; line-height: 1.4;">
                ${c.description}
              </p>
              <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px; font-weight: 500;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-w-[180px];">
                  ${c.location?.readableAddress || 'Local Jurisdiction'}
                </span>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
        }
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, complaints, loading]);

  // Critical Administrative Handlers (Hoisted)
  async function handleLogout() {
    try {
      await api.post('/auth/officer-logout');
    } catch (err) {
      console.error('Logout API failed', err);
    }
    localStorage.removeItem('officerToken');
    localStorage.removeItem('officerRefreshToken');
    localStorage.setItem('session_status', 'LOGGED_OUT');
    localStorage.removeItem('officerInfo');
    navigate('/officer-login');
  }

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/officer/dashboard/stats'),
        api.get('/officer/dashboard/complaints', { params: filter })
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNodeSync() {
    await fetchDashboardData();
    console.log("STATEWIDE NODE SYNC COMPLETE");
  }

  async function handleAcceptCase(id) {
    try {
      await api.patch(`/officer/complaints/${id}/status`, { status: 'IN_PROGRESS' });
      await fetchDashboardData();
      setShowDrawer(false);
    } catch (err) {
      console.error('Acceptance failed', err);
    }
  }

  async function handleResolveComplaint(id) {
    try {
      await api.patch(`/officer/complaints/${id}/status`, { status: 'RESOLVED' });
      await fetchDashboardData();
      setShowDrawer(false);
    } catch (err) {
      console.error('Resolution failed', err);
    }
  }

  async function handleEscalation(id) {
    try {
      await api.patch(`/officer/complaints/${id}/status`, { status: 'ESCALATED' });
      await fetchDashboardData();
      setShowDrawer(false);
    } catch (err) {
      console.error('Escalation failed', err);
    }
  }

  // Activate Inactivity Monitor
  useInactivityLogout(handleLogout);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  // Defensive Guard for Auth Hydration
  if (!officerInfo || !officerInfo.email) {
    return (
      <div className="min-h-screen bg-[#0b3c6f] flex items-center justify-center p-10">
        <div className="text-center space-y-8 animate-pulse">
          <ShieldCheck className="w-24 h-24 text-blue-400 mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Synchronizing Administrative Session...</h2>
          <div className="w-64 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
             <div className="w-[60%] h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      'AI_ANALYZED': 'bg-blue-50 text-blue-600 border-blue-100',
      'ROUTED': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'IN_PROGRESS': 'bg-amber-50 text-amber-600 border-amber-100',
      'RESOLVED': 'bg-green-50 text-green-600 border-green-100',
      'ESCALATED': 'bg-red-50 text-red-600 border-red-100'
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'High': 'text-red-500',
      'Medium': 'text-amber-500',
      'Low': 'text-green-500'
    };
    return <span className={`flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest ${styles[priority]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${priority === 'High' ? 'bg-red-500 animate-pulse' : priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
      {priority}
    </span>;
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex text-slate-800 font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* Infrastructure Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#0b3c6f 1px, transparent 1px), linear-gradient(90deg, #0b3c6f 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-80 bg-[#0b3c6f] text-white flex flex-col sticky top-0 h-screen z-50 shadow-2xl relative">
         <div className="p-10 border-b border-white/10">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
                  <ShieldCheck className="w-8 h-8 text-[#0b3c6f]" />
               </div>
               <div>
                  <h1 className="text-xl font-black uppercase tracking-tight leading-none">UCRS PRIME</h1>
                  <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.3em] mt-1.5">State Operations Node</p>
               </div>
            </div>

            <nav className="space-y-2">
               {[
                  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
                  { icon: <FileText className="w-5 h-5" />, label: 'Complaint Ledger' },
                  { icon: <MapIcon className="w-5 h-5" />, label: 'Geospatial Activity' },
                  { icon: <BarChart3 className="w-5 h-5" />, label: 'State Analytics' },
                  { icon: <Globe className="w-5 h-5" />, label: 'Network Health' }
               ].map(item => (
                  <button 
                     key={item.label} 
                     onClick={() => setActiveTab(item.label)}
                     className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest cursor-pointer ${activeTab === item.label ? 'bg-white/10 text-white shadow-xl border border-white/10' : 'text-blue-300/60 hover:bg-white/5 hover:text-white'}`}
                  >
                     {item.icon} {item.label}
                  </button>
               ))}
            </nav>
         </div>

         <div className="mt-auto p-10 border-t border-white/10">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">System Link</p>
                     <p className="text-[11px] font-black uppercase text-green-400">Stable Node</p>
                  </div>
               </div>
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[88%] h-full bg-green-500 rounded-full animate-pulse"></div>
               </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black text-xs uppercase tracking-widest">
               <LogOut className="w-5 h-5" /> Logout Session
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col relative z-10">
         
         {/* TOP SEARCH & STATUS BAR */}
         <header className="h-[100px] bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
            <div className="flex items-center gap-8 flex-grow max-w-2xl">
               <div className="relative w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input type="text" placeholder="Search statewide complaint database (ID, Name, Pincode)..." className="w-full pl-16 pr-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#0b3c6f] transition-all font-bold text-sm" />
               </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex items-center gap-6 pr-8 border-r border-slate-200">
                  <button className="relative p-3 text-slate-400 hover:text-[#0b3c6f] hover:bg-blue-50 rounded-xl transition-all">
                     <Bell className="w-6 h-6" />
                     <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                  </button>
                  <button className="p-3 text-slate-400 hover:text-[#0b3c6f] hover:bg-blue-50 rounded-xl transition-all">
                     <Settings className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="flex items-center gap-5 pl-4">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{officerInfo.department}</p>
                     <p className="text-sm font-black text-[#0b3c6f] uppercase tracking-tight">{officerInfo.fullName || 'Authorized Officer'}</p>
                  </div>
                  <div className="w-14 h-14 bg-[#0b3c6f] rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                     <User className="w-8 h-8 text-white" />
                  </div>
               </div>
            </div>
         </header>

         {/* DASHBOARD SCROLLABLE BODY */}
         <div className="p-12 space-y-12">
            
            {/* WELCOME AREA */}
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-4xl font-black text-[#0b3c6f] uppercase tracking-tight leading-none mb-4">Operations Command Center</h2>
                  <div className="flex items-center gap-4">
                     <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <MapPin className="w-4 h-4 text-red-500" /> {officerInfo.district || 'All Districts'} • {officerInfo.taluk || 'Regional Headquarters'}
                     </span>
                     <span className="flex items-center gap-2 text-[11px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <Radio className="w-4 h-4 animate-pulse" /> LIVE UPLINK: TN-SDRC-01
                     </span>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button className="flex items-center gap-3 bg-white text-[#0b3c6f] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                     <Download className="w-5 h-5" /> Export Data
                  </button>
                  <button onClick={handleNodeSync} className="flex items-center gap-3 bg-[#0b3c6f] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-blue-900/20 transition-all">
                     <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Sync Nodes
                  </button>
               </div>
            </div>

            { activeTab === 'Dashboard' && (
               <>
                  {/* METRICS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                     {[
                        { label: 'Active Complaints', value: stats.active, icon: <FileText className="text-blue-500" />, trend: '+12% from yesterday', color: 'blue' },
                        { label: 'High Priority', value: stats.highPriority, icon: <AlertCircle className="text-red-500" />, trend: 'Requiring immediate attention', color: 'red' },
                        { label: 'Resolved Today', value: stats.resolvedToday, icon: <CheckCircle2 className="text-green-500" />, trend: 'SLA Achievement: 94.2%', color: 'green' },
                        { label: 'AI Routing Link', value: stats.aiRouted, icon: <Cpu className="text-indigo-500" />, trend: 'Auto-assignment precision active', color: 'indigo' }
                     ].map(m => (
                        <div key={m.label} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all">
                           <div className={`absolute top-0 right-0 w-32 h-32 bg-${m.color}-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-${m.color}-500/10 transition-colors`}></div>
                           <div className="flex justify-between items-start mb-8 relative z-10">
                              <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50`}>
                                 {m.icon}
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-slate-200 group-hover:text-blue-600 transition-all" />
                           </div>
                           <h3 className="text-4xl font-black text-[#0b3c6f] mb-2 relative z-10">{m.value}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">{m.label}</p>
                           <div className="pt-6 border-t border-slate-50 relative z-10 flex items-center gap-2">
                              <Info className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.trend}</span>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="flex flex-col xl:flex-row gap-12">
                     
                     {/* COMPLAINT LEDGER TABLE */}
                     <div className="flex-grow space-y-8">
                        <div className="bg-white rounded-[48px] shadow-xl border border-slate-100 overflow-hidden relative">
                           <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50/30">
                              <div className="flex items-center gap-4">
                                 <Layers className="w-8 h-8 text-[#0b3c6f]" />
                                 <h3 className="text-xl font-black text-[#0b3c6f] uppercase tracking-tight">Active Complaint Ledger</h3>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                                    <button onClick={() => setFilter({...filter, priority: ''})} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!filter.priority ? 'bg-[#0b3c6f] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>All</button>
                                    <button onClick={() => setFilter({...filter, priority: 'High'})} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter.priority === 'High' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>High</button>
                                 </div>
                                 <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0b3c6f] shadow-sm transition-all"><Filter className="w-5 h-5" /></button>
                              </div>
                           </div>

                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-50/50">
                                    <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                       <th className="px-10 py-6">Complaint Node</th>
                                       <th className="px-6 py-6">Geospatial Origin</th>
                                       <th className="px-6 py-6">Intelligence</th>
                                       <th className="px-6 py-6">Priority</th>
                                       <th className="px-6 py-6">Timeline</th>
                                       <th className="px-10 py-6 text-right">Action</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                       [...Array(6)].map((_, i) => (
                                          <tr key={i} className="animate-pulse">
                                             <td colSpan="6" className="p-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                                          </tr>
                                       ))
                                    ) : complaints.map(c => (
                                       <tr key={c._id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => { setSelectedComplaint(c); setShowDrawer(true); }}>
                                          <td className="px-10 py-8">
                                             <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-[#0b3c6f]">
                                                   {c.aiRoutingMetadata?.department?.includes('Electric') || c.category?.includes('Electric') ? <Zap className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                   <p className="text-xs font-black text-[#0b3c6f] uppercase tracking-tight mb-1">ID: {c.complaintId || c._id.slice(-8).toUpperCase()}</p>
                                                   {getStatusBadge(c.status)}
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-8">
                                             <p className="text-xs font-black text-slate-700 uppercase mb-1 truncate max-w-[200px]" title={c.location?.readableAddress}>{c.location?.readableAddress ? c.location.readableAddress.split(',')[0] : 'Local Node'}</p>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.location?.taluk || 'Regional'} Administration</p>
                                          </td>
                                          <td className="px-6 py-8">
                                             <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                                      <Cpu className="w-3 h-3" /> AI Conf: {Math.round((c.aiRoutingConfidence || 0.85) * 100)}%
                                                   </span>
                                                   <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1 max-w-[200px]">{c.title}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-8">{getPriorityBadge(c.priority || 'Medium')}</td>
                                          <td className="px-6 py-8">
                                             <div className="flex items-center gap-2.5">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                <div>
                                                   <p className="text-[10px] font-black text-slate-700">SLA: 48H Remaining</p>
                                                   <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                      <div className="w-[60%] h-full bg-blue-500"></div>
                                                   </div>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-10 py-8 text-right">
                                             <button className="p-3 text-slate-400 hover:text-[#0b3c6f] hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                                                <ExternalLink className="w-5 h-5" />
                                             </button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                              {complaints.length === 0 && !loading && (
                                 <div className="p-20 text-center animate-in fade-in duration-300">
                                    <FilterX className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                    <h4 className="text-xl font-black text-slate-300 uppercase tracking-tight">No active nodes detected in current ledger</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Adjust system filters for broader uplink</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* RIGHT AI MONITORING PANEL */}
                     <aside className="w-full xl:w-[450px] space-y-8">
                        <div className="bg-[#0b3c6f] text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden border border-white/10">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                           <div className="flex items-center justify-between mb-10 relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><Radio className="w-6 h-6 text-blue-400 animate-pulse" /></div>
                                 <div>
                                    <h4 className="font-black text-lg uppercase tracking-tight">AI Live Sync</h4>
                                    <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em]">Regional Semantic Routing</p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">ONLINE</span>
                           </div>

                           <div className="space-y-6 relative z-10">
                              {[
                                 { event: 'Geo-Extraction', status: 'Completed', confidence: '98%', icon: <MapPin className="w-4 h-4" /> },
                                 { event: 'Dept Classification', status: 'Completed', confidence: '94%', icon: <Building2 className="w-4 h-4" /> },
                                 { event: 'Sentiment Mapping', status: 'In Progress', confidence: '82%', icon: <BarChart3 className="w-4 h-4" /> }
                              ].map(e => (
                                 <div key={e.event} className="bg-white/5 p-5 rounded-3xl border border-white/10">
                                    <div className="flex justify-between items-center mb-3">
                                       <div className="flex items-center gap-3">
                                          <div className="text-blue-400">{e.icon}</div>
                                          <span className="text-[10px] font-black uppercase tracking-widest">{e.event}</span>
                                       </div>
                                       <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{e.confidence}</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                       <div className="h-full bg-blue-500" style={{ width: e.confidence }}></div>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="mt-12 bg-white/10 p-8 rounded-[32px] border border-white/10 relative z-10">
                              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                 <BarChart3 className="w-4 h-4 text-blue-300" /> Infrastructure Traffic
                              </h5>
                              <div className="flex items-end gap-3 h-32 justify-between px-2">
                                 {[40, 70, 45, 90, 65, 30, 80, 50, 60, 40, 75, 55].map((h, i) => (
                                    <div key={i} className="flex-grow bg-blue-400/20 rounded-full relative overflow-hidden">
                                       <div className="absolute bottom-0 left-0 w-full bg-blue-400 animate-pulse" style={{ height: `${h}%`, animationDelay: `${i*100}ms` }}></div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-10 rounded-[48px] shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20"></div>
                           <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
                              <Navigation className="w-5 h-5 text-[#0b3c6f]" /> Statewide Map Hub
                           </h4>
                           
                           <div className="h-64 bg-slate-100 rounded-[32px] relative overflow-hidden border border-slate-200 shadow-inner group">
                              <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/Tamil_Nadu_relief_location_map.jpg')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-100"></div>
                              <div className="absolute inset-0 flex items-center justify-center flex-col bg-[#0b3c6f]/20 group-hover:bg-transparent transition-all backdrop-blur-sm group-hover:backdrop-blur-0">
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-4"><MapIcon className="w-8 h-8 text-[#0b3c6f]" /></div>
                                 <p className="text-[10px] font-black text-[#0b3c6f] uppercase tracking-[0.3em]">Launch Activity View</p>
                              </div>
                           </div>
                        </div>
                     </aside>
                  </div>
               </>
            )}

            { activeTab === 'Complaint Ledger' && (
               <div className="w-full animate-in slide-in-from-bottom-5 duration-500">
                  <div className="bg-white rounded-[48px] shadow-xl border border-slate-100 overflow-hidden relative">
                     <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                           <Layers className="w-8 h-8 text-[#0b3c6f]" />
                           <h3 className="text-xl font-black text-[#0b3c6f] uppercase tracking-tight">Active Complaint Ledger (Unified Node)</h3>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                              <button onClick={() => setFilter({...filter, priority: ''})} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!filter.priority ? 'bg-[#0b3c6f] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>All</button>
                              <button onClick={() => setFilter({...filter, priority: 'High'})} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter.priority === 'High' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>High</button>
                           </div>
                           <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#0b3c6f] shadow-sm transition-all"><Filter className="w-5 h-5" /></button>
                        </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50/50">
                              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                 <th className="px-10 py-6">Complaint Node</th>
                                 <th className="px-6 py-6">Geospatial Origin</th>
                                 <th className="px-6 py-6">Intelligence</th>
                                 <th className="px-6 py-6">Priority</th>
                                 <th className="px-6 py-6">Timeline</th>
                                 <th className="px-10 py-6 text-right">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {loading ? (
                                 [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                       <td colSpan="6" className="p-8"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                                    </tr>
                                 ))
                              ) : complaints.map(c => (
                                 <tr key={c._id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => { setSelectedComplaint(c); setShowDrawer(true); }}>
                                    <td className="px-10 py-8">
                                       <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-[#0b3c6f]">
                                             {c.aiRoutingMetadata?.department?.includes('Electric') || c.category?.includes('Electric') ? <Zap className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                          </div>
                                          <div>
                                             <p className="text-xs font-black text-[#0b3c6f] uppercase tracking-tight mb-1">ID: {c.complaintId || c._id.slice(-8).toUpperCase()}</p>
                                             {getStatusBadge(c.status)}
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-8">
                                       <p className="text-xs font-black text-slate-700 uppercase mb-1 truncate max-w-[400px]" title={c.location?.readableAddress}>{c.location?.readableAddress || 'Local Node'}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.location?.taluk || 'Regional'} Administration</p>
                                    </td>
                                    <td className="px-6 py-8">
                                       <div className="flex items-center gap-3">
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                                <Cpu className="w-3 h-3" /> AI Conf: {Math.round((c.aiRoutingConfidence || 0.85) * 100)}%
                                             </span>
                                             <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1 max-w-[300px]">{c.title}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-8">{getPriorityBadge(c.priority || 'Medium')}</td>
                                    <td className="px-6 py-8">
                                       <div className="flex items-center gap-2.5">
                                          <Clock className="w-4 h-4 text-slate-300" />
                                          <div>
                                             <p className="text-[10px] font-black text-slate-700">SLA: 48H Remaining</p>
                                             <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                <div className="w-[60%] h-full bg-blue-500"></div>
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                       <button className="p-3 text-slate-400 hover:text-[#0b3c6f] hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                                          <ExternalLink className="w-5 h-5" />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                        {complaints.length === 0 && !loading && (
                           <div className="p-20 text-center animate-in fade-in duration-300">
                              <FilterX className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                              <h4 className="text-xl font-black text-slate-300 uppercase tracking-tight">No active nodes detected in current ledger</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Adjust system filters for broader uplink</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            { activeTab === 'Geospatial Activity' && (
               <div className="w-full bg-white border border-slate-200 p-12 rounded-[48px] shadow-sm relative overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                     <h4 className="font-black text-lg text-[#0b3c6f] uppercase tracking-tight flex items-center gap-3">
                        <Navigation className="w-6 h-6 text-[#0b3c6f]" /> Statewide Map Hub & Live Geospatial Nodes
                     </h4>
                     <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] bg-slate-100 px-6 py-2.5 rounded-full border border-slate-200 shadow-sm">
                        Monitoring node: {officerInfo.district} - {officerInfo.taluk}
                     </p>
                  </div>
                  
                  <div className="relative rounded-[32px] overflow-hidden border border-slate-200 shadow-lg z-0">
                     <div id="geospatial-map" className="h-[550px] w-full bg-slate-100 z-0"></div>
                     
                     {/* Floating live telemetry widget */}
                     <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-200/50 max-w-sm pointer-events-none">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-8 h-8 bg-[#0b3c6f] text-white rounded-xl flex items-center justify-center shadow-md">
                              <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                           </div>
                           <div>
                              <h5 className="font-black text-[11px] text-[#0b3c6f] uppercase tracking-wide">Spatial Node Links</h5>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live telemetry feed</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] text-slate-600 gap-8">
                              <span className="font-bold uppercase tracking-wider">Active Pin Count</span>
                              <span className="font-black text-[#0b3c6f]">{complaints.filter(c => c.location?.latitude).length} cases</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] text-slate-600">
                              <span className="font-bold uppercase tracking-wider">Spatial Routing</span>
                              <span className="font-black text-green-600 uppercase flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                                 ONLINE
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            { activeTab === 'State Analytics' && (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="bg-[#0b3c6f] text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden border border-white/10">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><Radio className="w-6 h-6 text-blue-400 animate-pulse" /></div>
                           <div>
                              <h4 className="font-black text-lg uppercase tracking-tight">AI Live Sync Telemetry</h4>
                              <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em]">Regional Semantic Routing</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">ONLINE</span>
                     </div>

                     <div className="space-y-6 relative z-10">
                        {[
                           { event: 'Geo-Extraction', status: 'Completed', confidence: '98%', icon: <MapPin className="w-4 h-4" /> },
                           { event: 'Dept Classification', status: 'Completed', confidence: '94%', icon: <Building2 className="w-4 h-4" /> },
                           { event: 'Sentiment Mapping', status: 'In Progress', confidence: '82%', icon: <BarChart3 className="w-4 h-4" /> }
                        ].map(e => (
                           <div key={e.event} className="bg-white/5 p-6 rounded-3xl border border-white/10">
                              <div className="flex justify-between items-center mb-3">
                                 <div className="flex items-center gap-3">
                                    <div className="text-blue-400">{e.icon}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{e.event}</span>
                                 </div>
                                 <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{e.confidence}</span>
                              </div>
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500" style={{ width: e.confidence }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-12 rounded-[48px] shadow-sm relative overflow-hidden flex flex-col justify-between">
                     <div>
                        <h4 className="font-black text-lg text-[#0b3c6f] uppercase tracking-tight mb-8 flex items-center gap-3">
                           <Activity className="w-6 h-6 text-[#0b3c6f]" /> Infrastructure Traffic Metrics
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-12">Dynamic node routing load statistics over the last 12 intervals.</p>
                     </div>
                     
                     <div className="mt-12 bg-slate-50 p-10 rounded-[32px] border border-slate-100">
                        <div className="flex items-end gap-3 h-48 justify-between px-2">
                           {[40, 70, 45, 90, 65, 30, 80, 50, 60, 40, 75, 55].map((h, i) => (
                              <div key={i} className="flex-grow bg-blue-500/10 rounded-full relative overflow-hidden h-full">
                                 <div className="absolute bottom-0 left-0 w-full bg-[#0b3c6f] animate-pulse" style={{ height: `${h}%`, animationDelay: `${i*100}ms` }}></div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            { activeTab === 'Network Health' && (
               <div className="bg-[#0b3c6f] text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden border border-white/10 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                     <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                  
                  <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-8">
                     <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center border border-white/20"><Radio className="w-8 h-8 text-blue-400 animate-pulse" /></div>
                     <div>
                        <h4 className="font-black text-2xl uppercase tracking-tight">Statewide Governance Network Status</h4>
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.3em] mt-1.5">Real-time UCRS Uptime & Latency Telemetry</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                     <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Sync Latency</p>
                        <h5 className="text-4xl font-black text-green-400">18ms</h5>
                     </div>
                     <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Node Availability</p>
                        <h5 className="text-4xl font-black text-green-400">99.98%</h5>
                     </div>
                     <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Secure Link</p>
                        <h5 className="text-4xl font-black text-blue-400">AES-256</h5>
                     </div>
                  </div>

                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                     <h5 className="text-sm font-black uppercase tracking-[0.2em] text-blue-200 mb-6 flex items-center gap-3"><Shield className="w-5 h-5 text-blue-300" /> Administrative Security Auditing</h5>
                     <p className="text-xs font-bold text-blue-100/70 leading-relaxed uppercase tracking-wider">This terminal node operates in complete synchronization with the National Informatics Centre (NIC) and local regional gateways. Every transaction, category realignment, and resolution update is fully encrypted and auditable under state grievance tracking protocols.</p>
                  </div>
               </div>
            )}

         </div>
      </main>

      {/* COMPLAINT DETAILS DRAWER (Glassmorphism Modal) */}
      {showDrawer && selectedComplaint && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-[#0b3c6f]/40 backdrop-blur-xl" onClick={() => setShowDrawer(false)}></div>
            <div className="bg-white w-full max-w-6xl h-full rounded-[48px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden flex flex-col border border-white/20">
               {/* Modal Header */}
               <header className="p-12 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-8">
                     <div className="w-20 h-20 bg-[#0b3c6f] text-white rounded-[28px] flex items-center justify-center shadow-2xl">
                        <FileText className="w-10 h-10" />
                     </div>
                     <div>
                        <div className="flex items-center gap-4 mb-3">
                           <h3 className="text-3xl font-black text-[#0b3c6f] uppercase tracking-tight">Case File: {selectedComplaint.complaintId || selectedComplaint._id.slice(-8).toUpperCase()}</h3>
                           {getStatusBadge(selectedComplaint.status)}
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                           <MapPin className="w-4 h-4 text-red-500" /> {selectedComplaint.location?.readableAddress || 'Local Node'}
                        </p>
                     </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                     <Download className="w-6 h-6 rotate-180" />
                  </button>
               </header>

               {/* Modal Body */}
               <div className="flex-grow overflow-y-auto p-12 grid grid-cols-1 xl:grid-cols-3 gap-12">
                  <div className="xl:col-span-2 space-y-12">
                     <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                           <Info className="w-5 h-5 text-[#0b3c6f]" /> Intelligence Overview
                        </h4>
                        <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                           <h5 className="text-xl font-black text-[#0b3c6f] uppercase tracking-tight mb-6">{selectedComplaint.title}</h5>
                           <p className="text-slate-600 leading-relaxed text-lg">{selectedComplaint.description}</p>
                        </div>
                     </section>

                     <section>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                           <Radio className="w-5 h-5 text-[#0b3c6f]" /> Routing Telemetry
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[32px]">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Assigned Bureau</p>
                              <p className="text-lg font-black text-[#0b3c6f] uppercase">{selectedComplaint.aiRoutingMetadata?.department || selectedComplaint.category || 'General Department'}</p>
                           </div>
                           <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[32px]">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">AI Routing Confidence</p>
                              <p className="text-lg font-black text-indigo-600 uppercase">{Math.round((selectedComplaint.aiRoutingConfidence || 0.85) * 100)}% Match</p>
                           </div>
                        </div>
                     </section>

                     <section>
                         <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-[#0b3c6f]" /> Action Timeline
                         </h4>
                         <div className="space-y-6">
                            {[
                               { label: 'AI_ANALYZED', time: '10:42 AM', desc: 'Semantic analysis and department extraction complete.' },
                               { label: 'ROUTED', time: '10:45 AM', desc: 'Case assigned to Melur TANGEDCO Regional Office.' },
                               { label: 'VIEWED', time: 'CURRENT', desc: 'Administrative review in progress.' }
                            ].map((step, i) => (
                               <div key={i} className="flex gap-6 relative">
                                  {i < 2 && <div className="absolute top-8 left-4 w-0.5 h-full bg-slate-100"></div>}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${step.time === 'CURRENT' ? 'bg-[#0b3c6f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                     {step.time === 'CURRENT' ? <Radio className="w-4 h-4 animate-pulse" /> : <CheckCircle2 className="w-4 h-4" />}
                                  </div>
                                  <div className="bg-white p-6 rounded-3xl border border-slate-100 flex-grow shadow-sm">
                                     <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase text-[#0b3c6f] tracking-widest">{step.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{step.time}</span>
                                     </div>
                                     <p className="text-xs font-medium text-slate-500 uppercase">{step.desc}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                     </section>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-[#0b3c6f] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 pb-6 border-b border-white/10">Officer Controls</h4>
                        <div className="space-y-6 relative z-10">
                           <button onClick={() => handleAcceptCase(selectedComplaint._id)} className="w-full py-5 bg-white text-[#0b3c6f] rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
                              <CheckCircle2 className="w-5 h-5" /> Accept Case
                           </button>
                           <button onClick={() => handleEscalation(selectedComplaint._id)} className="w-full py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                              <BarChart3 className="w-5 h-5" /> Escalate Node
                           </button>
                           <button className="w-full py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                              <Share2 className="w-5 h-5" /> Transfer Region
                           </button>
                           <button onClick={() => handleResolveComplaint(selectedComplaint._id)} className="w-full py-5 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-green-600 transition-all flex items-center justify-center gap-3">
                              <Zap className="w-5 h-5" /> Mark Resolved
                           </button>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                         <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.4em] mb-8">Internal Notes</h4>
                         <textarea className="w-full h-40 bg-white border border-slate-200 rounded-[28px] p-6 outline-none focus:border-[#0b3c6f] text-sm font-bold resize-none" placeholder="Enter administrative observations..."></textarea>
                         <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Update Ledger</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default OfficerDashboard;
