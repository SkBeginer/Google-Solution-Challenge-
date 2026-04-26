/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "./types";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewClaim from "./pages/NewClaim";
import ClaimView from "./pages/ClaimView";
import AdminPanel from "./pages/AdminPanel";
import SettingsPage from "./pages/SettingsPage";
import Layout from "./components/Layout";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const path = `users/${firebaseUser.uid}`;
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            // If authenticated but no profile, create a default profile
            const newProfile: UserProfile = {
              userId: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Shield User",
              role: "user",
              createdAt: new Date().toISOString()
            };
            setUser(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-blue-400 font-medium font-sans">Shielding your assets...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        
        <Route element={<Layout user={user} />}>
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
          <Route path="/claims/new" element={user ? <NewClaim user={user} /> : <Navigate to="/auth" />} />
          <Route path="/claims/:id" element={user ? <ClaimView user={user} /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={user ? <SettingsPage user={user} /> : <Navigate to="/auth" />} />
          <Route path="/admin" element={user?.role === "admin" ? <AdminPanel user={user} /> : <Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

