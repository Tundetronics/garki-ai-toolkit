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
        sys
