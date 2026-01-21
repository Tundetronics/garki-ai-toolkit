import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Settings, Users, GraduationCap, 
  Briefcase, Heart, ShieldCheck, Zap, 
  ArrowRight, ArrowLeft, Volume2, Image as ImageIcon, 
  FileText, QrCode, Download, CheckCircle2, 
  AlertTriangle, X, Layout, Compass, Monitor
} from 'lucide-react';

// API key is provided at runtime by the environment
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

  // --- NARRATION SANITIZER ---
  const sanitizeForVoice = (text) => {
    if (!text) return "";
    return text
      .replace(/[*#_~`\[\]()<>]/g, '') 
      .replace(/\n\n/g, '. ') 
      .replace(/\n/g, '. '); 
  };

  // --- NAVIGATION ---
  const totalSlides = 13;
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // --- ✨ AI ORCHESTRATION ---
  const callAI = async (prompt, sys, mode = 'text') => {
    setIsProcessing(true);
    const voiceOptimizedSys = sys + " IMPORTANT: Use plain human-friendly text only. Do not use markdown symbols like asterisks, hashtags, or underscores.";
    
    const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    const payload = mode === 'image' 
      ? { instances: { prompt }, parameters: { sampleCount: 1 } }
      : { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: voiceOptimizedSys }] } };

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const r = await fetch(mode === 'image' ? imageUrl : textUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) 
        });
        
        if (!r.ok) throw new Error("API call failed");
        
        const d = await r.json();
        if (mode === 'image') return `data:image/png;base64,${d.predictions[0].bytesBase64Encoded}`;
        return d.candidates[0].content.parts[0].text;
      } catch (e) {
        if (i === 4) break;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }
    setIsProcessing(false);
    return "Orchestration failed. Please check your internet connection.";
  };

  const runGiftAction = async (type, val) => {
    if (!val) return;
    let res, sys, title;
    if (type === 'student') {
        sys = "Expert academic counselor for GSS Garki. Provide a high-energy study plan.";
        title = "Student Success Blueprint";
        res = await callAI(`Plan for ${val}`, sys);
    } else if (type === 'teacher') {
        sys = "Expert pedagogy assistant. Draft a WAEC-compliant lesson plan.";
        title = "Educator Strategy";
        res = await callAI(`Topic: ${val}`, sys);
    } else if (type === 'principal') {
        sys = "School strategist. Optimizing resources.";
        title = "Leadership Insight";
        res = await callAI(`Challenge: ${val}`, sys);
    } else if (type === 'rotary') {
        sys = "Impact auditor using Rotary 4-way test.";
        title = "Impact Audit";
        res = await callAI(`Project: ${val}`, sys);
    } else if (type === 'visualize') {
        const img = await callAI(`Afro-futuristic high-tech ${val} in Abuja.`, "", 'image');
        setAiResult({ title: "Future Visualized", content: `Digital vision for: ${val}`, image: img });
        setShowModal(true); return;
    }
    setAiResult({ title, content: res, image: null });
    setShowModal(true);
  };

  const exportHandout = () => window.print();

  // --- SLIDE CONTENT DEFINITION ---
  const slides = [
    // 0: INTRO
    <div className="flex flex-col items-center justify-center text-center space-y-8 h-full">
      <div className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest animate-pulse">Vocational Month 2026</div>
      <h1 className="text-6xl lg:text-[130px] font-black text-white leading-none tracking-tighter">AI & DATA <br/><span className="text-yellow-500 italic">ANALYSIS</span></h1>
      <p className="text-xl lg:text-3xl text-slate-400 font-light">Orchestrating Excellence at <span className="text-white font-bold underline decoration-blue-600">GSS Garki</span></p>
      <div className="pt-12">
        <p className="text-2xl font-bold uppercase tracking-widest text-white">Babatunde Adesina</p>
        <p className="text-blue-400 font-bold text-sm tracking-[0.4em]">THE AGENTIC ORCHESTRATOR</p>
      </div>
    </div>,

    // 1: ROTARY
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="space-y-8">
        <h2 className="text-4xl lg:text-7xl font-black text-yellow-500 uppercase leading-none">HighRise <br/><span className="text-white">Impact</span></h2>
        <p className="text-xl lg:text-2xl text-slate-300 italic">Facilitated by the Rotary Club of Abuja HighRise.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 text-white"><Heart className="text-yellow-500 mb-2"/><p className="font-bold">Service Above Self</p></div>
          <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 text-white"><ShieldCheck className="text-yellow-500 mb-2"/><p className="font-bold">4-Way Test</p></div>
        </div>
      </div>
      <div className="rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1280" className="w-full h-full object-cover" alt="Student Community" />
      </div>
    </div>,

    // 2: DATA
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="image-wrapper rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=1280" className="w-full h-full object-cover" alt="Data Visualization" />
      </div>
      <div className="space-y-8">
        <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase leading-none border-l-8 border-blue-600 pl-6">Data Detective</h2>
        <p className="text-xl lg:text-2xl text-slate-300">Data is the oil of Garki. Analysis is the engine that finds the Truth in the noise.</p>
      </div>
    </div>,

    // 3: AI
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="space-y-8">
        <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase leading-none border-l-8 border-blue-600 pl-6">Digital Brain</h2>
        <p className="text-xl lg:text-2xl text-slate-300">AI mimics human logic to process facts. It doesn't just think; it <span className="text-white font-bold">Orchestrates</span>.</p>
      </div>
      <div className="image-wrapper rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1280" className="w-full h-full object-cover" alt="Neural Network" />
      </div>
    </div>,

    // 4: GAME
    <div className="flex flex-col justify-center space-y-8 h-full">
      <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase">Interactive: Pattern Game</h2>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <table className="w-full text-left">
          <thead className="bg-blue-900/50">
            <tr><th className="p-6 text-xs uppercase font-black">Student</th><th className="p-6 text-xs uppercase font-black">Score</th><th className="p-6 text-xs uppercase font-black">Access</th><th className="p-6 text-xs uppercase font-black">AI Prediction</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr><td className="p-6">Student A (Area 10)</td><td className="p-6">305</td><td className="p-6 text-green-400">Yes</td><td className="p-6 font-bold text-green-400 tracking-widest">PASS</td></tr>
            <tr className="bg-white/5"><td className="p-6">Student B (Area 1)</td><td className="p-6">120</td><td className="p-6 text-red-400">No</td><td className="p-6 font-bold text-red-400 tracking-widest">INTERVENE</td></tr>
          </tbody>
        </table>
      </div>
      <p className="text-center text-slate-400 italic">"The machine spots the Success Coefficient: Score + Access."</p>
    </div>,

    // 5: JOBS
    <div className="flex flex-col justify-center space-y-12 h-full">
       <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase">Careers of 2030</h2>
       <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-bold">AI Strategy Consultant</p>
            <div className="h-6 bg-slate-800 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-blue-600"></div></div>
          </div>
          <div className="space-y-2">
            <p className="font-bold">Data Orchestrator</p>
            <div className="h-6 bg-slate-800 rounded-full overflow-hidden"><div className="h-full w-[88%] bg-yellow-500"></div></div>
          </div>
       </div>
    </div>,

    // 6: ETHICS
    <div className="grid lg:grid-cols-3 gap-6 h-full items-center">
       <div className="tile h-full flex flex-col justify-center text-center space-y-4 bg-white/5 rounded-3xl p-6 border border-white/5"><Zap size={48} className="mx-auto text-yellow-500"/> <h3 className="text-2xl font-black">Truth</h3> <p className="text-slate-400 text-sm">Verify the data.</p></div>
       <div className="tile h-full flex flex-col justify-center text-center space-y-4 bg-white/5 rounded-3xl p-6 border border-white/5"><Users size={48} className="mx-auto text-blue-400"/> <h3 className="text-2xl font-black">Fairness</h3> <p className="text-slate-400 text-sm">No bias allowed.</p></div>
       <div className="tile h-full flex flex-col justify-center text-center space-y-4 bg-white/5 rounded-3xl p-6 border border-white/5"><Heart size={48} className="mx-auto text-yellow-500"/> <h3 className="text-2xl font-black">Benefit</h3> <p className="text-slate-400 text-sm">Garki first.</p></div>
    </div>,

    // 7: STUDENT TOOL
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="bg-slate-800/40 p-10 rounded-[40px] border border-white/10 space-y-6">
        <GraduationCap className="text-yellow-500" size={48}/>
        <h3 className="text-3xl font-black">Success Navigator</h3>
        <p className="text-slate-400">Generate your 8-day JAMB/WAEC study plan.</p>
        <input id="stu-in" className="w-full bg-black/50 p-4 rounded-xl text-white outline-none border border-white/10 focus:border-blue-500" placeholder="e.g. Maths, Literature" />
        <button onClick={() => runGiftAction('student', document.getElementById('stu-in').value)} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold uppercase">Orchestrate</button>
      </div>
      <div className="image-wrapper rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1280" className="w-full h-full object-cover" alt="Student Success" />
      </div>
    </div>,

    // 8: TEACHER TOOL
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="image-wrapper rounded-[40px] overflow-hidden border border-white/10 h-64 lg:h-[500px]">
        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1280" className="w-full h-full object-cover" alt="Teaching" />
      </div>
      <div className="bg-slate-800/40 p-10 rounded-[40px] border border-white/10 space-y-6">
        <Briefcase className="text-blue-400" size={48}/>
        <h3 className="text-3xl font-black">Educator Pro</h3>
        <p className="text-slate-400">Rapid lesson plan orchestration for GSS Garki.</p>
        <input id="tea-in" className="w-full bg-black/50 p-4 rounded-xl text-white outline-none border border-white/10 focus:border-blue-500" placeholder="e.g. Photosynthesis" />
        <button onClick={() => runGiftAction('teacher', document.getElementById('tea-in').value)} className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-xl font-bold uppercase">Draft Strategy</button>
      </div>
    </div>,

    // 9: PRINCIPAL / ROTARY
    <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
      <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 space-y-6">
        <Settings className="text-yellow-500" size={40}/>
        <h3 className="text-2xl font-black">Principal Dashboard</h3>
        <input id="pri-in" className="w-full bg-black/40 p-4 rounded-xl text-white border border-white/10" placeholder="e.g. Science lab usage" />
        <button onClick={() => runGiftAction('principal', document.getElementById('pri-in').value)} className="w-full bg-blue-900 hover:bg-blue-800 py-3 rounded-xl font-bold uppercase">Optimize</button>
      </div>
      <div className="bg-slate-800/40 p-8 rounded-3xl border border-white/5 space-y-6">
        <Compass className="text-blue-400" size={40}/>
        <h3 className="text-2xl font-black">Impact Auditor</h3>
        <input id="rot-in" className="w-full bg-black/40 p-4 rounded-xl text-white border border-white/10" placeholder="e.g. Water borehole project" />
        <button onClick={() => runGiftAction('rotary', document.getElementById('rot-in').value)} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold uppercase">Audit</button>
      </div>
    </div>,

    // 10: MOTIVATION
    <div className="flex flex-col items-center justify-center text-center space-y-12 h-full">
       <h2 className="text-6xl lg:text-[140px] font-black leading-[0.8] uppercase text-white tracking-tighter">ORCHESTRATE <br/><span className="text-yellow-500 italic">DESTINY</span></h2>
       <p className="text-2xl lg:text-4xl text-slate-400 max-w-4xl font-light">Garki is not your limit. It is your <span className="text-white font-bold">Launchpad</span>. Period.</p>
    </div>,

    // 11: CHALLENGE
    <div className="flex flex-col items-center justify-center text-center space-y-12 h-full">
       <h2 className="text-4xl lg:text-6xl font-black text-yellow-500 uppercase">The Garki Task</h2>
       <div className="bg-white/5 border-4 border-dashed border-blue-500/30 p-12 max-w-3xl rounded-[40px]">
          <p className="text-2xl mb-8">Identify a problem in Garki. Use AI to visualize the solution.</p>
          <div className="flex gap-4">
             <input id="vis-in" className="flex-1 bg-black/50 p-4 rounded-xl text-white border border-white/10" placeholder="e.g. Cleaner waste system in Area 1" />
             <button onClick={() => runGiftAction('visualize', document.getElementById('vis-in').value)} className="bg-purple-600 hover:bg-purple-500 px-8 rounded-xl font-bold flex items-center gap-2"><ImageIcon size={18}/> Visualize</button>
          </div>
       </div>
    </div>,

    // 12: ACCESS
    <div className="flex flex-col items-center justify-center text-center space-y-12 h-full">
       <h2 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter">Scan for Access</h2>
       <div className="flex items-center gap-12 bg-white/5 p-12 rounded-[50px] border-2 border-yellow-500/20 shadow-2xl">
          <div className="bg-white p-4 rounded-3xl"><QrCode size={180} className="text-black"/></div>
          <div className="text-left space-y-2">
             <p className="text-4xl font-black uppercase text-white">GSS Toolkit</p>
             <p className="text-lg text-yellow-500 font-bold uppercase tracking-widest">bit.ly/GarkiHighRiseAI</p>
             <button onClick={exportHandout} className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-sm font-bold text-white"><Download size={16}/> Export Handout</button>
          </div>
       </div>
       <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.5em] animate-pulse">Service Above Self</p>
    </div>
  ];

  return (
    <div className="relative bg-slate-950 text-slate-200 w-screen h-screen flex flex-col overflow-hidden">
      {/* 🚢 FOOTER BRANDING */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-blue-900 border-t-8 border-yellow-500 z-50 flex items-center justify-between px-6 lg:px-20 no-print shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 lg:h-12 lg:w-12 bg-yellow-500 rounded-full flex items-center justify-center animate-spin-slow">
            <Settings className="text-blue-900 h-6 w-6 lg:h-8 lg:w-8" />
          </div>
          <p className="text-lg lg:text-2xl font-black text-white uppercase tracking-tight">
            Powered by <span className="text-yellow-500">The Rotary Club of Abuja HighRise</span>
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end">
           <p className="text-blue-400 font-black tracking-[0.4em] text-[10px]">THE AGENTIC ORCHESTRATOR</p>
           <p className="text-white font-bold text-xs uppercase">BABATUNDE ADESINA</p>
        </div>
      </footer>

      {/* 🚢 HEADER NAV */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-8 no-print">
         <div className="flex items-center gap-3"><BrainCircuit className="text-blue-500" /><span className="font-black text-sm tracking-widest uppercase text-white">GSS Garki AI Suite</span></div>
         <div className="flex gap-2">
            {[...Array(totalSlides)].map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-10 bg-yellow-500' : 'w-2 bg-slate-700'}`}></button>
            ))}
         </div>
      </nav>

      {/* VIEWPORT */}
      <main className={`flex-1 flex items-center justify-center p-6 lg:p-20 pb-32 no-print ${isMobile ? 'overflow-y-auto pt-20' : ''}`}>
        <div style={{ transform: isMobile ? 'none' : `scale(${scale})` }} className="w-full max-w-7xl h-full flex items-center justify-center transition-all duration-700">
           {slides[currentSlide]}
        </div>
      </main>

      {/* NAV ARROWS */}
      {!isMobile && (
        <div className="fixed bottom-28 right-12 flex gap-4 z-[60] no-print">
          <button onClick={prevSlide} className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all text-white"><ArrowLeft size={32}/></button>
          <button onClick={nextSlide} className="h-16 w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all text-white"><ArrowRight size={32}/></button>
        </div>
      )}

      {/* 🤖 AI RESULT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[200] flex items-center justify-center p-4 lg:p-20 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-[40px] w-full max-w-6xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 lg:p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-2xl lg:text-3xl font-black text-white uppercase">{aiResult.title || "Orchestration Terminal"}</h3>
              <div className="flex gap-4">
                {aiResult.content && (
                  <button onClick={() => window.speechSynthesis.speak(new SpeechSynthesisUtterance(sanitizeForVoice(aiResult.content)))} className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all text-white"><Volume2 size={20}/> Listen</button>
                )}
                <button onClick={() => setShowModal(false)} className="bg-white/10 h-12 w-12 flex items-center justify-center rounded-xl text-white hover:bg-red-500 transition-all"><X size={32} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 text-xl lg:text-2xl text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
              {aiResult.image ? (
                 <div className="space-y-8">
                    <p className="italic text-slate-400">"{aiResult.content}"</p>
                    <div className="rounded-3xl overflow-hidden border-8 border-blue-600/20"><img src={aiResult.image} className="w-full h-auto" alt="AI Generated" /></div>
                 </div>
              ) : (
                aiResult.content || "Ready for input."
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⏳ LOADER */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center space-y-8 text-center">
          <div className="h-24 w-24 border-8 border-t-yellow-500 border-white/5 rounded-full animate-spin"></div>
          <p className="text-2xl lg:text-4xl font-black tracking-[0.5em] text-white uppercase animate-pulse px-6">Orchestrating...</p>
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
