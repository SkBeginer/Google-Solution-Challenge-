import { useEffect, useState } from "react";
import { UserProfile, Claim } from "../types";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  FileText,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const data = [
  { name: "Mon", claims: 4 },
  { name: "Tue", claims: 7 },
  { name: "Wed", claims: 5 },
  { name: "Thu", claims: 9 },
  { name: "Fri", claims: 12 },
  { name: "Sat", claims: 8 },
  { name: "Sun", claims: 6 },
];

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchClaims() {
      const path = "claims";
      try {
        const q = query(
          collection(db, path), 
          where("userId", "==", user.userId),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        setClaims(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Claim)));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, [user.userId]);

  const filteredClaims = activeFilter === "all" 
    ? claims 
    : claims.filter(c => c.status === activeFilter);

  const stats = [
    { label: "Active Claims", value: claims.filter(c => c.status === "pending" || c.status === "review").length, icon: Clock, color: "text-blue-400" },
    { label: "Approved", value: claims.filter(c => c.status === "approved").length, icon: CheckCircle2, color: "text-green-400" },
    { label: "Rejected", value: claims.filter(c => c.status === "rejected").length, icon: XCircle, color: "text-red-400" },
    { label: "Total Estimated", value: `₹${claims.reduce((acc, c) => acc + (c.estimatedCost || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, {user.displayName}</h1>
          <p className="text-slate-500 font-medium italic">Safety is the standard. AI is the tool.</p>
        </div>
        <Link to="/claims/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          New Claim Request
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Claim Activity
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 uppercase tracking-tighter">Weekly Trend</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Area type="monotone" dataKey="claims" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClaims)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="flex flex-col gap-6 mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 italic">
              <FileText className="w-5 h-5 text-indigo-500" />
              Recent Claims
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "review", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                    activeFilter === status 
                      ? "bg-blue-600/20 text-white border-blue-500/50" 
                      : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600 italic">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p>No {activeFilter === "all" ? "" : activeFilter} claims found.</p>
              </div>
            ) : (
              filteredClaims.slice(0, 5).map((claim) => (
                <Link 
                  key={claim.id} 
                  to={`/claims/${claim.id}`}
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500 tracking-tighter uppercase">{claim.claimId}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      claim.status === "pending" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                      claim.status === "review" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                      claim.status === "approved" && "bg-green-500/10 text-green-500 border-green-500/20",
                      claim.status === "rejected" && "bg-red-500/10 text-red-500 border-red-500/20",
                    )}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{claim.vehicleNumber}</p>
                      <p className="text-xs text-slate-500">{claim.vehicleType}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))
            )}
            {claims.length > 0 && (
              <button className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors mt-4">
                View All Activity
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
