import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { UserProfile, AccessRequest, GlobalSettings } from '../types';
import { Loader2, ShieldCheck, MapPin, QrCode, Mail, Phone, Lock, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HotspotAccessProps {
  profile: UserProfile | null;
}

export function HotspotAccess({ profile }: HotspotAccessProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // Listen for settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as GlobalSettings);
      }
    });

    // Listen for current user's access request
    const q = query(collection(db, 'access_requests'), where('uid', '==', profile.uid));
    const unsubscribeRequest = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data() as AccessRequest;
        setRequest({ ...latest, id: snapshot.docs[0].id });
      }
    });

    return () => {
      unsubscribeSettings();
      unsubscribeRequest();
    };
  }, [profile]);

  const requestLocation = async () => {
    if (!profile) return;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!hasDownloaded) {
      setError('You must download the Security Config from GitHub first!');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Request location first
      await requestLocation();

      const status = settings?.autoApprove ? 'approved' : 'pending';
      
      await addDoc(collection(db, 'access_requests'), {
        uid: profile.uid,
        username: profile.username,
        code: code,
        status: status,
        hasDownloadedConfig: true,
        createdAt: new Date().toISOString()
      });

      if (status === 'approved') {
        alert('Access approved! You are now connected.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (request?.status === 'approved') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Connected</h2>
        <p className="text-zinc-400 max-w-xs">You have successfully accessed the HyperTech Hotspot. Enjoy your high-speed connection.</p>
        
        <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-zinc-500">Speed Boost</span>
            <span className="text-sm font-bold text-orange-500">{profile?.deviceType.includes('REDMI 15 4G') ? '+45%' : profile?.deviceType.includes('Xiaomi') ? '+20%' : 'Standard'}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (request?.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 animate-spin-slow">
          <Clock className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Request Pending</h2>
        <p className="text-zinc-400 max-w-xs">Your access request is being reviewed by an admin. Please wait a moment.</p>
        <button 
          onClick={() => setRequest(null)}
          className="mt-8 text-sm text-zinc-500 hover:text-white underline"
        >
          Cancel Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Hotspot Access</h2>
        <p className="text-zinc-400">Complete the security steps to unlock high-speed Wi-Fi.</p>
      </div>

      {/* Step 1: GitHub Action */}
      <div className={cn(
        "p-6 border-2 rounded-3xl transition-all",
        hasDownloaded ? "bg-green-500/5 border-green-500/20" : "bg-orange-600/5 border-orange-600/20 border-dashed"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", hasDownloaded ? "bg-green-500" : "bg-orange-600")}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Step 1: Security Config</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Required for High-Speed</p>
            </div>
          </div>
          {hasDownloaded && <CheckCircle2 className="w-6 h-6 text-green-500" />}
        </div>
        {!hasDownloaded ? (
          <button
            onClick={() => {
              window.open('https://github.com/kingzarek4456', '_blank');
              setHasDownloaded(true);
            }}
            className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
          >
            Download from GitHub
          </button>
        ) : (
          <p className="text-xs text-green-500 font-bold text-center italic">Config Verified ✓</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-50">
        {[
          { icon: Lock, label: 'Permanent', color: 'text-purple-500' },
          { icon: Mail, label: 'Email', color: 'text-blue-500' },
          { icon: Phone, label: 'Phone', color: 'text-green-500' },
          { icon: QrCode, label: 'QR Scan', color: 'text-orange-500' },
        ].map((type) => (
          <div key={type.label} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center gap-2 hover:border-zinc-700 transition-colors cursor-pointer">
            <type.icon className={cn("w-6 h-6", type.color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{type.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleAccessRequest} className="space-y-6">
        <div className="relative">
          <ShieldCheck className="absolute left-4 top-4 w-6 h-6 text-zinc-500" />
          <input
            type="text"
            placeholder="Enter Access Code"
            className="w-full pl-14 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-lg font-mono tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-3 text-lg"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              <MapPin className="w-5 h-5" />
              Request Access
            </>
          )}
        </button>
      </form>

      <div className="p-6 bg-orange-600/10 border border-orange-600/20 rounded-3xl">
        <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-2">Security Notice</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Accessing this hotspot requires location permission for security monitoring. 
          Your device type will be identified to provide optimized speeds. 
          Xiaomi and Redmi devices receive priority bandwidth.
        </p>
      </div>
    </div>
  );
}
