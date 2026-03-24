import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, addDoc, getDocs, where } from 'firebase/firestore';
import { UserProfile, AccessRequest, HotspotCode, GlobalSettings } from '../types';
import { Loader2, ShieldCheck, User, Smartphone, MapPin, Check, X, Ban, Trash2, Plus, Zap, Settings, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminDashboardProps {
  profile: UserProfile | null;
}

export function AdminDashboard({ profile }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [codes, setCodes] = useState<HotspotCode[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;

    // Listen for users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() as UserProfile, id: doc.id })));
    });

    // Listen for requests
    const unsubscribeRequests = onSnapshot(collection(db, 'access_requests'), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ ...doc.data() as AccessRequest, id: doc.id })));
    });

    // Listen for codes
    const unsubscribeCodes = onSnapshot(collection(db, 'hotspot_codes'), (snapshot) => {
      setCodes(snapshot.docs.map(doc => ({ ...doc.data() as HotspotCode, id: doc.id })));
    });

    // Listen for settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as GlobalSettings;
        setSettings(data);
        setWifiSSID(data.wifiSSID || '');
        setWifiPassword(data.wifiPassword || '');
      }
    });

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeRequests();
      unsubscribeCodes();
      unsubscribeSettings();
    };
  }, [profile]);

  const handleApproveRequest = async (request: AccessRequest) => {
    await updateDoc(doc(db, 'access_requests', request.id), { status: 'approved' });
    // Also update user status if needed
  };

  const handleRejectRequest = async (request: AccessRequest) => {
    await updateDoc(doc(db, 'access_requests', request.id), { status: 'rejected' });
  };

  const handleBanUser = async (user: UserProfile) => {
    await updateDoc(doc(db, 'users', user.uid), { status: 'banned' });
  };

  const handleUnbanUser = async (user: UserProfile) => {
    await updateDoc(doc(db, 'users', user.uid), { status: 'active' });
  };

  const handleKickUser = async (user: UserProfile) => {
    // Kicking just removes their approved access request
    const q = query(collection(db, 'access_requests'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d) => {
      await deleteDoc(doc(db, 'access_requests', d.id));
    });
  };

  const generateCode = async (type: 'permanent' | 'email' | 'phone' | 'qr') => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'hotspot_codes'), {
      code,
      type,
      isUsed: false,
      createdBy: profile?.uid,
      createdAt: new Date().toISOString()
    });
  };

  const toggleAutoApprove = async () => {
    if (!settings) return;
    await updateDoc(doc(db, 'settings', 'config'), { autoApprove: !settings.autoApprove });
  };

  const saveWifiSettings = async () => {
    await setDoc(doc(db, 'settings', 'config'), {
      ...settings,
      wifiSSID,
      wifiPassword,
      wifiSecurity: 'WPA'
    }, { merge: true });
    alert('WiFi Settings Updated!');
  };

  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`WIFI:S:${wifiSSID};T:WPA;P:${wifiPassword};;`)}`;

  if (loading) return <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mt-12" />;

  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Admin Dashboard</h2>
          <p className="text-zinc-500 text-sm">Manage users, requests, and network settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoApprove}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
              settings?.autoApprove ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-zinc-800 border-zinc-700 text-zinc-400"
            )}
          >
            Auto-Approve: {settings?.autoApprove ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* WiFi Configuration */}
      <section className="p-6 bg-orange-600/10 border border-orange-600/20 rounded-3xl">
        <div className="flex items-center gap-2 mb-6">
          <QrCode className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-bold">Hotspot WiFi Share</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Hotspot Name (SSID)</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="e.g. My Redmi 15"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Hotspot Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="WiFi Password"
              />
            </div>
            <button
              onClick={saveWifiSettings}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20"
            >
              Update WiFi QR
            </button>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
            {wifiSSID ? (
              <>
                <img src={wifiQrUrl} alt="WiFi QR" className="w-40 h-40" />
                <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-tighter">Scan to Connect to WiFi</p>
              </>
            ) : (
              <p className="text-zinc-400 text-xs text-center italic">Enter WiFi details to generate QR</p>
            )}
          </div>
        </div>
      </section>

      {/* Access Requests */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-bold">Access Requests</h3>
          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 text-[10px] font-bold rounded-full">
            {requests.filter(r => r.status === 'pending').length} PENDING
          </span>
        </div>
        <div className="grid gap-4">
          {requests.filter(r => r.status === 'pending').map((request) => (
            <div key={request.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-bold text-white">{request.username}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-zinc-500 font-mono">Code: {request.code}</p>
                    {request.hasDownloadedConfig ? (
                      <span className="text-[8px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded uppercase">Verified</span>
                    ) : (
                      <span className="text-[8px] font-bold bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded uppercase">Limited</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApproveRequest(request)}
                  className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleRejectRequest(request)}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {requests.filter(r => r.status === 'pending').length === 0 && (
            <p className="text-center py-8 text-zinc-600 font-mono text-xs uppercase tracking-widest">No pending requests</p>
          )}
        </div>
      </section>

      {/* User Management */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-bold">Account Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Device</th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-bold text-white">{u.username}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Smartphone className="w-3 h-3" />
                      {u.deviceType}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                      u.status === 'active' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleKickUser(u)}
                        className="p-1.5 text-zinc-500 hover:text-orange-500 transition-colors"
                        title="Kick"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      {u.status === 'active' ? (
                        <button
                          onClick={() => handleBanUser(u)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                          title="Ban"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnbanUser(u)}
                          className="p-1.5 text-zinc-500 hover:text-green-500 transition-colors"
                          title="Unban"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Code Generation */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-bold">Access Codes</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => generateCode('permanent')} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">Permanent</button>
            <button onClick={() => generateCode('qr')} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-orange-600/20">Generate QR</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {codes.map((c) => (
            <div key={c.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
              <p className="text-lg font-mono font-bold text-orange-500 tracking-widest mb-1">{c.code}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">{c.type}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
