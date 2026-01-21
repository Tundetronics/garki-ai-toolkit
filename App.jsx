 import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Settings, Users, GraduationCap, 
  Briefcase, Heart, ShieldCheck, Zap, 
  ArrowRight, ArrowLeft, Volume2, Image as ImageIcon, 
  FileText, QrCode, Download, CheckCircle2, 
  AlertTriangle, X, Layout, Compass, Monitor, ShieldAlert
} from 'lucide-react';

// API key is provided by the execution environment at runtime
const apiKey = ""; 

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState({ title: "", content: "", image: null });
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  // --- MOBILE & SCALING ENGINE ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      const s = Math.min(window.innerWidth / 1340, window.innerHeight / 850, 1);
      setScale(s);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- NARRATION SANITIZER (Voice-First Protocol) ---
  const sanitizeForVoice = (text) => {
    if (!text) return "";
    return text
      .replace(/[*#_~`\[\]()<>]/g, '') 
      .replace(/\n\n/g, '. ') 
      .replace(/\n/g, '. '); 
  };

  // --- ✨ AI ORCHESTRATION WITH DIAGNOSTICS ---
  const callAI = async (prompt, sys, mode = 'text') => {
    setIsProcessing(true);
    const voiceOptimizedSys = sys + " IMPORTANT: Use plain human-friendly text ONLY. Do not use markdown symbols (no asterisks, no hashtags).";
    
    const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    const payload = mode === 'image' 
      ? { instances: { prompt }, parameters: { sampleCount: 1 } }
      : { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: voiceOptimizedSys }] } };

    // Implementation of exponential backoff for API calls
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i <= delays.length; i++) {
      try {
        const r = await fetch(mode === 'image' ? imageUrl : textUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) 
        });

        if (r.status === 403) return "DIAGNOSTIC ERROR: Your API Key is invalid or has expired permissions.";
        if (!r.ok) throw new Error("API request failed");
        
        const d = await r.json();
        if (mode === 'image') return `data:image/png;base64,${d.predictions[0].bytesBase64Encoded}`;
        return d.candidates[0].content.parts[0].text;
      } catch (e) {
        if (i === delays.length) return "ORCHESTRATION FAILED: Check internet connection or API Quota limits.";
        await new Promise(res => setTimeout(res, delays[i]));
      } finally {
        if (i === delays.length || !isProcessing) setIsProcessing(false);
      }
    }
  };

  const runAction = async (type, val) => {
    if (!val) return;
    let res, sys, title;
    if (type === 'student') {
        sys = "Expert academic counselor for GSS Garki students. Create an 8-day intensive study plan.";
        title = "Student Success Blueprint";
        res = await callAI(`Plan for ${val}`, sys);
    } else if (type === 'teacher') {
        sys = "Expert educator assistant. Draft a WAEC-standard lesson plan.";
        title = "Educator Strategy";
        res = await callAI(`Topic: ${val}`, sys);
    } else if (type === 'principal') {
        sys = "School management strategist. Optimizing GSS Garki resources.";
        title = "Leadership Insight";
        res = await callAI(`Optimization for: ${val}`, sys);
    } else if (type === 'visualize') {
        const img = await callAI(`Afro-futuristic high-tech ${val} in Abuja Nigeria. Cinematic.`, "", 'image');
        if (typeof img === 'string' && img.startsWith("DIAGNOSTIC")) {
            setAiResult({ title: "System Error", content: img, image: null });
        } else {
            setAiResult({ title: "Future Visualized", content: `Digital twin for: ${val}`, image: img });
        }
        setShowModal(true); return;
    }
    setAiResult({ title, content: res, image: null });
    setShowModal(true);
  };

  // --- FULL 13-SLIDE DECK ---
  const slides = [
    // 00: HERO
    <div className="flex flex-col items-center justify-center text-center space-y-8 h-full">
      <div className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">Vocational Service Month 2026</div>
      <h1 className="text-6xl lg:text-[130px] font-black text-white leading-none tracking-tighter uppercase">AI & DATA <br/><span className="text-yellow-500 italic">ANALYSIS</span></h1>
      <p className="text-xl lg:text-3xl text-slate-400 font-light">Orchestrating Excellence at <span className="text-white font-bold underline decoration-blue-600">GSS Garki</span></p>
      <div className="pt-12"><p className="text-2xl font-bold uppercase tracking-widest text-white">Babatunde Adesina</p><p className="text-blue-400 font-bold text-xs tracking-[0.4em]">THE AGENTIC ORCHESTRATOR</p></div>
    </div>,

    // 01: ROTARY BRANDING
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="space-y-8 text-left">
        <h2 className="text-4xl lg:text-7xl font-black text-yellow-500 uppercase leading-none tracking-tighter">The <br/><span className="text-white">HighRise</span> Force</h2>
        <p className="text-xl lg:text-2xl text-slate-300">Facilitated by the <strong>Rotary Club of Abuja HighRise</strong>. Service Above Self through technology.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 text-white"><Heart className="text-yellow-500 mb-2"/><p className="font-bold text-sm">Service</p></div>
          <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 text-white"><ShieldCheck className="text-yellow-500 mb-2"/><p className="font-bold text-sm">Ethics</p></div>
        </div>
      </div>
      <div className="rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1280" className="w-full h-full object-cover" alt="Service" />
      </div>
    </div>,

    // 02: DATA DETECTIVE
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=1280" className="w-full h-full object-cover" alt="Data" />
      </div>
      <div className="space-y-8 text-left">
        <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase leading-none border-l-8 border-blue-600 pl-6">Data Detective</h2>
        <p className="text-xl lg:text-2xl text-slate-300">Data is the oil of Garki. Analysis is the engine that finds the Truth in the noise.</p>
      </div>
    </div>,

    // 03: THE AI BRAIN
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="space-y-8 text-left">
        <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase leading-none border-l-8 border-blue-600 pl-6">The Digital Brain</h2>
        <p className="text-xl lg:text-2xl text-slate-300">AI mimics logic to process facts. It doesn't just think; it <span className="text-white font-bold">Orchestrates</span>.</p>
      </div>
      <div className="rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1280" className="w-full h-full object-cover" alt="AI" />
      </div>
    </div>,

    // 04: THE GAME
    <div className="flex flex-col justify-center space-y-8 h-full">
      <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase">Interactive: Pattern Logic</h2>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <table className="w-full text-left">
          <thead className="bg-blue-900/50 text-white">
            <tr><th className="p-6 text-xs uppercase font-black">Student</th><th className="p-6 text-xs uppercase font-black">Score</th><th className="p-6 text-xs uppercase font-black">Access</th><th className="p-6 text-xs uppercase font-black">AI Prediction</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr><td className="p-6">Student X</td><td className="p-6">295</td><td className="p-6 text-green-400">Yes</td><td className="p-6 font-bold text-green-400">PASS</td></tr>
            <tr className="bg-white/5"><td className="p-6">Student Y</td><td className="p-6">110</td><td className="p-6 text-red-400">No</td><td className="p-6 font-bold text-red-400">INTERVENE</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-center text-slate-400 italic">"Access + Effort = Outcome."</p>
    </div>,

    // 05: CAREERS 2030
    <div className="flex flex-col justify-center space-y-12 h-full">
       <h2 className="text-4xl lg:text-7xl font-black text-yellow-500 uppercase text-center">Careers 2030</h2>
       <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-blue-600/10 p-10 rounded-[40px] border border-blue-500/20 text-center">
             <p className="text-7xl font-black text-white">+95%</p>
             <p className="text-slate-400 uppercase font-bold text-sm tracking-widest mt-2">AI Roles</p>
          </div>
          <div className="bg-red-500/10 p-10 rounded-[40px] border border-red-500/20 text-center">
             <p className="text-7xl font-black text-white">-12%</p>
             <p className="text-slate-400 uppercase font-bold text-sm tracking-widest mt-2">Routine Work</p>
          </div>
       </div>
    </div>,

    // 06: ETHICS
    <div className="grid lg:grid-cols-3 gap-6 h-full items-center">
       <div className="bg-white/5 p-8 rounded-[40px] text-center space-y-4"><Zap className="text-yellow-500 mx-auto" size={48}/><h3 className="text-2xl font-black text-white uppercase">Truth</h3><p className="text-slate-400 text-sm">Eliminate Bias.</p></div>
       <div className="bg-white/5 p-8 rounded-[40px] text-center space-y-4"><Users className="text-blue-400 mx-auto" size={48}/><h3 className="text-2xl font-black text-white uppercase">Fairness</h3><p className="text-slate-400 text-sm">Build Goodwill.</p></div>
       <div className="bg-white/5 p-8 rounded-[40px] text-center space-y-4"><Heart className="text-yellow-500 mx-auto" size={48}/><h3 className="text-2xl font-black text-white uppercase">Benefit</h3><p className="text-slate-400 text-sm">GSS Garki First.</p></div>
    </div>,

    // 07: STUDENT GIFT
    <div className="bg-slate-800/40 p-10 rounded-[50px] border border-white/10 space-y-8 flex flex-col justify-center h-full">
      <div className="flex items-center gap-6"><GraduationCap className="text-yellow-500" size={60}/> <h3 className="text-4xl font-black uppercase text-white">Student Navigator</h3></div>
      <p className="text-2xl text-slate-300">Draft your 8-day academic study plan.</p>
      <input id="stu-in" className="w-full bg-black/50 p-6 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500 text-xl" placeholder="e.g. Maths, Biology" />
      <button onClick={() => runAction('student', document.getElementById('stu-in').value)} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-bold uppercase text-xl transition-all">Orchestrate</button>
    </div>,

    // 08: TEACHER GIFT
    <div className="bg-slate-800/40 p-10 rounded-[50px] border border-white/10 space-y-8 flex flex-col justify-center h-full">
      <div className="flex items-center gap-6"><Briefcase className="text-blue-400" size={60}/> <h3 className="text-4xl font-black uppercase text-white">Educator Pro</h3></div>
      <p className="text-2xl text-slate-300">Rapid lesson plan orchestration for teachers.</p>
      <input id="tea-in" className="w-full bg-black/50 p-6 rounded-2xl text-white outline-none border border-white/10 focus:border-blue-500 text-xl" placeholder="e.g. Photosynthesis" />
      <button onClick={() => runAction('teacher', document.getElementById('tea-in').value)} className="w-full bg-slate-700 hover:bg-slate-600 py-6 rounded-2xl font-bold uppercase text-xl transition-all">Draft Strategy</button>
    </div>,

    // 09: PRINCIPAL/ROTARY
    <div className="grid lg:grid-cols-2 gap-8 h-full items-center">
      <div className="bg-white/5 p-8 rounded-[40px] space-y-6 text-left border border-white/5">
        <Settings className="text-yellow-500"/><h3 className="text-2xl font-black text-white uppercase">Principal Dash</h3>
        <input id="pri-in" className="w-full bg-black p-4 rounded-xl border border-white/10" placeholder="e.g. Attendance"/>
        <button onClick={() => runAction('principal', document.getElementById('pri-in').value)} className="w-full bg-blue-900 py-3 rounded-xl font-bold uppercase">Optimize</button>
      </div>
      <div className="bg-white/5 p-8 rounded-[40px] space-y-6 text-left border border-white/5">
        <Compass className="text-blue-400"/><h3 className="text-2xl font-black text-white uppercase">Impact Audit</h3>
        <input id="rot-in" className="w-full bg-black p-4 rounded-xl border border-white/10" placeholder="e.g. Water project"/>
        <button onClick={() => runAction('rotary', document.getElementById('rot-in').value)} className="w-full bg-blue-600 py-3 rounded-xl font-bold uppercase">Audit</button>
      </div>
    </div>,

    // 10: MOTIVATION
    <div className="flex flex-col items-center justify-center text-center space-y-8 h-full">
       <h2 className="text-7xl lg:text-[140px] font-black text-white leading-[0.8] uppercase tracking-tighter">ORCHESTRATE <br/><span className="text-yellow-500 italic">DESTINY</span></h2>
       <p className="text-3xl text-slate-400 font-light max-w-4xl">Garki is not your limit. It is your <span className="text-white font-bold underline decoration-blue-600">Launchpad</span>.</p>
    </div>,

    // 11: VISUALIZATION
    <div className="flex flex-col items-center justify-center text-center space-y-12 h-full">
       <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase">The Challenge</h2>
       <div className="bg-white/5 border-4 border-dashed border-blue-500/30 p-12 max-w-3xl rounded-[50px] w-full">
          <p className="text-2xl mb-8">What problem should we solve next?</p>
          <div className="flex gap-4">
             <input id="vis-in" className="flex-1 bg-black/50 p-4 rounded-xl text-white border border-white/10" placeholder="e.g. Solar street lights" />
             <button onClick={() => runAction('visualize', document.getElementById('vis-in').value)} className="bg-purple-600 px-8 rounded-xl font-bold text-white transition-all">Visualize</button>
          </div>
       </div>
    </div>,

    // 12: ACCESS
    <div className="flex flex-col items-center justify-center space-y-12 h-full text-center">
      <h2 className="text-5xl lg:text-8xl font-black text-white uppercase tracking-tighter">Final Access</h2>
      <div className="flex items-center gap-10 bg-white/5 p-12 rounded-[60px] border-2 border-yellow-500/20 shadow-2xl">
         <div className="bg-white p-4 rounded-3xl"><QrCode size={180} className="text-black" /></div>
         <div className="text-left space-y-2">
            <p className="text-4xl font-black uppercase text-white tracking-tighter">GSS Toolkit</p>
            <p className="text-lg text-yellow-500 font-bold uppercase tracking-widest">bit.ly/GarkiHighRiseAI</p>
            <button onClick={() => window.print()} className="mt-4 bg-white/10 px-6 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 text-white"><Download size={14}/> Handout</button>
         </div>
      </div>
      <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.5em] animate-pulse">Service Above Self</p>
    </div>
  ];

  const totalSlides = slides.length;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="relative bg-slate-950 text-slate-200 w-screen h-screen flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* 🚢 HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-8 no-print">
         <div className="flex items-center gap-3"><BrainCircuit className="text-blue-500" /><span className="font-black text-sm tracking-widest uppercase text-white">GSS Garki Suite</span></div>
         <div className="flex gap-2">
            {[...Array(totalSlides)].map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-10 bg-yellow-500' : 'w-2 bg-slate-700'}`}></button>
            ))}
         </div>
      </nav>

      {/* 📱 VIEWPORT */}
      <main className={`flex-1 flex items-center justify-center p-6 lg:p-20 pb-40 no-print ${isMobile ? 'overflow-y-auto pt-24' : ''}`}>
        <div style={{ transform: isMobile ? 'none' : `scale(${scale})` }} className="w-full max-w-7xl h-full flex items-center justify-center transition-all duration-700">
           {slides[currentSlide] || slides[0]}
        </div>
      </main>

      {/* ⚓ PERSISTENT FOOTER BRANDING */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-blue-900 border-t-8 border-yellow-500 z-50 flex items-center justify-between px-6 lg:px-20 no-print shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 lg:h-12 lg:w-12 bg-yellow-500 rounded-full flex items-center justify-center animate-spin-slow shadow-lg">
            <Settings className="text-blue-900 h-6 w-6 lg:h-8 lg:w-8" />
          </div>
          <p className="text-lg lg:text-2xl font-black text-white uppercase tracking-tight">
            Powered by <span className="text-yellow-500">The Rotary Club of Abuja HighRise</span>
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end">
           <p className="text-blue-400 font-black tracking-[0.4em] text-[10px] uppercase">The Agentic Orchestrator</p>
           <p className="text-white font-bold text-xs">BABATUNDE ADESINA</p>
        </div>
      </footer>

      {/* 🧭 DESKTOP NAVIGATION */}
      {!isMobile && (
        <div className="fixed bottom-28 right-12 flex gap-4 z-[60] no-print">
          <button onClick={prevSlide} className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-all"><ArrowLeft size={32}/></button>
          <button onClick={nextSlide} className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-all"><ArrowRight size={32}/></button>
        </div>
      )}

      {/* 🤖 AI RESULT TERMINAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-4 lg:p-20 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-[40px] w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 lg:p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter">{aiResult.title || "Orchestration Log"}</h3>
              <div className="flex gap-4">
                {aiResult.content && !aiResult.content.startsWith("DIAGNOSTIC") && (
                  <button onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(sanitizeForVoice(aiResult.content)))} className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-2xl font-bold text-white hover:bg-blue-500 transition-all"><Volume2 size={20}/> Listen</button>
                )}
                <button onClick={() => setShowModal(false)} className="bg-white/10 h-12 w-12 flex items-center justify-center rounded-xl text-white hover:bg-red-500 transition-all"><X size={32} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 text-xl lg:text-2xl text-slate-300 leading-relaxed font-light">
              {aiResult.content && aiResult.content.startsWith("DIAGNOSTIC") ? (
                <div className="bg-red-900/20 border-2 border-red-500/50 p-8 rounded-3xl flex items-center gap-6">
                    <ShieldAlert className="text-red-500" size={60}/>
                    <p className="text-red-200 font-bold">{aiResult.content}</p>
                </div>
              ) : (
                aiResult.image ? (
                   <div className="space-y-8">
                      <p className="italic text-slate-400">"{aiResult.content}"</p>
                      <div className="rounded-3xl overflow-hidden border-8 border-blue-600/20 shadow-2xl"><img src={aiResult.image} className="w-full h-auto" alt="AI Generated" /></div>
                   </div>
                ) : (
                  <div className="whitespace-pre-wrap">{aiResult.content || "Ready for orchestration."}</div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⏳ ORCHESTRATION OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center space-y-8 text-center">
          <div className="h-24 w-24 border-8 border-t-yellow-500 border-white/5 rounded-full animate-spin"></div>
          <p className="text-2xl lg:text-4xl font-black tracking-[0.5em] text-white uppercase animate-pulse">Orchestrating...</p>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          main { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
