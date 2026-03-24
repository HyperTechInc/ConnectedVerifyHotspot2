import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Loader2, User, Mail, Lock, Camera, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('Unknown Device');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Redmi 15 4G/i.test(ua)) {
      setDeviceInfo('REDMI 15 4G (High Speed Boost)');
    } else if (/Xiaomi/i.test(ua) || /Redmi/i.test(ua)) {
      setDeviceInfo('Xiaomi Device (Speed Boost)');
    } else {
      setDeviceInfo('Standard Device');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const finalPhotoURL = photoURL || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/1200px-Xiaomi_logo_%282021-%29.svg.png';

        await updateProfile(user, {
          displayName: username,
          photoURL: finalPhotoURL,
        });

        const profile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          username: username,
          photoURL: finalPhotoURL,
          role: email === 'real.hypertech.inc@gmail.com' ? 'admin' : 'user',
          status: 'active',
          deviceType: deviceInfo,
          isPermanent: false,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), profile);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error Details:', err);
      if (err.code === 'auth/network-request-failed') {
        setError('Network error: Please check if your App URL is added to "Authorized Domains" in the Firebase Console.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateRandomUsername = () => {
    const names = ['HyperUser', 'TechWizard', 'NetRunner', 'CloudWalker', 'DataGhost', 'SignalMaster'];
    const random = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
    setUsername(random);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-950">
      <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-zinc-500 text-sm mt-1">HyperTech Hotspot Management</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-24 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomUsername}
                  className="absolute right-3 top-3 text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400"
                >
                  Random
                </button>
              </div>

              <div className="relative">
                <Camera className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Profile Picture URL (Optional)"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
              </div>

              <div className="p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-xl flex items-center gap-3">
                <Globe className="w-5 h-5 text-orange-500" />
                <div className="text-xs">
                  <p className="text-zinc-400">Detected Device:</p>
                  <p className="font-mono font-bold text-zinc-200">{deviceInfo}</p>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
          {isLogin && (
            <button
              onClick={handleForgotPassword}
              className="text-xs text-zinc-500 hover:text-orange-500 transition-colors"
            >
              Forgot your account credentials?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
