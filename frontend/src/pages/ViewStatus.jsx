import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const ViewStatus = () => {
  const { t, i18n } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isTamil = i18n.language === 'ta';

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints/my');
      setComplaints(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(comp => 
    comp._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (comp.complaintId && comp.complaintId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (comp.predictedDepartment && comp.predictedDepartment.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
        <NavLink to="/" className="hover:text-blue-600 transition-colors">{t('nav.home')}</NavLink>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0b3058]">{t('status.title')}</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-premium overflow-hidden mb-12">
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <h2 className={`text-sm font-black text-[#0b3058] uppercase tracking-widest ${isTamil ? 'tracking-normal font-bold normal-case text-base' : ''}`}>
             {t('status.subtitle')}
          </h2>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <div className="flex-grow w-full md:w-auto relative">
              <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <input 
                  type="text" 
                  placeholder={t('status.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow px-4 py-3 text-sm outline-none bg-transparent"
                />
                <button className="bg-[#0b3058] text-white px-6 flex items-center justify-center hover:bg-blue-900 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button 
              onClick={fetchComplaints}
              className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 text-[#0b3058] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {t('status.refresh')}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className={`px-6 py-4 font-black ${isTamil ? 'tracking-normal font-bold normal-case text-[11px]' : ''}`}>{t('status.col_id')}</th>
                  <th className={`px-6 py-4 font-black ${isTamil ? 'tracking-normal font-bold normal-case text-[11px]' : ''}`}>{t('status.col_subject')}</th>
                  <th className={`px-6 py-4 font-black ${isTamil ? 'tracking-normal font-bold normal-case text-[11px]' : ''}`}>{t('status.col_date')}</th>
                  <th className={`px-6 py-4 font-black text-center ${isTamil ? 'tracking-normal font-bold normal-case text-[11px]' : ''}`}>{t('status.col_status')}</th>
                  <th className={`px-6 py-4 font-black text-center ${isTamil ? 'tracking-normal font-bold normal-case text-[11px]' : ''}`}>{t('status.col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                      {t('status.loading')}
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center bg-white">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <span className="font-black uppercase tracking-widest text-xs text-slate-400">{t('status.no_records')}</span>
                        <span className="text-[10px] mt-2 font-medium">{t('status.no_records_sub')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((comp) => (
                    <tr key={comp._id} className="bg-white hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5 font-mono text-xs font-bold text-[#0b3058]">
                        #{comp._id.substring(comp._id.length - 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#0b3058]">{comp.departmentId?.name || comp.predictedDepartment}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{comp.title}</span>
                           {(comp.district || comp.taluk) && (
                             <>
                               <span className="text-slate-300">•</span>
                               <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{comp.district} {comp.taluk ? '• ' + comp.taluk : ''}</span>
                             </>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {new Date(comp.createdAt || Date.now()).toLocaleDateString(i18n.language === 'en' ? 'en-IN' : 'ta-IN')}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          comp.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                          comp.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors border-b-2 border-transparent hover:border-blue-200">
                          {t('status.view_timeline')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ViewStatus;
