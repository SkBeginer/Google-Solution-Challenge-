import { useState } from "react";
import { UserProfile } from "../types";
import { auth, db } from "../lib/firebase";
import { updateProfile, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Shield, User, Mail, Bell, Globe, Lock, Save, Loader2, Fingerprint, Smartphone, Key, History, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsPageProps {
  user: UserProfile;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [name, setName] = useState(user.displayName);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await updateDoc(doc(db, "users", user.userId), { displayName: name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ type: 'success', text: "Password reset email sent!" });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setResetLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  const lastSignIn = auth.currentUser?.metadata.lastSignInTime 
    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleString() 
    : "N/A";
  
  const createdAt = auth.currentUser?.metadata.creationTime 
    ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString() 
    : "N/A";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight italic uppercase">System <span className="text-blue-500 not-italic tracking-tighter">Preferences</span></h1>
        <p className="text-slate-500 font-medium italic mt-1">Configure your AI shielding environment.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
           {[
             { label: "Profile", icon: User },
             { label: "Security", icon: Lock },
             { label: "Notifications", icon: Bell },
             { label: "Appearance", icon: Globe },
           ].map(item => (
             <button 
               key={item.label}
               onClick={() => setActiveTab(item.label)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.label ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
             >
                <item.icon className="w-5 h-5" />
                {item.label}
             </button>
           ))}
        </div>

        <div className="md:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "Profile" && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <form onSubmit={handleUpdate} className="glass-panel p-8 space-y-8">
                   <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-2xl font-bold text-blue-500">
                         {user.displayName ? user.displayName[0] : 'U'}
                      </div>
                      <div>
                         <h3 className="font-bold text-white">Public Profile</h3>
                         <p className="text-xs text-slate-500 font-medium italic underline decoration-blue-500/30 underline-offset-4 tracking-widest uppercase">Member ID: {user.userId.slice(0, 8)}...</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Display Name</label>
                       <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                         <input 
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                         />
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email (Authenticated)</label>
                       <div className="relative opacity-50">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                         <input 
                           type="email"
                           value={user.email}
                           disabled
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white cursor-not-allowed"
                         />
                       </div>
                     </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      {success && <p className="text-green-400 text-sm font-bold flex items-center gap-2 italic">Settings Saved Successfully</p>}
                      <div className="flex gap-3 ml-auto">
                         <button type="button" className="px-6 py-3 font-bold text-slate-500 hover:text-white transition-all">Cancel</button>
                         <button 
                           type="submit"
                           disabled={loading}
                           className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/20 disabled:opacity-50 transition-all active:scale-95"
                         >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                           Update Registry
                         </button>
                      </div>
                   </div>
                </form>

                <div className="glass-panel p-8 border-red-500/10">
                   <h3 className="text-lg font-bold text-red-400 mb-2 italic tracking-tighter uppercase">Danger Zone</h3>
                   <p className="text-xs text-slate-500 mb-6 font-medium">Once you delete your profile data, there is no going back. Please be certain.</p>
                   <button className="px-6 py-3 bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-all">
                     Deactivate Shield Instance
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === "Security" && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-panel p-8 space-y-10">
                   <div>
                      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" /> 
                        Login & Authentication
                      </h2>
                      <p className="text-xs text-slate-500 font-medium italic">Manage how you access your account and stay secure.</p>
                   </div>

                   <div className="space-y-4">
                      <div className="grid gap-4">
                         <button 
                           onClick={handlePasswordReset}
                           disabled={resetLoading}
                           className="flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group disabled:opacity-50"
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                  {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                               </div>
                               <div className="text-left">
                                  <p className="font-bold text-white text-sm">Change Password / Reset</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Authentication Provider: {auth.currentUser?.providerData[0]?.providerId || 'password'}</p>
                               </div>
                            </div>
                            <div className="text-slate-600 group-hover:text-blue-500 transition-colors mr-2">→</div>
                         </button>

                         <button className="flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                  <Smartphone className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Status: Verified via Email</p>
                               </div>
                            </div>
                            <div className="relative w-12 h-6 bg-blue-600 rounded-full">
                               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                         </button>

                         <button className="flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                  <Fingerprint className="w-5 h-5" />
                               </div>
                               <div className="text-left">
                                  <p className="font-bold text-white text-sm">Biometric Login</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Enable for Mobile App Sync</p>
                               </div>
                            </div>
                            <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                               <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
                            </div>
                         </button>
                      </div>
                   </div>
                </div>

                <div className="glass-panel p-8 space-y-10">
                   <div>
                      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-500" /> 
                        Account Protection
                      </h2>
                      <p className="text-xs text-slate-500 font-medium italic">Monitor recent activity and manage sessions.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-green-500" />
                               <div>
                                  <p className="text-sm font-bold text-white">Current Session</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black">Detected Gateway • {lastSignIn}</p>
                                </div>
                            </div>
                            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-black tracking-widest uppercase">ACTIVE NOW</span>
                         </div>
                         
                         <div className="flex items-center justify-between p-4 bg-white/1 rounded-xl border border-transparent">
                            <div className="flex items-center gap-3 opacity-50">
                               <div className="w-2 h-2 rounded-full bg-slate-500" />
                               <div>
                                  <p className="text-sm font-bold text-white">Registry Created</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-black">System Identity Generated • {createdAt}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex gap-4">
                         <button className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white hover:bg-white/10 transition-all">
                            Login Activity
                         </button>
                         <button 
                           onClick={handleLogoutAll}
                           className="flex-1 px-6 py-3 bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                         >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Logout & Termination
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {(activeTab === "Notifications" || activeTab === "Appearance") && (
              <motion.div
                key="empty-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                   <Globe className="w-8 h-8 opacity-20" />
                </div>
                <div>
                   <h3 className="font-bold text-white uppercase tracking-tighter italic text-xl">{activeTab} Modules</h3>
                   <p className="text-sm text-slate-500 max-w-xs">This configuration section is currently under construction in the AI nexus.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
