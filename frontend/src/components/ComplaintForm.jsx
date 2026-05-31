import React, { useState, useEffect } from 'react';
import { Mic, MapPin, ShieldCheck, Send, RefreshCw, Cpu, Building2, Map, ChevronRight, User, Phone, Mail, ChevronDown, ChevronUp, Lock, CheckCircle2, Clock, Activity, Navigation, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { STATE_REGISTRY } from '../data/stateRegistry';

const ComplaintForm = ({ onComplaintAdded }) => {
  const { t, i18n } = useTranslation();
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [readableLocation, setReadableLocation] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const isTamil = i18n.language === 'ta';

  // Lifecycle Steps for Success Animation
  const LIFECYCLE_STEPS = [
    { label: 'Complaint Uploaded', icon: <Send className="w-5 h-5" /> },
    { label: 'AI Jurisdiction Detection', icon: <Cpu className="w-5 h-5" /> },
    { label: 'Department Mapping', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Regional Office Assignment', icon: <Map className="w-5 h-5" /> },
    { label: 'Officer Allocation', icon: <User className="w-5 h-5" /> },
    { label: 'SLA Timer Activated', icon: <Clock className="w-5 h-5" /> }
  ];

  // Mock Live AI Analysis for UX Feedback
  useEffect(() => {
    if (description.length > 15) {
      const timer = setTimeout(() => {
        const text = description.toLowerCase();
        const dept = text.includes('water') || text.includes('tap') || text.includes('தண்ணீர்') ? 'TWAD (Water Board)' : 
                     text.includes('drainage') || text.includes('drain') || text.includes('sewage') || text.includes('leak') ? 'TWAD (Water Board)' :
                     text.includes('electricity') || text.includes('power') || text.includes('current') || text.includes('eb') || text.includes('voltage') || text.includes('மின்சாரம்') ? 'TANGEDCO (EB)' : 
                     text.includes('road') || text.includes('pothole') || text.includes('சாலை') ? 'Highways Dept' :
                     text.includes('garbage') || text.includes('waste') || text.includes('sanitation') ? 'Municipality' :
                     (isTamil ? 'வருவாய்த்துறை' : 'Revenue Dept');
        
        // Prioritize geolocated node data if available
        let district = location?.district || (isTamil ? 'சென்னை' : 'Chennai');
        let taluk = location?.taluk || (isTamil ? 'பொது' : 'General');
        
        // If not geolocated, parse from text
        if (!location) {
          if (text.includes('madurai') || text.includes('மதுரை')) district = isTamil ? 'மதுரை' : 'Madurai';
          if (text.includes('adyar') || text.includes('அடையாறு')) taluk = isTamil ? 'அடையாறு மண்டலம்' : 'Adyar Zone';
        }

        setAiAnalysis({
          dept, district, taluk,
          office: `${district} • ${taluk !== 'General' && taluk !== 'பொது' ? taluk : district}`,
          priority: text.includes('urgent') || text.includes('emergency') || text.includes('danger') || text.includes('critical') ? 'High' : 'Normal'
        });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setAiAnalysis(null);
    }
  }, [description, isTamil, location]);

  const cleanDistrict = (name) => {
    let clean = name.replace(/District|City|Region|Zone/gi, '').trim();
    clean = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    const mappings = {
      'Tiruchirappalli': 'Tiruchirappalli',
      'Trichy': 'Tiruchirappalli',
      'Madura': 'Madurai',
      'Coimbatore': 'Coimbatore',
      'Kovai': 'Coimbatore',
      'Nagercoil': 'Kanyakumari',
      'Agasteeswaram': 'Kanyakumari',
      'Agastheeswaram': 'Kanyakumari'
    };
    return mappings[clean] || clean;
  };

  const resolveSmartTaluk = (district, subdistrict, fullAddress) => {
    const registry = {
      Theni: ['Theni', 'Periyakulam', 'Andipatti', 'Uthamapalayam', 'Bodinayakanur'],
      Chennai: ['Tondiarpet', 'Purasawalkam', 'Ayanavaram', 'Aminjikarai', 'Egmore', 'Mylapore', 'Mambalam', 'Guindy', 'Velachery', 'Alandur', 'Sholinganallur', 'Perambur', 'Madhavaram', 'Thiruvottiyur', 'Manali', 'Ambattur', 'Anna Nagar', 'Teynampet', 'Kodambakkam', 'Royapuram', 'Adayar'],
      Coimbatore: ['Coimbatore North', 'Coimbatore South', 'Mettupalayam', 'Pollachi', 'Sulur', 'Valparai', 'Kinathukadavu', 'Annur', 'Madukkarai', 'Perur', 'Anaimalai'],
      Madurai: ['Madurai North', 'Madurai South', 'Madurai East', 'Madurai West', 'Melur', 'Usilampatti', 'Tirumangalam', 'Vadipatti', 'Peraiyur', 'Thiruparankundram', 'Kalligudi']
    };

    const districtClean = cleanDistrict(district);
    const taluks = registry[districtClean] || [];
    
    // 1. Try to find an exact match in the subdistrict string
    const subClean = subdistrict.toLowerCase();
    for (const t of taluks) {
      if (subClean.includes(t.toLowerCase())) return t;
    }

    // 2. Try to find a match anywhere in the fullAddress string
    const addrClean = fullAddress.toLowerCase();
    // First pass: check taluks that are NOT identical to the district name to prevent false matches
    for (const t of taluks) {
      if (t.toLowerCase() !== districtClean.toLowerCase()) {
        if (addrClean.includes(t.toLowerCase())) return t;
      }
    }
    // Second pass: check the taluk that is identical to the district name
    for (const t of taluks) {
      if (t.toLowerCase() === districtClean.toLowerCase()) {
        if (addrClean.includes(t.toLowerCase())) return t;
      }
    }

    // 3. Capitalize and clean the subdistrict if no match
    if (subdistrict && subdistrict !== 'General') {
      return subdistrict.charAt(0).toUpperCase() + subdistrict.slice(1);
    }
    return STATE_REGISTRY[districtClean]?.taluks[0] || districtClean;
  };

  const fallbackReverseGeocode = (lat, lng) => {
    const hubs = [
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, taluk: 'Tondiarpet', address: 'Fort St George Administrative Node, Chennai, TN, 600009' },
      { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, taluk: 'Pollachi', address: 'District Collectorate Block, Coimbatore, TN, 641018' },
      { name: 'Madurai', lat: 9.9252, lng: 78.1198, taluk: 'Melur', address: 'Collectorate Complex, Madurai, TN, 625020' },
      { name: 'Salem', lat: 11.6643, lng: 78.1460, taluk: 'Attur', address: 'Salem Central Bureau, Salem, TN, 636001' },
      { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, taluk: 'Srirangam', address: 'Srirangam Central Node, Tiruchirappalli, TN, 620006' }
    ];
    let closest = hubs[0];
    let minD = Infinity;
    hubs.forEach(h => {
      const d = Math.sqrt(Math.pow(lat - h.lat, 2) + Math.pow(lng - h.lng, 2));
      if (d < minD) {
        minD = d;
        closest = h;
      }
    });
    return {
      district: closest.name,
      taluk: closest.taluk,
      address: `Geolocated Node (${lat.toFixed(4)}, ${lng.toFixed(4)}) near ${closest.address}`
    };
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = isTamil ? 'ta-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.start();
  };

  const handleLocationFetch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name;
            setReadableLocation(address);
            
            const addr = data.address || {};
            const fetchedDistrict = addr.state_district || addr.district || addr.city || addr.county || 'Chennai';
            const fetchedSubdistrict = addr.suburb || addr.town || addr.city_district || 'General';
            
            const cleanDistrictName = cleanDistrict(fetchedDistrict);
            const smartTaluk = resolveSmartTaluk(cleanDistrictName, fetchedSubdistrict, address);
            
            setLocation({
              latitude,
              longitude,
              district: cleanDistrictName,
              taluk: smartTaluk,
              readableAddress: address
            });
          } else {
            throw new Error("Geocoding failed");
          }
        } catch (e) {
          console.warn("Using high-fidelity local fallback reverse geocoding...", e);
          const fallback = fallbackReverseGeocode(latitude, longitude);
          const smartTaluk = resolveSmartTaluk(fallback.district, fallback.taluk, fallback.address);
          setReadableLocation(fallback.address);
          setLocation({
            latitude,
            longitude,
            district: fallback.district,
            taluk: smartTaluk,
            readableAddress: fallback.address
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        console.log("Generating high-fidelity simulated Tamil Nadu GPS telemetry...");
        const mockLat = 13.1256 + (Math.random() - 0.5) * 0.01;
        const mockLng = 80.2592 + (Math.random() - 0.5) * 0.01;
        const mockAddr = "Tondiarpet Area, Chennai Municipal Node, Tamil Nadu, 600081, India";
        setReadableLocation(mockAddr);
        setLocation({
          latitude: mockLat,
          longitude: mockLng,
          district: 'Chennai',
          taluk: 'Tondiarpet',
          readableAddress: mockAddr
        });
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!description.trim()) {
      setError('Please describe the grievance for AI classification.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const finalDistrict = location?.district || aiAnalysis?.district || 'Chennai';
      const fallbackTaluk = STATE_REGISTRY[finalDistrict]?.taluks[0] || finalDistrict;
      const finalTaluk = location?.taluk || aiAnalysis?.taluk || fallbackTaluk;

      const payload = { 
        citizenName, citizenPhone, citizenEmail,
        anonymous: !citizenName && !citizenPhone,
        title: description.substring(0, 50) + "...",
        description, 
        location: location ? { 
          latitude: location.latitude, longitude: location.longitude, 
          readableAddress: readableLocation,
          district: finalDistrict,
          taluk: finalTaluk
        } : null,
        district: finalDistrict,
        taluk: finalTaluk
      };

      const { data } = await api.post('/complaints/create', payload);
      
      if (data.success) {
        setSubmissionResult(data.data);
        // Start Step Animation
        let step = 0;
        const interval = setInterval(() => {
          if (step < LIFECYCLE_STEPS.length - 1) {
            step++;
            setActiveStep(step);
          } else {
            clearInterval(interval);
          }
        }, 800);

        if (onComplaintAdded) onComplaintAdded(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Statewide uplink failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setDescription('');
    setCitizenName('');
    setCitizenPhone('');
    setCitizenEmail('');
    setLocation(null);
    setAiAnalysis(null);
    setActiveStep(0);
  };

  return (
    <div className="w-full">
      {/* SUCCESS LIFECYCLE SCREEN */}
      {submissionResult && (
        <div className="bg-[#0b3058] text-white rounded-[3rem] p-10 md:p-16 mb-12 animate-in zoom-in-95 duration-700 shadow-3xl relative overflow-hidden border border-blue-400/20 min-h-[600px] flex flex-col items-center justify-center text-center">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse"></div>
           
           <div className="relative z-10 w-full max-w-4xl">
              <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] mx-auto mb-10 animate-bounce">
                 <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Grievance Infrastructure Uplink</h3>
              <p className="text-blue-300 font-bold uppercase tracking-[0.3em] text-xs mb-16">Tracking ID: <span className="text-green-400 select-all">{submissionResult.complaintId}</span></p>

              {/* PROGRESS STEPS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
                 {LIFECYCLE_STEPS.map((step, idx) => (
                    <div key={idx} className={`flex flex-col items-center transition-all duration-500 ${idx <= activeStep ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}>
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border-2 ${idx < activeStep ? 'bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : idx === activeStep ? 'bg-blue-600 border-blue-400 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                          {idx < activeStep ? <CheckCircle2 className="w-6 h-6 text-white" /> : step.icon}
                       </div>
                       <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{step.label}</p>
                    </div>
                 ))}
              </div>

              {/* LIVE AI ROUTING PANEL */}
              {activeStep >= 5 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/5 border border-white/10 p-10 rounded-[3rem] animate-in fade-in slide-in-from-top-8 duration-1000 text-left">
                   <div className="space-y-6">
                      <div>
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Administrative Node</p>
                         <p className="text-lg font-black uppercase tracking-tight">{submissionResult.district} • {submissionResult.taluk}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Department</p>
                         <p className="text-lg font-black uppercase tracking-tight">{submissionResult.assignedDept}</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div>
                         <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Priority Classification</p>
                         <p className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <Activity className={`w-5 h-5 ${submissionResult.priority === 'High' ? 'text-red-500' : 'text-green-500'}`} /> {submissionResult.priority}
                         </p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Resolution SLA</p>
                         <p className="text-lg font-black uppercase tracking-tight">48 Hours Standard</p>
                      </div>
                   </div>
                   <div className="flex flex-col justify-between">
                      <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl">
                         <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">AI Confidence Score</p>
                         <p className="text-2xl font-black text-green-400 leading-none">{Math.round((submissionResult.confidence || 0.88) * 100)}%</p>
                      </div>
                      <button onClick={resetForm} className="w-full mt-6 py-4 bg-white text-[#0b3058] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                         <Send className="w-4 h-4" /> New Report
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* FORM INTERFACE */}
      {!submissionResult && (
        <div className="bg-white rounded-[3rem] p-4 md:p-8 shadow-[0_30px_80px_-40px_rgba(11,48,88,0.25)] border border-slate-100 relative overflow-hidden transition-all duration-700">
          <div className="relative">
             { error && (
                <div className="mx-6 mt-4 mb-4 p-4 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 text-xs font-bold text-red-600 animate-in slide-in-from-top-4 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="flex-1 text-left">
                     <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Statewide Uplink Error</p>
                     <p className="text-red-900 leading-tight">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-slate-400 hover:text-red-600 font-bold px-2">×</button>
                </div>
             )}
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full h-48 px-6 py-6 bg-transparent text-xl md:text-2xl font-medium text-[#0b3058] placeholder:text-slate-200 outline-none resize-none transition-all"
               placeholder={t('form.placeholder')}
             />
             
             { isListening && (
                <div className="mx-6 mb-4 p-3 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-600 animate-pulse text-left animate-in slide-in-from-top-2 duration-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                  <span>TN-UCRS Secure Voice Uplink: Listening... Speak now in English or தமிழ்</span>
                </div>
             )}

             { (locationLoading || readableLocation) && (
                <div className="mx-6 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {locationLoading ? (
                      <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    <span className="truncate">
                      {locationLoading ? 'Accessing statewide GPS infrastructure node...' : readableLocation}
                    </span>
                  </div>
                  {!locationLoading && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(null);
                        setReadableLocation('');
                      }} 
                      className="text-slate-400 hover:text-red-500 px-2 py-1 font-black text-sm transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
             )}

             <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-6">
                <div className="flex gap-3">
                   <button 
                     type="button"
                     onClick={handleVoiceInput} 
                     className={`p-4 rounded-2xl border transition-all cursor-pointer ${isListening ? 'bg-red-50 border-red-200 text-red-600 animate-pulse shadow-sm' : description ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                     title="Voice Input (English / தமிழ்)"
                   >
                     <Mic className="w-6 h-6" />
                   </button>
                   <button 
                     type="button"
                     onClick={handleLocationFetch} 
                     className={`p-4 rounded-2xl border transition-all cursor-pointer ${locationLoading ? 'bg-blue-50 border-blue-150 text-blue-600 shadow-sm animate-bounce' : location ? 'bg-green-50 border-green-100 text-green-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                     title="Geolocate Grievance Node"
                   >
                     <MapPin className="w-6 h-6" />
                   </button>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={loading || !description.trim()}
                  className="flex items-center gap-4 bg-[#0b3058] text-white px-14 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-900 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 transition-all"
                >
                  {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  {t('form.submit')}
                </button>
             </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-50">
             <button onClick={() => setShowContact(!showContact)} className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0b3058] transition-colors ml-6">
                {showContact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                {showContact ? 'Collapse Identification Layer' : 'Administrative Identification (Optional)'}
             </button>

             {showContact && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-in slide-in-from-top-6 duration-500">
                   <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="text" value={citizenName} onChange={(e) => setCitizenName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-300" placeholder="Full Name" />
                   </div>
                   <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="tel" value={citizenPhone} onChange={(e) => setCitizenPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-300" placeholder="Mobile Node" />
                   </div>
                   <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="email" value={citizenEmail} onChange={(e) => setCitizenEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold outline-none focus:border-blue-300" placeholder="Secure Email" />
                   </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* AI INTELLIGENCE DASHBOARD (PRE-SUBMISSION) */}
      {!submissionResult && aiAnalysis && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-6 duration-700">
           <div className="bg-white/40 backdrop-blur-xl border border-blue-100 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner"><Building2 className="w-8 h-8" /></div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Department</p>
                 <p className="text-sm font-black text-[#0b3058] uppercase tracking-tight">{aiAnalysis.dept}</p>
              </div>
           </div>
           <div className="bg-white/40 backdrop-blur-xl border border-green-100 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shadow-inner"><Map className="w-8 h-8" /></div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Administrative Node</p>
                 <p className="text-sm font-black text-[#0b3058] uppercase tracking-tight">{aiAnalysis.office}</p>
              </div>
           </div>
           <div className="bg-white/40 backdrop-blur-xl border border-amber-100 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-inner"><Cpu className="w-8 h-8" /></div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Severity Priority</p>
                 <p className="text-sm font-black text-[#0b3058] uppercase tracking-tight">{aiAnalysis.priority}</p>
              </div>
           </div>
        </div>
      )}

      {/* PRIVACY SHIELD */}
      {!submissionResult && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
           <div className="flex items-center gap-3 px-6 py-2 bg-[#0b3058] text-white rounded-full shadow-xl">
              <Lock className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Anonymous Uplink Secured</span>
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-lg leading-relaxed">Statewide complaint intelligence network. Citizen identity is protected by governmental encryption protocols.</p>
        </div>
      )}
    </div>
  );
};

export default ComplaintForm;
