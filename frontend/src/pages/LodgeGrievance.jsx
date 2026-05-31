import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComplaintForm from '../components/ComplaintForm';

const LodgeGrievance = () => {
  const { t } = useTranslation();

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">
        <NavLink to="/" className="hover:text-blue-600 transition-colors">{t('nav.home')}</NavLink>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0b3058]">{t('home.hero_title')}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Right Panel: Form (Hero Focus) */}
        <div className="w-full lg:w-2/3 order-1">
          <ComplaintForm onComplaintAdded={(newComp) => {
            alert(t('status.no_records') + ": " + newComp._id);
          }} />
        </div>

        {/* Left Panel: Instructions */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 order-2">
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-premium overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <h3 className="text-xs font-black text-[#0b3058] uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {t('guidelines.header')}
              </h3>
            </div>
            <div className="p-6 text-sm text-slate-600 space-y-4 font-medium leading-relaxed">
              <p>• {t('guidelines.sec3_item1')}</p>
              <p>• {t('guidelines.sec3_item2')}</p>
              <p>• {t('guidelines.sec3_item3')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LodgeGrievance;
