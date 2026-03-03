import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  BrainCircuit, 
  Wallet, 
  UploadCloud, 
  Loader2, 
  CheckCircle2 
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');

  const RollingBanner = () => {
    const bannerItems = [
      "圷 PRE-ALPHA BUILD",
      "hisab.ai - Smarter Finances",
      "投 Live Analytics hooking to MongoDB",
      "hisab.ai - Beautifully Engineered",
    ];
    const content = Array(6).fill(bannerItems).flat();

    return (
      <div className="fixed top-0 left-0 w-full z-50 overflow-hidden bg-white/[0.01] backdrop-blur-md border-b border-white/10 py-3 selection:bg-purple-500">
        <style>{`
          @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-scroll { animation: scroll 40s linear infinite; white-space: nowrap; display: inline-block; }
        `}</style>
        <div className="animate-scroll text-sm font-mono text-gray-400">
          {content.map((item, index) => (
            <span key={index} className="mx-10 inline-flex items-center gap-2">
              {item.includes("hisab.ai") ? (
                <span className="font-bold text-white tracking-tighter flex items-center gap-1.5 inline-flex scale-90">
                  <div className="w-6 h-6 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                    <span className="text-[#0a0a0a] font-black text-xs">h</span>
                  </div>
                  hisab.ai
                </span>
              ) : <span className={item.startsWith("圷") ? "text-red-400" : ""}>{item}</span>}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
      if (res.ok) setUploadStatus('success');
    } catch (err) {
      setUploadStatus('idle');
      alert("Backend connection failed!");
    }
  };

  return (
    <React.Fragment>
      <RollingBanner />
      <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden pt-16 font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-500 rounded-full blur-[128px] opacity-10 animate-pulse pointer-events-none"></div>
        
        <header className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl mx-auto leading-tight">
            Smarter finances, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-500 to-purple-500">beautifully engineered.</span>
          </h1>
          
          <div className="max-w-xl mx-auto mb-12 p-8 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl">
            <div className="flex flex-col items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${uploadStatus === 'success' ? 'bg-lime-400/10 text-lime-400' : 'bg-white/5 text-gray-400'}`}>
                {uploadStatus === 'idle' && <UploadCloud size={40} />}
                {uploadStatus === 'uploading' && <Loader2 size={40} className="animate-spin text-purple-400" />}
                {uploadStatus === 'success' && <CheckCircle2 size={40} className="animate-pulse" />}
              </div>
              <input type="file" id="fUpload" onChange={handleFileChange} className="hidden" />
              <div className="flex gap-3 w-full">
                <label htmlFor="fUpload" className="flex-1 bg-white/5 border border-white/10 px-5 py-3 rounded-full text-xs cursor-pointer truncate">
                  {selectedFile ? selectedFile.name : 'Select Data File'}
                </label>
                <button onClick={handleUpload} disabled={!selectedFile || uploadStatus !== 'idle'} className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs disabled:opacity-20">Sync Data</button>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/dashboard')} disabled={uploadStatus !== 'success'} className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${uploadStatus === 'success' ? 'bg-lime-400 text-black hover:scale-105' : 'bg-white/5 text-gray-700'}`}>
            Launch Dashboard <ArrowRight size={20} />
          </button>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 text-left">
            <FeatureCard icon={<BrainCircuit />} title="AI Forecasting" desc="Machine learning models predict runway with high accuracy." color="text-lime-400" />
            <FeatureCard icon={<BarChart3 />} title="Live Analytics" desc="Direct hooks into your MongoDB cluster for real-time visibility." color="text-purple-400" />
            <FeatureCard icon={<Wallet />} title="Smart Asset Mgmt" desc="Consolidate all transaction streams into one clean interface." color="text-emerald-400" />
          </div>
        </header>
      </div>
    </React.Fragment>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}