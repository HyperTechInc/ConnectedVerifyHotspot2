import { UserProfile } from '../types';
import { Activity, Zap, Clock, MapPin, Signal, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusProps {
  profile: UserProfile | null;
}

export function Status({ profile }: StatusProps) {
  const isXiaomi = profile?.deviceType.includes('Xiaomi') || profile?.deviceType.includes('REDMI');
  const isRedmi15 = profile?.deviceType.includes('REDMI 15 4G');

  const stats = [
    { label: 'Signal Strength', value: 'Excellent', icon: Signal, color: 'text-green-500' },
    { label: 'Connection Time', value: '2h 45m', icon: Clock, color: 'text-blue-500' },
    { label: 'Data Used', value: '1.2 GB', icon: Activity, color: 'text-purple-500' },
    { label: 'Speed Boost', value: isRedmi15 ? '+45%' : isXiaomi ? '+20%' : 'None', icon: Zap, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Network Status</h2>
        <p className="text-zinc-400">Real-time connection metrics and device optimization.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:border-zinc-700 transition-all group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-800 group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-24 h-24 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          HyperTech Optimization
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          Your connection is being optimized by HyperTech AI. 
          {isXiaomi ? " Xiaomi/Redmi hardware acceleration is active." : " Standard device optimization is active."}
          {isRedmi15 && " REDMI 15 4G specific bandwidth priority is enabled."}
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-zinc-500">Latency Optimization</span>
            <span className="text-green-500">Active</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
            <span className="text-zinc-500">Bandwidth Allocation</span>
            <span className="text-orange-500">{isRedmi15 ? 'Priority High' : isXiaomi ? 'Priority Med' : 'Standard'}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-3/4 animate-pulse" />
          </div>
        </div>
      </div>

      {profile?.location && (
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-4">
          <MapPin className="w-6 h-6 text-orange-500" />
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Location</p>
            <p className="text-sm font-mono text-zinc-300">
              {profile.location.latitude.toFixed(4)}, {profile.location.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
