import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ShieldCheck, Menu, X, Globe, User, Share2, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isTamil = i18n.language === 'ta';

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'status', path: '/status' },
    { key: 'guidelines', path: '/guidelines' },
    { key: 'contact', path: '/contact' }
  ];

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex flex-col ${isTamil ? 'lang-ta' : 'lang-en'}`}>
      {/* Dynamic Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <NavLink to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-[#0b3058] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                   <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                   <span className={`text-sm font-black tracking-tight text-[#0b3058] uppercase ${isTamil ? 'font-bold normal-case tracking-normal' : ''}`}>
                      {isTamil ? 'தமிழ்நாடு ஒருங்கிணைந்த இணையதளம்' : 'TN Unified Portal'}
                   </span>
                   {!isTamil && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Government of Tamil Nadu</span>}
                </div>
             </NavLink>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6 items-center">
              {navLinks.map(link => (
                <NavLink 
                  key={link.path} 
                  to={link.path} 
                  className={({isActive}) => `text-[11px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-[#0b3058]'} ${isTamil ? 'text-[13px] font-semibold tracking-normal normal-case' : ''}`}
                >
                  {t(`nav.${link.key}`)}
                </NavLink>
              ))}
            </nav>
            <div className="h-4 w-px bg-slate-200"></div>
            
            {/* Improved Language Switcher */}
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
               <button 
                 onClick={() => changeLanguage('en')} 
                 className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${i18n.language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 EN
               </button>
               <button 
                 onClick={() => changeLanguage('ta')} 
                 className={`px-3 py-1 text-[12px] font-bold rounded-md transition-all ${i18n.language === 'ta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 தமிழ்
               </button>
            </div>

            <NavLink to="/officer-login" className={`px-4 py-1.5 bg-[#0b3058] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-900 transition-all shadow-sm ${isTamil ? 'text-[11px] font-bold tracking-normal normal-case' : ''}`}>
               {isTamil ? 'அலுவலர் உள்நுழைவு' : 'Officer Access'}
            </NavLink>
          </div>

          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-20 px-6 overflow-y-auto">
           <div className="flex flex-col gap-6">
              {navLinks.map(link => (
                <NavLink key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-black text-[#0b3058] ${isTamil ? 'text-xl font-bold' : ''}`}>
                   {t(`nav.${link.key}`)}
                </NavLink>
              ))}
              <div className="h-px bg-slate-100 my-4"></div>
              <div className="flex gap-4">
                 <button onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl border ${i18n.language === 'en' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200'}`}>English</button>
                 <button onClick={() => { changeLanguage('ta'); setMobileMenuOpen(false); }} className={`px-4 py-2 rounded-xl border ${i18n.language === 'ta' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200'}`}>தமிழ்</button>
              </div>
              <NavLink to="/officer-login" className="text-lg font-black text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                 {isTamil ? 'அலுவலர் உள்நுழைவு' : 'Officer Access'}
              </NavLink>
           </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Compact Minimal Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 opacity-30 grayscale justify-center md:justify-start">
                  <ShieldCheck className="w-5 h-5" />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isTamil ? 'tracking-normal font-bold' : ''}`}>
                     {t('footer.rights').split('.')[0]}
                  </span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium italic">{t('footer.rights')}</p>
            </div>
            
            <div className={`flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${isTamil ? 'tracking-normal normal-case text-[11px]' : ''}`}>
               <a href="#" className="hover:text-[#0b3058]">{t('footer.privacy')}</a>
               <a href="#" className="hover:text-[#0b3058]">{t('footer.terms')}</a>
               <a href="#" className="hover:text-[#0b3058]">{t('footer.accessibility')}</a>
            </div>

            <div className="flex gap-4">
               <Share2 className="w-4 h-4 text-slate-300 hover:text-[#0b3058] cursor-pointer transition-colors" />
               <Globe className="w-4 h-4 text-slate-300 hover:text-[#0b3058] cursor-pointer transition-colors" />
               <MessageCircle className="w-4 h-4 text-slate-300 hover:text-[#0b3058] cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
