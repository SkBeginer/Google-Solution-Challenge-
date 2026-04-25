import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Zap, 
  Camera, 
  BarChart3, 
  ArrowRight, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Search, 
  Star,
  Clock,
  Lock,
  Smartphone,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ParticleBackground from "../components/ParticleBackground";
import SmartCarVisual from "../components/SmartCarVisual";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <ParticleBackground />

      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 w-full z-50 px-6 py-8 transition-all duration-300 md:px-12",
        isScrolled ? "py-4 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartClaim <span className="text-blue-500">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {["Home", "Upload", "Process", "Track", "Safety"].map((item, i) => (
              <a 
                key={`nav-desktop-${item}-${i}`} 
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white">Login</button>
            <Link 
              to="/auth" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#020617] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
               {["Home", "Upload", "Process", "Track", "Safety"].map((item, i) => (
                <a 
                  key={`nav-mobile-${item}-${i}`} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold uppercase italic tracking-tighter"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              AI Damage Verification
            </div>

            <h1 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
              Automate <br />
              <span className="gradient-text">Claims</span> <br />
              Better.
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Upload your vehicle damage photos and let our neural networks process 
              your insurance journey in minutes. Precise, secure, and lightning fast.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/auth" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center gap-4 group shadow-xl shadow-blue-900/40">
                File A Claim
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-all">
                Track Status
              </button>
            </div>

            <div className="flex gap-12 pt-8">
              <div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-black gradient-text tracking-tighter">98%</motion.div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Accuracy</div>
              </div>
              <div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-black gradient-text tracking-tighter">5 Min</motion.div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Processing</div>
              </div>
              <div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-black gradient-text tracking-tighter">50K+</motion.div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Users</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center"
          >
            <SmartCarVisual />
          </motion.div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="text-blue-500 font-black tracking-widest text-xs uppercase mb-2">File A Claim</div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Snap, <span className="text-blue-500 text-6xl">Audit</span>, Done.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Our computer vision technology analyzes damage with 98.4% accuracy — better than human adjusters.</p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="max-w-3xl mx-auto p-16 rounded-[40px] border-2 border-dashed border-blue-500/30 bg-blue-500/5 text-center space-y-6 cursor-pointer group hover:bg-blue-500/10 transition-all active:scale-95"
            onClick={() => window.location.href = '/claims/new'}
          >
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-2xl shadow-blue-500/20">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black tracking-tight italic uppercase">Start Assessment</h3>
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Drop your images here or click to browse</p>
            <div className="flex justify-center gap-3">
              {['JPG', 'PNG', 'HEIC', 'MP4'].map(f => (
                <span key={`ft-${f}`} className="text-[10px] font-black px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-400">{f}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works / Process */}
      <section id="process" className="py-32 bg-slate-900/30 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
            <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              Modern <br /><span className="text-blue-500">Architecture</span>
            </h2>
            <p className="text-slate-400 max-w-md md:text-right">Four simple points to get your claim processed through our zero-trust system.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Camera, title: "Upload Photos", desc: "Take clear photos from multiple angles and upload to our secure platform." },
              { icon: Zap, title: "Neural Audit", desc: "Our computer vision AI detects damage types with 98% accuracy." },
              { icon: AlertTriangle, title: "Claim Generated", desc: "A detailed report with cost estimation is automatically generated." },
              { icon: CheckCircle, title: "Get Paid", desc: "Receive approved claim payment directly within 24-48 hours." }
            ].map((step, idx) => (
              <motion.div 
                key={`process-step-${idx}`}
                whileHover={{ y: -10 }}
                className="p-8 glass-panel space-y-6 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 font-black italic text-white/5 text-6xl group-hover:text-blue-500/10 transition-colors">
                  0{idx + 1}
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black italic uppercase leading-none">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="safety" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <div className="text-blue-500 font-black tracking-widest text-xs uppercase mb-2">Technical Specs</div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">System <span className="gradient-text">Intelligence.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Mobile Optimized", desc: "File claims from anywhere using our responsive mobile assessment app." },
              { icon: Search, title: "Fraud Guard", desc: "Advanced patterns flag manipulation and protect both insurers and clients." },
              { icon: BarChart3, title: "Cost Engine", desc: "AI cross-references thousands of repair databases for fair estimates." },
              { icon: Lock, title: "Security First", desc: "Bank-level encryption ensure all your sensitive claim data is safe." },
              { icon: Clock, title: "Instant Response", desc: "No more waiting weeks for adjusters. Get audits finished in seconds." },
              { icon: Shield, title: "Enterprise Grade", desc: "Built with cutting-edge technology for massive scale processing." }
            ].map((f, i) => (
              <div key={`feature-${i}`} className="p-10 border border-white/5 bg-white/2 hover:border-blue-500/30 transition-all group rounded-3xl">
                <f.icon className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-black italic uppercase mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracker Preview */}
      <section id="track" className="py-32 bg-slate-900/50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="glass-panel p-12 border-blue-500/20 shadow-2xl space-y-12 rounded-[50px]">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Audit <span className="text-blue-500">Tracker</span></h2>
               <div className="flex gap-2 w-full md:w-auto">
                 <input 
                  type="text" 
                  placeholder="CLM-2024-001234" 
                  className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-mono text-xs focus:ring-2 ring-blue-500 outline-none flex-1 md:min-w-[200px]"
                 />
                 <button className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-colors">Track</button>
               </div>
             </div>

             <div className="space-y-4">
                <TrackerItem label="Photos Submitted" status="complete" time="10:23 AM" />
                <TrackerItem label="AI Analysis Complete" status="complete" time="10:25 AM" />
                <TrackerItem label="Under Review" status="active" time="Estimated: 2h" />
                <TrackerItem label="Payment Processed" status="pending" time="Pending" />
             </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { val: "50K+", label: "Processed", icon: "🚗" },
             { val: "5 Min", label: "Average", icon: "⚡" },
             { val: "99.2%", label: "Accuracy", icon: "🎯" },
             { val: "4.9/5", label: "Rating", icon: "⭐" }
           ].map((stat, i) => (
             <div key={`stat-${i}`} className="p-8 glass-panel text-center space-y-2 border-white/5">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-black italic uppercase gradient-text">{stat.val}</div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { name: "James Davidson", role: "Tesla Owner", text: "Incredible service! processed in 4 minutes. The AI detected all damage accurately." },
             { name: "Sarah Mitchell", role: "BMW Owner", text: "Used to dread insurance claims. This made it painless. Upload, analyze, approve — done!" },
             { name: "Raj Kumar", role: "Honda Owner", text: "The AI found damage I didn't even see. Comprehensive analysis, fast payment. Revolutionary." }
           ].map((t, i) => (
             <motion.div 
               whileHover={{ y: -5 }}
               key={`testi-${i}`} 
               className="p-8 border border-white/5 bg-slate-950/50 rounded-3xl space-y-6 backdrop-blur-xl"
             >
                <div className="flex text-yellow-500 gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-500" />)}
                </div>
                <p className="text-slate-400 italic text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold border border-white/5">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest italic">{t.name}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase">{t.role}</div>
                  </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" />
        </div>
        
        <div className="max-w-5xl mx-auto glass-panel p-16 md:p-24 text-center space-y-12 border-blue-500/20 relative z-10 shadow-2xl rounded-[60px]">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mx-auto">
            <Zap className="w-3 h-3 animate-pulse" />
            Limited Beta Access
          </div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Ready to <br /><span className="text-blue-500 italic">Smart Claim</span>?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto font-medium">
            Join 50,000+ elite drivers who have bypassed the traditional insurance grind. Precision audit, instant approval.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              to="/auth" 
              className="px-12 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-900/30"
            >
              Start Claim Now
            </Link>
            <button className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xl hover:bg-white/10 transition-all">
              Talk to Expert
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" />
                <span className="text-2xl font-bold tracking-tight italic uppercase">SmartClaim</span>
              </Link>
              <p className="text-slate-600 text-sm max-w-xs uppercase font-bold tracking-widest text-[10px] leading-relaxed">
                Autonomous Vehicle Risk Architectures. Built for the future of digital insurance forensics.
              </p>
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'github'].map(s => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 hover:border-blue-500/30 transition-all">
                    <div className="w-4 h-4 bg-slate-500 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-500">Product</h4>
                <ul className="space-y-3 text-sm text-slate-400 font-bold uppercase italic tracking-tighter">
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Neural-1</a></li>
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Audit-API</a></li>
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Metadata</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-500">Legal</h4>
                <ul className="space-y-3 text-sm text-slate-400 font-bold uppercase italic tracking-tighter">
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Forensics</a></li>
                  <li><a href="#" className="hover:text-blue-500 transition-colors">Security</a></li>
                </ul>
              </div>
              <div className="space-y-6 hidden lg:block">
                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-500">Engine Stats</h4>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Core Status: Online
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            <p>© 2026 SMARTCLAIM TECHNOLOGIES. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-blue-500">Privacy_Protocol</a>
              <a href="#" className="hover:text-blue-500">Service_Agreement</a>
            </div>
          </div>
        </div>
      </footer>
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
          {status === "complete" ? <CheckCircle className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
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
