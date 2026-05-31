import React from 'react';
import { ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
        <NavLink to="/" className="hover:text-blue-600 transition-colors">{t('nav.home')}</NavLink>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0b3058]">{t('contact.title')}</span>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-premium overflow-hidden max-w-4xl">
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
          <h2 className={`text-sm font-black text-[#0b3058] uppercase tracking-widest ${isTamil ? 'tracking-normal font-bold normal-case text-base' : ''}`}>
             {t('contact.header')}
          </h2>
        </div>
        
        <div className="p-8">
          <p className="text-sm text-slate-500 font-medium mb-12 leading-relaxed">{t('contact.desc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-500">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                 <Phone className="w-7 h-7 text-blue-600" />
               </div>
               <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2">{t('contact.toll_free')}</h3>
               <p className="text-2xl font-black text-[#0b3058] mb-3">1800 419 1100</p>
               <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{t('contact.available')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('contact.hours')}</p>
               </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-500">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                 <Mail className="w-7 h-7 text-blue-600" />
               </div>
               <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2">{t('contact.email_support')}</h3>
               <p className="text-lg font-bold text-[#0b3058] mb-3">grievance@tn.gov.in</p>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[180px]">{t('contact.email_sub')}</p>
            </div>

            <div className="md:col-span-2 bg-[#0b3058] p-8 rounded-3xl text-white flex flex-col md:flex-row items-center gap-8 shadow-premium">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                 <MapPin className="w-8 h-8 text-white" />
               </div>
               <div className="text-center md:text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">{t('contact.address_title')}</h3>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    {t('contact.address_content')}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactUs;
