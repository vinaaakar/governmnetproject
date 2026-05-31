import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

// Modular Components
import { HeaderBar, StepProgress, SecureGatewayRecovery } from '../components/officer/PortalCommon';
import { DepartmentSelector, DistrictSelector } from '../components/officer/PortalSelectors';
import { TalukSelector, OfficeSelector, SecureLoginForm } from '../components/officer/PortalFinalSteps';
import { TelemetrySidebar } from '../components/officer/TelemetrySidebar';
import { fetchRegionalOffices } from '../utils/officeRegistry';
import { TAMIL_NADU_DISTRICTS } from '../utils/districtRegistry';
import { STATE_REGISTRY } from '../data/stateRegistry';
import { calculateNodeTelemetry } from '../utils/telemetryEngine';
import { STATIC_DEPARTMENTS, TALUK_FALLBACK_DATA } from '../constants/officerPortal';

const OfficerLogin = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isTamil = i18n.language === 'ta';

  // Navigation & UI State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [depts, setDepts] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);

  // Authentication Fields
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  // Authentication Infrastructure State
  const [authStage, setAuthStage] = useState("");
  const [authProgress, setAuthProgress] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);

  const authStages = [
    "SECURE UPLINK VERIFIED",
    "DISTRICT REGISTRY AUTHENTICATED",
    "NODE SYNCHRONIZATION COMPLETE",
    "CLEARANCE LEVEL VALIDATED",
    "SESSION ENCRYPTION ACTIVE",
    "ADMINISTRATIVE ACCESS GRANTED"
  ];

  const steps = [
    { id: 1, label: 'Department' },
    { id: 2, label: 'District Hub' },
    { id: 3, label: 'Regional Node' },
    { id: 4, label: 'Office Unit' },
    { id: 5, label: 'Credentials' }
  ];

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    const list = TAMIL_NADU_DISTRICTS;
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.code && d.code.toLowerCase().includes(q)) ||
      (d.cluster && d.cluster.toLowerCase().includes(q))
    );
  }, [districts, searchQuery]);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes] = await Promise.all([
          api.get('/admin/departments')
        ]);
        setDepts(deptRes.data);
      } catch (err) {
        console.error('Initial Fetch Error:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch Taluks Logic
  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    const fetchTaluks = async () => {
      try {
        let data = [];
        // First try the central registry (Single Source of Truth)
        const registryData = STATE_REGISTRY[selectedDistrict.name];
        if (registryData) {
          data = registryData.taluks.map((name, idx) => {
            const telemetry = calculateNodeTelemetry(selectedDistrict.name, name, 'Revenue Department');
            return {
              _id: `reg-${selectedDistrict.name}-${name}`,
              name,
              code: `${selectedDistrict.code || selectedDistrict.name.substring(0,3).toUpperCase()}-${name.substring(0,3).toUpperCase()}`,
              villagesCount: telemetry.panchayats,
              officesCount: telemetry.regionalOffices,
              status: 'ACTIVE'
            };
          });
        }
        
        // Only if registry is missing (fallback)
        if (data.length === 0) {
          const fallback = TALUK_FALLBACK_DATA || {};
          data = fallback[selectedDistrict.name] || [];
        }

        setTaluks(data);
      } catch (err) {
        setTaluks([]);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchTaluks();
  }, [selectedDistrict]);

  // Fetch Offices Logic (Layered Discovery)
  useEffect(() => {
    if (selectedDept && selectedDistrict && selectedTaluk) {
      setLoading(true);
      
      const discoverOffices = async () => {
        const regionalNodes = await fetchRegionalOffices(selectedDept, selectedDistrict, selectedTaluk);
        setOffices(regionalNodes);
        setLoading(false);
      };

      discoverOffices();
    }
  }, [selectedDept, selectedDistrict, selectedTaluk]);

  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    if (!email || !employeeId || !password) { 
      setAuthError('CRITICAL: All administrative credentials required for node uplink.'); 
      return; 
    }
    
    setAuthError('');
    setIsAuthenticating(true);
    setAuthSuccess(false);
    setAuthProgress(0);
    
    try {
      // Stage 1: Uplink
      setAuthStage(authStages[0]);
      setAuthProgress(15);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 2: Registry
      setAuthStage(authStages[1]);
      setAuthProgress(35);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 3: Node Sync (API Call)
      setAuthStage(authStages[2]);
      setAuthProgress(55);
      
      const response = await api.post('/auth/officer-login', { 
        officialEmail: email, 
        employeeId, 
        password, 
        officeId: selectedOffice._id 
      });

      if (response.data?.success) {
        // Stage 4: Clearance
        setAuthStage(authStages[3]);
        setAuthProgress(75);
        await new Promise(resolve => setTimeout(resolve, 900));

        // Stage 5: Encryption
        setAuthStage(authStages[4]);
        setAuthProgress(95);
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        // Stage 6: Success
        setAuthStage(authStages[5]);
        setAuthProgress(100);
        setAuthSuccess(true);

        const { token, refreshToken, officer } = response.data.data;
        
        // Use the new session security engine
        const { establishSecureSession } = await import('../utils/sessionSecurityEngine');
        establishSecureSession({ token, refreshToken, officer });

        console.log("SECURE ADMINISTRATIVE SESSION ESTABLISHED:", officer.fullName);
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        navigate('/officer-dashboard', { state: { officer } });
      } else {
        throw new Error(response.data?.message || 'REGIONAL NODE REJECTED HANDSHAKE');
      }
    } catch (err) {
      setIsAuthenticating(false);
      setAuthProgress(0);
      setAuthStage("");
      const msg = err.response?.data?.message || err.message || 'TN-SDRC regional node unreachable.';
      setAuthError(msg);
      console.error("GATEWAY AUTH FAILURE:", msg);
    }
  };

  const prevStep = () => {
    if (step === 2) setSelectedDept(null);
    if (step === 3) setSelectedDistrict(null);
    if (step === 4) setSelectedTaluk(null);
    if (step === 5) setSelectedOffice(null);
    setStep(step - 1);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 flex flex-col">
      <HeaderBar />
      <main className="flex-1 px-10 py-14 max-w-[1920px] mx-auto w-full flex flex-col lg:flex-row gap-14">
        <div className="flex-1 min-w-0">
          <StepProgress currentStep={step} steps={steps} />
          {step > 1 && (
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <button onClick={prevStep} className="flex items-center gap-4 text-slate-400 hover:text-[#0b3c6f] font-black uppercase text-[10px] tracking-widest transition-all group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-all" /> Return to Previous Layer
              </button>
              
              <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                <div className="flex flex-col">
                   <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Statewide Demo Auth Policy Active</p>
                   <p className="text-[10px] font-bold text-amber-900">Universal Passcode: <span className="font-black text-amber-600">admin1234$</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="min-h-[600px]">
            {error ? (
              <SecureGatewayRecovery error={error} onRetry={() => setError('')} />
            ) : (
              <React.Fragment>
                {step === 1 && (
                  <DepartmentSelector 
                    departments={depts.length > 0 ? depts : (STATIC_DEPARTMENTS || [])} 
                    onSelect={(d) => { setSelectedDept(d); setStep(2); }} 
                  />
                )}
                {step === 2 && <DistrictSelector districts={filteredDistricts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelect={(d) => { setSelectedDistrict(d); setStep(3); }} />}
                {step === 3 && <TalukSelector taluks={taluks} loading={loading} onSelect={(t) => { setSelectedTaluk(t); setStep(4); }} />}
                {step === 4 && <OfficeSelector offices={offices} loading={loading} selectedDistrict={selectedDistrict} selectedTaluk={selectedTaluk} selectedDept={selectedDept} onSelect={(o) => { setSelectedOffice(o); setStep(5); }} onBack={() => setStep(3)} />}
                {step === 5 && (
                  <SecureLoginForm 
                    email={email} 
                    setEmail={setEmail} 
                    employeeId={employeeId} 
                    setEmployeeId={setEmployeeId} 
                    password={password} 
                    setPassword={setPassword} 
                    onSubmit={handleAuthenticate} 
                    
                    isAuthenticating={isAuthenticating}
                    authStage={authStage}
                    authProgress={authProgress}
                    authError={authError}
                    authSuccess={authSuccess}

                    selectedDept={selectedDept} 
                    selectedOffice={selectedOffice} 
                    selectedDistrict={selectedDistrict} 
                    selectedTaluk={selectedTaluk} 
                  />
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        <TelemetrySidebar />
      </main>
    </div>
  );
};

export default OfficerLogin;
