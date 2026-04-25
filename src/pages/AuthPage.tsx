import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Shield, Mail, Lock, User, Triangle, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          userId: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: "user",
          createdAt: new Date().toISOString()
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await setDoc(doc(db, "users", result.user.uid), {
          userId: result.user.uid,
          email: result.user.email,
          displayName: name,
          role: "user",
          createdAt: new Date().toISOString()
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please switch to Sign In.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Pane - Art */}
      <div className="hidden lg:flex flex-col justify-between bg-blue-600 p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800/20 mix-blend-multiply"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        
        <Link to="/" className="flex items-center gap-3 relative z-10 text-white">
          <Shield className="w-8 h-8" />
          <span className="font-bold text-2xl tracking-tighter italic uppercase">ShieldAI</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="text-6xl font-bold tracking-tight text-white leading-tight">
            Protecting your <br /> movement with <br /> <span className="text-blue-200">Intelligence.</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-md opacity-80">
            Join thousands of policyholders who trust ShieldAI for instant, transparent vehicle claim processing.
          </p>
        </div>

        <div className="relative z-10 flex gap-12 font-mono text-xs text-blue-200">
           <div className="flex flex-col gap-1">
             <span className="opacity-50 font-bold uppercase tracking-widest">Version</span>
             <span>3.1-STABLE</span>
           </div>
           <div className="flex flex-col gap-1">
             <span className="opacity-50 font-bold uppercase tracking-widest">Region</span>
             <span>ASIA_SOUTH_Vite</span>
           </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8 relative lg:hidden">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-slate-500 text-center mb-10">
            {isLogin ? "Enter your credentials to access your dashboard" : "Register to start your claim process automatically"}
          </p>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="group space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all py-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-900/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-slate-950 px-4 text-slate-600">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-2xl border border-white/10 font-bold transition-all flex items-center justify-center gap-3"
          >
            <Triangle className="w-5 h-5 fill-white text-white rotate-180" />
            Google Workspace
          </button>

          <p className="text-center mt-10 text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 font-bold hover:underline"
            >
              {isLogin ? "Register now" : "Sign in here"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
