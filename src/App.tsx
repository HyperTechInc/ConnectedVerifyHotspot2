import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole, UserStatus } from './types';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { HotspotAccess } from './components/HotspotAccess';
import { AdminDashboard } from './components/AdminDashboard';
import { Chat } from './components/Chat';
import { Account } from './components/Account';
import { Status } from './components/Status';
import { Settings } from './components/Settings';
import { AIDashboard } from './components/AIDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500/30">
        <Routes>
          {!user ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <Route element={<Layout profile={profile} />}>
              <Route path="/" element={<HotspotAccess profile={profile} />} />
              <Route path="/chat" element={<Chat profile={profile} />} />
              <Route path="/account" element={<Account profile={profile} setProfile={setProfile} />} />
              <Route path="/status" element={<Status profile={profile} />} />
              <Route path="/settings" element={<Settings profile={profile} />} />
              {profile?.role === 'admin' && (
                <>
                  <Route path="/admin" element={<AdminDashboard profile={profile} />} />
                  <Route path="/ai-dashboard" element={<AIDashboard profile={profile} />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </div>
    </Router>
  );
}
