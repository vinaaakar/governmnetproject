import React from 'react';
import { ChevronRight, FileText, AlertTriangle, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Guidelines = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
        <NavLink to="/" className="hover:text-blue-600 transition-colors">{t('nav.home')}</NavLink>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0b3058]">{t('guidelines.title')}</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-premium overflow-hidden max-w-4xl">
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <h2 className={`text-sm font-black text-[#0b3058] uppercase tracking-widest flex items-center gap-3 ${isTamil ? 'tracking-normal font-bold normal-case text-base' : ''}`}>
            <FileText className="w-5 h-5 text-blue-600" />
            {t('guidelines.header')}
          </h2>
        </div>
        
        <div className="p-8 space-y-12">
          
          <section>
            <h3 className={`text-xs font-black text-[#0b3058] uppercase tracking-widest border-b border-slate-50 pb-3 mb-6 ${isTamil ? 'tracking-normal font-bold normal-case text-sm' : ''}`}>
               {t('guidelines.sec1_title')}
            </h3>
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <ul className="space-y-3 text-sm text-amber-900 font-medium leading-relaxed">
                <li className="flex gap-2"><span>•</span> {t('guidelines.sec1_item1')}</li>
                <li className="flex gap-2"><span>•</span> {t('guidelines.sec1_item2')}</li>
                <li className="flex gap-2"><span>•</span> {t('guidelines.sec1_item3')}</li>
                <li className="flex gap-2"><span>•</span> {t('guidelines.sec1_item4')}</li>
                <li className="flex gap-2"><span>•</span> {t('guidelines.sec1_item5')}</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className={`text-xs font-black text-[#0b3058] uppercase tracking-widest border-b border-slate-50 pb-3 mb-6 ${isTamil ? 'tracking-normal font-bold normal-case text-sm' : ''}`}>
               {t('guidelines.sec2_title')}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{t('guidelines.sec2_desc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                   <Clock className="w-6 h-6 text-red-500" />
                </div>
                <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('guidelines.prio_critical')}</span>
                <span className="text-xs font-bold text-[#0b3058]">{t('guidelines.sla_critical')}</span>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                   <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('guidelines.prio_high')}</span>
                <span className="text-xs font-bold text-[#0b3058]">{t('guidelines.sla_high')}</span>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                   <Clock className="w-6 h-6 text-green-500" />
                </div>
                <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('guidelines.prio_normal')}</span>
                <span className="text-xs font-bold text-[#0b3058]">{t('guidelines.sla_normal')}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className={`text-xs font-black text-[#0b3058] uppercase tracking-widest border-b border-slate-50 pb-3 mb-6 ${isTamil ? 'tracking-normal font-bold normal-case text-sm' : ''}`}>
               {t('guidelines.sec3_title')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="w-8 h-8 bg-[#0b3058] text-white rounded-lg flex items-center justify-center font-black text-xs">1</div>
                 <span className="text-sm text-slate-700 font-medium">{t('guidelines.sec3_item1')}</span>
              </li>
              <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="w-8 h-8 bg-[#0b3058] text-white rounded-lg flex items-center justify-center font-black text-xs">2</div>
                 <span className="text-sm text-slate-700 font-medium">{t('guidelines.sec3_item2')}</span>
              </li>
              <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="w-8 h-8 bg-[#0b3058] text-white rounded-lg flex items-center justify-center font-black text-xs">3</div>
                 <span className="text-sm text-slate-700 font-medium">{t('guidelines.sec3_item3')}</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
};

export default Guidelines;
