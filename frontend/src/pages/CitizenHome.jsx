import React from 'react';
import { useTranslation } from 'react-i18next';
import ComplaintForm from '../components/ComplaintForm';
import { FileText, Cpu, Building2, MapPin, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const CitizenHome = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const steps = [
    { key: "submitted", icon: <FileText className="w-4 h-4" /> },
    { key: "ai_routing", icon: <Cpu className="w-4 h-4" /> },
    { key: "nodal_office", icon: <Building2 className="w-4 h-4" /> },
    { key: "officer", icon: <UserCheck className="w-4 h-4" /> },
    { key: "resolved", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="pb-24">
      {/* Modern Centered Hero */}
      <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-6">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
           </span>
           <span className={`text-[10px] font-black text-blue-600 uppercase tracking-widest ${isTamil ? 'tracking-normal font-bold normal-case' : ''}`}>
              {isTamil ? 'AI உதவி ஆன்லைனில் உள்ளது' : 'AI Assistance Online'}
           </span>
        </div>
        <h1 className={`text-4xl md:text-6xl font-black text-[#0b3058] tracking-tight mb-6 leading-[1.1] ${isTamil ? 'tracking-normal font-extrabold normal-case leading-snug' : ''}`}>
           {t('home.hero_title')} <br/>
           <span className="text-slate-300">{t('home.hero_subtitle')}</span>
        </h1>
        <p className={`text-lg text-slate-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed ${isTamil ? 'font-semibold' : ''}`}>
           {t('home.ai_desc')}
        </p>

        {/* The Hero Complaint Box */}
        <div className="max-w-2xl mx-auto mb-24">
           <ComplaintForm onComplaintAdded={(comp) => console.log('Added', comp)} />
        </div>

        {/* Minimal Horizontal Workflow */}
        <div className="max-w-3xl mx-auto border-t border-slate-100 pt-16">
           <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 ${isTamil ? 'tracking-normal font-bold normal-case text-xs' : ''}`}>
              {t('home.workflow_title')}
           </h3>
           <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-3 group">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:shadow-md transition-all">
                        {step.icon}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#0b3058] transition-colors ${isTamil ? 'tracking-normal normal-case text-xs font-semibold' : ''}`}>
                        {t(`home.${step.key}`)}
                     </span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden md:block w-3 h-3 text-slate-200" />
                  )}
                </React.Fragment>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default CitizenHome;
