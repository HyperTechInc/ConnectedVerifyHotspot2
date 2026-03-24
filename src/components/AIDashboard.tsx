import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Cpu, Zap, ShieldAlert, BarChart3, BrainCircuit } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AIDashboardProps {
  profile: UserProfile | null;
}

export function AIDashboard({ profile }: AIDashboardProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Provide a brief, high-tech sounding status report for a hotspot management system. Mention device optimization and network security. Keep it under 100 words.',
        });
        setInsight(response.text || 'AI Insight unavailable.');
      } catch (err) {
        console.error('AI Insight error:', err);
        setInsight('AI Insight system offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, []);

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">AI Dashboard</h2>
        <p className="text-zinc-400">Intelligent network monitoring and insights.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'AI Moderation', value: 'Active', icon: ShieldAlert, color: 'text-green-500' },
          { label: 'Network Load', value: 'Optimal', icon: BarChart3, color: 'text-blue-500' },
          { label: 'Device Boost', value: 'Enabled', icon: Zap, color: 'text-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-center">
            <stat.icon className={cn("w-8 h-8 mx-auto mb-3", stat.color)} />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-24 h-24 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-500" />
          Neural Insight Report
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl font-mono text-sm text-zinc-300 leading-relaxed italic">
              "{insight}"
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-800/30 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Threat Detection</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-green-500">Secure</span>
                </div>
              </div>
              <div className="p-4 bg-zinc-800/30 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">AI Optimization</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-orange-500">98.4% Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
