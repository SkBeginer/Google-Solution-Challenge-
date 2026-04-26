import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserProfile, Claim } from "../types";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Download, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Car,
  MapPin,
  Calendar,
  Wallet,
  Activity,
  History,
  Scale
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { cn } from "../lib/utils";

interface ClaimViewProps {
  user: UserProfile;
}

export default function ClaimView({ user }: ClaimViewProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaim() {
      if (!id) return;
      const path = `claims/${id}`;
      try {
        const docSnap = await getDoc(doc(db, "claims", id));
        if (docSnap.exists()) {
          setClaim({ id: docSnap.id, ...docSnap.data() } as Claim);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    }
    fetchClaim();
  }, [id]);

  const generatePDF = async () => {
    const element = document.getElementById("claim-report");
    if (!element) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#020617" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SHIELD_CLAIM_${claim?.claimId}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!id || !claim) return;
    const path = `claims/${id}`;
    try {
      await updateDoc(doc(db, "claims", id), { status: newStatus, updatedAt: new Date().toISOString() });
      setClaim({ ...claim, status: newStatus as any });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  if (loading && !claim) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Claim Not Found</h2>
        <button onClick={() => navigate("/dashboard")} className="text-blue-500 hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-12 h-12 glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold tracking-tight font-mono text-white">{claim.claimId}</h1>
               <span className={cn(
                 "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                 claim.status === "pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                 claim.status === "review" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                 claim.status === "approved" && "bg-green-500/10 text-green-400 border-green-500/20",
                 claim.status === "rejected" && "bg-red-500/10 text-red-500 border-red-500/20",
               )}>
                 {claim.status}
               </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Audit Log • {new Date(claim.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={generatePDF}
            className="px-6 py-3 glass-panel hover:bg-white/10 flex items-center gap-2 font-bold text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export Audit PDF
          </button>
          {user.role === "admin" && claim.status === "pending" && (
            <div className="flex gap-2">
              <button 
                onClick={() => updateStatus("approved")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                Approve
              </button>
              <button 
                onClick={() => updateStatus("rejected")}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </header>

      <div id="claim-report" className="grid lg:grid-cols-3 gap-8 p-4 md:p-0">
        {/* Left Column - Main Evidence */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images Grid */}
          <div className="glass-panel p-8">
            <h3 className="text-lg font-bold mb-6 italic uppercase tracking-tighter flex items-center gap-3">
              <History className="w-5 h-5 text-blue-500" />
              Visual Evidence Repository
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {claim.images.map((img, i) => (
                <div key={`view-image-${i}`} className="aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-zoom-in">
                  <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={`evidence-${i}`} referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-xl font-bold mb-10 italic uppercase tracking-tighter flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-indigo-400" />
                AI Detection Matrix
              </div>
            </h3>

            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Detected Deformations</h4>
                    <div className="flex flex-wrap gap-2">
                       {claim.analysis?.damagedParts.map((p, i) => (
                         <span key={`${p}-${i}`} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold uppercase tracking-tighter">{p}</span>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                     <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4 italic">Analysis Finding</h4>
                     <p className="text-white font-medium leading-relaxed italic text-sm">"{claim.analysis?.findings}"</p>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 glass-panel border-blue-500/10">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Confidence Level</span>
                        <div className="text-2xl font-bold font-mono text-white">{claim.analysis?.confidence}%</div>
                        <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${claim.analysis?.confidence}%` }}
                            className="h-full bg-blue-500" 
                           />
                        </div>
                     </div>
                     <div className="p-5 glass-panel border-purple-500/10">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Severity Index</span>
                        <div className={cn(
                          "text-2xl font-bold uppercase tracking-tighter truncate text-white",
                          claim.analysis?.severity === "minor" && "text-green-400",
                          claim.analysis?.severity === "moderate" && "text-yellow-400",
                          claim.analysis?.severity === "severe" && "text-red-400",
                          claim.analysis?.severity === "total loss" && "text-red-600",
                        )}>
                          {claim.analysis?.severity}
                        </div>
                     </div>
                  </div>

                  <div className={cn(
                    "p-6 rounded-3xl border flex items-center gap-4 transition-all",
                    claim.fraudRisk === "low" ? "bg-green-500/5 border-green-500/10" : claim.fraudRisk === "medium" ? "bg-yellow-500/5 border-yellow-500/10" : "bg-red-500/5 border-red-500/10"
                  )}>
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center",
                       claim.fraudRisk === "low" ? "bg-green-500/10 text-green-400" : claim.fraudRisk === "medium" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                     )}>
                        <Shield className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Fraud Risk Assessment</h4>
                        <p className="text-lg font-bold uppercase text-white">{claim.fraudRisk} RISK</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Financials */}
        <div className="space-y-8 text-white">
          <div className="glass-panel p-8 bg-blue-600/5 border-blue-500/20">
             <div className="flex items-center gap-3 mb-8">
                <Wallet className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold text-lg italic uppercase tracking-tighter">Budget Allocation</h3>
             </div>
             
             <div className="space-y-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Estimated Payout</div>
                  <div className="text-4xl font-bold text-white tracking-tighter italic">₹{claim.estimatedCost.toLocaleString()}</div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   {[
                     { l: "Labor Costs (Est.)", v: `₹${(claim.estimatedCost * 0.4).toLocaleString()}` },
                     { l: "Replacement Parts", v: `₹${(claim.estimatedCost * 0.6).toLocaleString()}` },
                     { l: "Platform Processing", v: "Included" }
                   ].map(item => (
                     <div key={`budget-item-${item.l}`} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{item.l}</span>
                        <span className="text-sm font-bold text-slate-300 font-mono">{item.v}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="glass-panel p-8 space-y-8">
             <h3 className="font-bold text-lg italic uppercase tracking-tighter flex items-center gap-3 underline decoration-white/20 underline-offset-8">
                <Scale className="w-5 h-5 text-slate-400" />
                Audit Metadata
             </h3>

             <div className="space-y-6">
                {[
                  { icon: Car, label: "Vehicle ID", value: claim.vehicleNumber },
                  { icon: MapPin, label: "Location", value: claim.location },
                  { icon: Calendar, label: "Filed On", value: new Date(claim.createdAt).toLocaleDateString() },
                  { icon: Shield, label: "Verifier", value: "Gemini 1.5 AI Core" }
                ].map((item, i) => (
                  <div key={`claim-meta-${i}`} className="flex items-center gap-4 group">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-white transition-all">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-white tracking-tight">{item.value}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
