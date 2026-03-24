import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { User, Mail, Camera, Smartphone, MapPin, ShieldCheck, Loader2, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccountProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export function Account({ profile, setProfile }: AccountProps) {
  const [username, setUsername] = useState(profile?.username || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        username,
        photoURL
      });
      setProfile({ ...profile, username, photoURL });
      alert('Profile updated!');
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <div className="relative inline-block">
          <img 
            src={profile?.photoURL} 
            className="w-24 h-24 rounded-3xl object-cover border-4 border-zinc-800 shadow-2xl shadow-orange-600/10" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-2 -right-2 p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white mt-4">{profile?.username}</h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{profile?.role}</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Camera className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Profile Picture URL"
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>

      <div className="grid gap-4 max-w-md mx-auto">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <Smartphone className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Device Type</p>
            <p className="text-sm font-bold text-zinc-200">{profile?.deviceType}</p>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <Mail className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</p>
            <p className="text-sm font-bold text-zinc-200">{profile?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
