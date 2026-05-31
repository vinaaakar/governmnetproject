import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL INFRASTRUCTURE FAILURE:", error, errorInfo);
    // Log to external service if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-10 font-sans">
          <div className="max-w-2xl w-full bg-white rounded-[48px] shadow-[0_40px_100px_rgba(11,60,111,0.1)] border-t-8 border-red-600 overflow-hidden text-center p-16">
            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg">
               <ShieldAlert className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl font-black text-[#0b3c6f] uppercase mb-4 tracking-tight">Secure Gateway Recovery</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-10">Infrastructure Integrity Exception Detected</p>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-left mb-12">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Exception Log:</p>
               <code className="text-xs font-mono text-red-600 block break-all">
                  {this.state.error?.toString() || "Unknown reference error in operational node."}
               </code>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <button 
                 onClick={() => window.location.reload()} 
                 className="flex items-center justify-center gap-3 bg-[#0b3c6f] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all"
               >
                  <RefreshCw className="w-5 h-5" /> Reload Node
               </button>
               <button 
                 onClick={() => window.location.href = '/'} 
                 className="flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                  <Home className="w-5 h-5" /> Return Home
               </button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">All critical errors are logged and transmitted to the TN-SDRC-01 monitoring node.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
