import { useEffect, useState } from "react";
import { UserProfile, Claim } from "../types";
import { db } from "../lib/firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Shield, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowUpRight,
  MoreVertical,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  FileText
} from "lucide-react";
import { cn } from "../lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const statsData = [
  { name: "Approved", value: 45, color: "#22c55e" },
  { name: "Pending", value: 20, color: "#eab308" },
  { name: "Review", value: 15, color: "#3b82f6" },
  { name: "Rejected", value: 10, color: "#ef4444" },
];

interface AdminPanelProps {
  user: UserProfile;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const q = query(collection(db, "claims"), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        setAllClaims(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Claim)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const totalPayout = allClaims.reduce((acc, c) => acc + (c.estimatedCost || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">Admin <span className="text-blue-500 not-italic tracking-tighter">Command</span></h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Global Audit Insight Panel</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search Claim UID..."
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-blue-500 outline-none w-64"
            />
          </div>
          <button className="p-3 glass-panel hover:bg-white/10 transition-all">
            <Filter className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Claims", value: allClaims.length, icon: FileText, color: "text-blue-400" },
          { label: "Global Payout", value: `₹${totalPayout.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
          { label: "AI Suspicion Flag", value: allClaims.filter(c => c.fraudRisk === "high").length, icon: AlertCircle, color: "text-red-400" },
          { label: "Total Insured", value: "2.4K", icon: Users, color: "text-indigo-400" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border-white/5 hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-white/5 rounded-xl">
                 <stat.icon className={`w-6 h-6 ${stat.color}`} />
               </div>
               <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                 +12% <ArrowUpRight className="w-3 h-3" />
               </span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{stat.label}</p>
            <div className="text-2xl font-bold text-white mt-1 uppercase italic tracking-tighter">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8">
           <h3 className="text-lg font-bold mb-10 italic uppercase tracking-tighter flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-500" />
              Global Approval Distribution
           </h3>
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                   {statsData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel overflow-hidden border-orange-500/10">
           <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold text-lg italic tracking-tighter uppercase">High Risk Alerts</h3>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
           </div>
           <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto">
              {allClaims.filter(c => c.fraudRisk === "high").map(claim => (
                <div key={`alert-${claim.id}`} className="p-6 hover:bg-white/5 transition-all group">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Critical Anomaly
                        </p>
                        <p className="font-bold text-white text-sm tracking-tight">{claim.vehicleNumber}</p>
                      </div>
                      <Link to={`/claims/${claim.id}`} className="text-slate-600 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </Link>
                   </div>
                   <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-tighter">
                      <span>AUDIT: {claim.claimId}</span>
                      <span>₹{claim.estimatedCost.toLocaleString()}</span>
                   </div>
                </div>
              ))}
              {allClaims.filter(c => c.fraudRisk === "high").length === 0 && (
                <div className="p-12 text-center italic text-slate-600 uppercase text-[10px] tracking-widest font-bold">
                   No High Risk Anomalies Detected
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Full Audit Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-8 border-b border-white/5">
           <h3 className="text-lg font-bold italic uppercase tracking-tighter">Global Claim Ledger</h3>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <th className="px-8 py-4">UID</th>
                    <th className="px-8 py-4">Claimant</th>
                    <th className="px-8 py-4">Vehicle</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Estimate</th>
                    <th className="px-8 py-4">Risk</th>
                    <th className="px-8 py-4">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {allClaims.map(claim => (
                   <tr key={`row-${claim.id}`} className="text-sm border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-8 py-4 font-mono text-xs">{claim.claimId}</td>
                      <td className="px-8 py-4 font-bold">{claim.userName}</td>
                      <td className="px-8 py-4 text-slate-400">{claim.vehicleType} <span className="text-xs text-slate-600">({claim.vehicleNumber})</span></td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                          claim.status === "pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                          claim.status === "approved" && "bg-green-500/10 text-green-500 border-green-500/20",
                          claim.status === "rejected" && "bg-red-500/10 text-red-500 border-red-500/20",
                        )}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold text-white">₹{claim.estimatedCost.toLocaleString()}</td>
                      <td className="px-8 py-4">
                         <div className={cn(
                           "flex items-center gap-1.5 font-bold uppercase text-[10px]",
                           claim.fraudRisk === "low" ? "text-green-500" : claim.fraudRisk === "medium" ? "text-yellow-500" : "text-red-500"
                         )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full",
                              claim.fraudRisk === "low" ? "bg-green-500" : claim.fraudRisk === "medium" ? "bg-yellow-500" : "bg-red-500"
                            )}></div>
                            {claim.fraudRisk}
                         </div>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <Link to={`/claims/${claim.id}`} className="p-2 hover:bg-white/10 rounded-lg inline-block transition-all">
                            <ArrowUpRight className="w-5 h-5 text-blue-500" />
                         </Link>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
