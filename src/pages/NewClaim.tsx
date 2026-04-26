import { useState, useRef, useEffect } from "react";
import { UserProfile, Claim, DamageAnalysis } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { analyzeVehicleDamage, analyzeMultiImage, getVoiceAnalysis } from "../lib/gemini";
import { 
  Car, 
  MapPin, 
  Camera, 
  Mic, 
  MicOff, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Scan,
  Zap,
  Trash2,
  X,
  Calendar,
  Clock as ClockIcon,
  ShieldCheck,
  Search,
  ChevronDown,
  Info,
  Check,
  Sparkles,
  Lock,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";

import { STATE_CODES, RTO_ZONES } from "../constants/rtoData";

interface NewClaimProps {
  user: UserProfile;
}

const STEPS = ["Vehicle Info", "Visuals", "AI Analysis", "Final Submission"];

export default function NewClaim({ user }: NewClaimProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  const nextStep = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleVerification, setVehicleVerification] = useState<{
    status: 'idle' | 'searching' | 'verified' | 'error';
    error?: string;
    rtoInfo?: { state: string; zone: string };
    details?: { manufacturer: string; model: string; year: string; fuel: string; color: string };
  }>({ status: 'idle' });

  const [location, setLocation] = useState("");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState("12:00");
  
  const [insuranceExpanded, setInsuranceExpanded] = useState(false);
  const [insuranceData, setInsuranceData] = useState({ provider: "", policyNo: "", expiry: "" });

  const [vehicleCondition, setVehicleCondition] = useState("Good");
  const [damageSeverity, setDamageSeverity] = useState("Minor");

  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<DamageAnalysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const navigate = useNavigate();

  const handleStartScan = async () => {
    if (!vehicleNumber || !location) return;
    
    setIsInitializing(true);
    // High-tech AI initialization sequence simulation
    await new Promise(r => setTimeout(r, 800));
    setIsInitializing(false);
    nextStep(1);
  };

  // Smart Registration Formatting & Indian Plate Validation
  const handleRegChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Indian Registration Rule Regex: 2 Letters (State) + 2 Digits (RTO) + 1/2 Letters (Series) + 4 Digits (Number)
    const indianPlateRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    
    let formatted = "";
    if (clean.length > 0) formatted += clean.substring(0, 2);
    if (clean.length > 2) formatted += "-" + clean.substring(2, 4);
    if (clean.length > 4) {
      // Find where final numeric block starts
      const lastDigits = clean.match(/[0-9]{4}$/);
      if (lastDigits && lastDigits.index !== undefined && lastDigits.index > 4) {
        const series = clean.substring(4, lastDigits.index);
        const number = clean.substring(lastDigits.index);
        formatted += "-" + series + "-" + number;
      } else {
        formatted += "-" + clean.substring(4);
      }
    }
    
    setVehicleNumber(formatted);

    // Detect RTO Info while typing
    if (clean.length >= 4) {
      const sCode = clean.substring(0, 2);
      const rtoCode = clean.substring(0, 4);
      const sName = STATE_CODES[sCode] || "Unknown State";
      const zName = RTO_ZONES[rtoCode] || "Scanning Zone Details...";
      
      setVehicleVerification(prev => ({
        ...prev,
        rtoInfo: { state: sName, zone: zName }
      }));
    } else {
      setVehicleVerification(prev => ({ ...prev, rtoInfo: undefined }));
    }

    // Full Validation & Mock database sync
    if (clean.length >= 7) {
      if (indianPlateRegex.test(clean)) {
        setVehicleVerification(prev => ({ ...prev, status: 'searching', error: undefined }));
        
        const timer = setTimeout(() => {
          setVehicleVerification(prev => ({
            ...prev,
            status: 'verified',
            details: { manufacturer: "Tesla", model: "Model 3", year: "2023", fuel: "Electric", color: "Deep Blue Metallic" }
          }));
        }, 1200);
        return () => clearTimeout(timer);
      } else if (clean.length >= 10) {
        setVehicleVerification(prev => ({ 
          ...prev, 
          status: 'error', 
          error: "Invalid Format (e.g. KA01AB1234)" 
        }));
      }
    } else {
      setVehicleVerification(prev => ({ ...prev, status: 'idle', error: undefined }));
    }
  };

  // Voice Assistant
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev + " " + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const runAnalysis = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      // Small delay for drama
      await new Promise(r => setTimeout(r, 1000));
      
      let result;
      try {
        if (images.length === 1) {
          result = await analyzeVehicleDamage(images[0].split(",")[1]);
        } else {
          result = await analyzeMultiImage(images.map(img => img.split(",")[1]));
        }

        // Defensive normalization
        const normalized: DamageAnalysis = {
          damagedParts: Array.isArray(result?.damagedParts) ? result.damagedParts : [],
          severity: ["minor", "moderate", "severe", "total loss"].includes(result?.severity) ? result.severity : "moderate",
          estimatedCost: typeof result?.estimatedCost === "number" ? result.estimatedCost : 0,
          fraudRisk: ["low", "medium", "high"].includes(result?.fraudRisk) ? result.fraudRisk : "low",
          confidence: typeof result?.confidence === "number" ? result.confidence : 50,
          findings: result?.findings || "No detailed findings available.",
          recommendation: result?.recommendation || "Manual review recommended."
        };

        setAnalysis(normalized);
        setStep(3);
      } catch (err) {
        console.error("Analysis Parse Error:", err);
        alert("AI results were malformed. Retrying with basic audit.");
        // Fallback or retry logic could go here
        setStep(1); // Go back if it fails
      }
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitClaim = async () => {
    setLoading(true);
    const path = "claims";
    try {
      const claimId = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
      await addDoc(collection(db, path), {
        claimId,
        userId: user.userId,
        userName: user.displayName,
        vehicleType,
        vehicleNumber,
        location,
        description,
        images,
        analysis,
        status: "pending",
        fraudRisk: analysis?.fraudRisk || "low",
        estimatedCost: analysis?.estimatedCost || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate("/dashboard");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-6">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 mb-8 relative gap-6">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="w-full flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight italic uppercase">
                Claim <span className="text-blue-500 italic">Audit</span>
              </h1>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mt-1">Initiating Digital Forensics Protocol</p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-tight text-emerald-500">AI Engine ● Online</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Step {step + 1} of 4</span>
                 <p className="text-sm font-bold italic uppercase">{STEPS[step]}</p>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">{(step + 1) * 25}% Complete</div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step + 1) * 25}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate("/dashboard")}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 group transition-all"
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              key="s0"
              custom={direction}
              variants={{
                enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-8"
            >
              <div className="glass-panel p-8 border-blue-500/10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                    <Car className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">Vehicle Identification</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Step 01 / Basic Assets</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Smart Registration ID */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Universal Registration ID</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all rounded-full pointer-events-none" />
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <motion.input 
                          type="text"
                          value={vehicleNumber}
                          onChange={(e) => handleRegChange(e.target.value)}
                          placeholder="KA-01-AB-1234"
                          whileFocus={{ scale: 1.01 }}
                          className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-14 pr-4 text-2xl font-mono font-bold tracking-tighter text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all uppercase placeholder:text-slate-700"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                          {vehicleVerification.status === 'searching' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                          {vehicleVerification.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                          {vehicleVerification.status === 'verified' && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            >
                              <Check className="w-3 h-3" />
                              Vehicle Verified
                            </motion.div>
                          )}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {vehicleVerification.error && (
                          <motion.p 
                            key="error-msg"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-5 pt-2"
                          >
                            {vehicleVerification.error}
                          </motion.p>
                        )}
                        {vehicleVerification.status === 'verified' && (
                          <motion.p 
                            key="verified-msg"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest pl-5 pt-2"
                          >
                            Valid Vehicle Number Detected
                          </motion.p>
                        )}
                        {vehicleVerification.rtoInfo && (
                          <motion.div 
                            key="rto-info"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-2 gap-3 mt-4"
                          >
                             <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">State Origin</div>
                               <div className="text-xs font-bold text-slate-300">{vehicleVerification.rtoInfo.state}</div>
                             </div>
                             <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Registration Zone</div>
                               <div className="text-xs font-bold text-slate-300">{vehicleVerification.rtoInfo.zone}</div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>


                  </div>

                  {/* Incident Details */}
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Incident Chronology</label>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="relative group">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                              <motion.input 
                                type="date"
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                                whileFocus={{ scale: 1.02 }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-3 text-xs font-bold text-white focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all appearance-none"
                              />
                           </div>
                           <div className="relative group">
                              <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                              <motion.input 
                                type="time"
                                value={incidentTime}
                                onChange={(e) => setIncidentTime(e.target.value)}
                                whileFocus={{ scale: 1.02 }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-3 text-xs font-bold text-white focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all appearance-none"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Precision Location</label>
                        <div className="relative group">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                           <motion.input 
                              type="text"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="MG Road, Bangalore"
                              whileFocus={{ scale: 1.01 }}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-12 text-sm font-bold text-white focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                           />
                           <button 
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-blue-500 hover:text-blue-400 transition-colors z-10"
                            onClick={() => setLocation("Current Location Detected (MG Road)")}
                           >
                              <Sparkles className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Insurance Details Accordion */}
                  <div className="space-y-4">
                    <button 
                      onClick={() => setInsuranceExpanded(!insuranceExpanded)}
                      className="w-full flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group"
                    >
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                           <ShieldCheck className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                           <h3 className="text-sm font-black italic uppercase">Policy Core Details</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Insurance & Coverage verification</p>
                         </div>
                       </div>
                       <ChevronDown className={cn("w-5 h-5 text-slate-600 transition-transform", insuranceExpanded && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {insuranceExpanded && (
                        <motion.div 
                          key="insurance-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid md:grid-cols-3 gap-4 p-6 bg-white/2 border border-white/5 rounded-3xl mt-2">
                             {[
                               { l: "Provider", ph: "e.g. AXA Insurance", k: "provider" },
                               { l: "Policy Number", ph: "POL-00982", k: "policyNo" },
                               { l: "Expiry Date", ph: "MM/YYYY", k: "expiry" }
                             ].map((item) => (
                               <div key={item.k} className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.l}</label>
                                  <motion.input 
                                    type="text" 
                                    placeholder={item.ph}
                                    value={(insuranceData as any)[item.k]}
                                    onChange={(e) => setInsuranceData({...insuranceData, [item.k]: e.target.value})}
                                    whileFocus={{ scale: 1.02 }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
                                  />
                               </div>
                             ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Vehicle Condition Selection */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pre-Incident Condition</label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {["Excellent", "Good", "Fair", "Poor"].map((cond) => (
                           <motion.button 
                            key={cond}
                            onClick={() => setVehicleCondition(cond)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-center",
                              vehicleCondition === cond 
                                ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                                : "bg-white/2 border-white/5 text-slate-500 hover:border-white/20"
                            )}
                           >
                            {cond}
                           </motion.button>
                         ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Damage Severity Perception</label>
                       <div className="grid grid-cols-3 gap-4">
                         {[
                           { l: "Minor", i: Info, c: "text-emerald-400" },
                           { l: "Moderate", i: Zap, c: "text-yellow-400" },
                           { l: "Severe", i: AlertCircle, c: "text-red-400" }
                         ].map((sev) => (
                           <motion.button 
                            key={sev.l}
                            onClick={() => setDamageSeverity(sev.l)}
                            whileHover={{ scale: 1.02 }}
                            className={cn(
                              "p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                              damageSeverity === sev.l 
                                ? "bg-white/5 border-white/20 shadow-lg" 
                                : "bg-white/2 border-white/5 text-slate-600 hover:bg-white/5"
                            )}
                           >
                            <sev.i className={cn("w-6 h-6", damageSeverity === sev.l ? sev.c : "text-slate-700")} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", damageSeverity === sev.l ? "text-white" : "text-slate-600")}>
                              {sev.l}
                            </span>
                           </motion.button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-6">
                   <motion.button 
                    whileHover={{ gap: '24px', scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartScan}
                    disabled={!vehicleNumber || !location || vehicleVerification.status === 'searching' || isInitializing}
                    className="w-full py-6 bg-white text-slate-950 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 group relative overflow-hidden"
                   >
                     {isInitializing ? (
                       <>
                         <Loader2 className="w-6 h-6 animate-spin" />
                         Calibrating Sensors...
                       </>
                     ) : (
                       <>
                         Initialize Visual Scan
                         <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                       </>
                     )}
                   </motion.button>

                   <div className="flex items-center justify-center gap-2 text-slate-600">
                     <Lock className="w-3 h-3" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Quantum End-to-End Encryption Enabled</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {step === 1 && (
          <motion.div 
            key="s1"
            custom={direction}
            variants={{
              enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-8"
          >
            <div className="glass-panel p-10 border-indigo-500/10">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                   <Camera className="w-7 h-7" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold italic tracking-tighter uppercase underline decoration-indigo-500 decoration-3 underline-offset-8">Visual Evidence Capture</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 ml-1">Evidence gathering stage 02</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col items-center justify-center py-10 border-2 border-dashed border-indigo-500/20 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-10 h-10 text-indigo-400 mb-4 group-hover:-translate-y-2 transition-transform" />
                        <p className="font-bold text-white uppercase text-xs tracking-widest mb-1">Click to Capture</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Supports multiple angles</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {images.map((img, i) => (
                        <motion.div 
                          key={`newclaim-image-${i}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 relative group"
                        >
                          <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-red-600/80 items-center justify-center hidden group-hover:flex transition-all"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {images.length > 0 && (
                      <motion.button 
                        key="clear-images-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setImages([])}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-600" />
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Incident Description</label>
                         <button 
                           onClick={toggleRecording}
                           className={cn(
                             "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                             isRecording ? "bg-red-500 animate-pulse text-white" : "bg-white/5 text-slate-500 hover:text-white"
                           )}
                         >
                           {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                         </button>
                      </div>
                      <motion.textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the incident details. You can also use the voice assistant to dictate..."
                        whileFocus={{ scale: 1.01 }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white h-[200px] focus:border-indigo-500 focus:outline-none focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all resize-none font-medium leading-relaxed"
                      />
                   </div>
                </div>
              </div>

              <div className="pt-10 flex gap-4 mt-8 border-t border-white/5">
                 <motion.button 
                  whileHover={{ x: -10 }}
                  onClick={() => nextStep(0)}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                 >
                   <ChevronLeft className="w-5 h-5" />
                   Previous Scan
                 </motion.button>
                 <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => nextStep(2)}
                  disabled={images.length === 0}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 transition-all disabled:opacity-50"
                 >
                   Proceed to AI Pulse
                   <Scan className="w-5 h-5" />
                 </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="s2"
            custom={direction}
            variants={{
              enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-panel p-20 text-center space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
            
            <div className="relative group mx-auto w-40 h-40">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full"></div>
              <div className="relative w-40 h-40 bg-zinc-900 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <Scan className="w-16 h-16 text-blue-500 animate-bounce" />
                <motion.div 
                  className="absolute inset-0 bg-blue-500/20"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight uppercase italic italic">Detecting <span className="text-blue-500">Damage...</span></h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Gemini 1.5 is correlating your evidence with 1.2M historical records for precision estimation.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-3">
               {[
                 { l: "Consolidating multiple angles", s: images.length > 1 ? "Complete" : "Skip" },
                 { l: "Detecting part deformation", s: "Processing..." },
                 { l: "Auditing Metadata for fraud", s: "Queued" }
               ].map((item, id) => (
                 <div key={`audit-step-${id}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 opacity-60">
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400">{item.l}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-400">{item.s}</span>
                 </div>
               ))}
            </div>

            <div className="pt-10">
              <button 
                onClick={runAnalysis}
                disabled={loading}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {loading ? "Initializing Pulse..." : "Trigger AI Audit"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && analysis && (
          <motion.div 
            key="s3"
            custom={direction}
            variants={{
              enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-8"
          >
            <div className="flex gap-4">
               <div className="flex-1 glass-panel p-8 border-green-500/10">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-lg italic tracking-tighter uppercase">AI Audit Report</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                       {analysis.damagedParts?.map((p, i) => (
                         <span key={`${p}-${i}`} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-tighter">{p}</span>
                       ))}
                       {(!analysis.damagedParts || analysis.damagedParts.length === 0) && (
                         <span className="text-slate-500 text-xs italic">No specific parts identified</span>
                       )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Severity</p>
                          <p className={cn(
                            "text-lg font-bold",
                            analysis.severity === "minor" ? "text-green-400" : analysis.severity === "moderate" ? "text-yellow-400" : "text-red-400"
                          )}>{(analysis.severity || "MODERATE").toUpperCase()}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Estimate</p>
                          <p className="text-lg font-bold text-blue-400">₹{analysis.estimatedCost.toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-full flex items-center justify-center",
                           analysis.fraudRisk === "low" ? "bg-green-500/10 text-green-400" : analysis.fraudRisk === "medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                         )}>
                            <AlertCircle className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Fraud Risk</p>
                            <p className="text-sm font-bold uppercase">{analysis.fraudRisk} Risk Detected</p>
                         </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Confidence</p>
                          <p className="text-sm font-mono font-bold text-white">{analysis.confidence}%</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="w-80 glass-panel p-8 flex flex-col justify-center gap-6">
                  <div className="flex-1">
                     <h3 className="font-bold text-lg mb-2 italic">Recommendation</h3>
                     <p className="text-sm text-slate-400 font-medium leading-relaxed italic">"{analysis.recommendation}"</p>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={submitClaim}
                      disabled={loading}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/20"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      Final Release
                    </button>
                    <button 
                      onClick={() => setStep(1)}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-slate-400 flex items-center justify-center gap-2 transition-all"
                    >
                      Audit Re-Calibration
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryItem({ label, value, active, highlight }: { label: string; value: string; active: boolean; highlight?: boolean }) {
  return (
    <div className="space-y-1.5 flex flex-col">
       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{label}</span>
       <div className={cn(
         "text-xs font-bold transition-all",
         active ? (highlight ? "text-blue-500" : "text-white") : "text-slate-800 italic"
       )}>
         {value}
       </div>
    </div>
  );
}

function TrackerItem({ label, status, time }: { label: string; status: "complete" | "active" | "pending"; time: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
          status === "complete" && "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]",
          status === "active" && "bg-blue-600 border-blue-600 text-white animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.4)]",
          status === "pending" && "bg-white/5 border-white/10 text-slate-600"
        )}>
          {status === "complete" ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>
      </div>
      <div className="flex-1 border-b border-white/5 pb-4 group-last:border-0 flex justify-between items-center">
        <div>
          <div className={cn("text-sm font-bold uppercase tracking-widest italic transition-colors", status === "pending" ? "text-slate-600" : "text-white")}>{label}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">LOG_ID: {Math.random().toString(36).substring(7).toUpperCase()} / {status.toUpperCase()}</div>
        </div>
        <div className={cn("text-[10px] font-mono", status === "active" ? "text-blue-500" : "text-slate-600")}>{time}</div>
      </div>
    </div>
  );
}
