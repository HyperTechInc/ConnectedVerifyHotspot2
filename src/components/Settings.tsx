import { useState } from 'react';
import { UserProfile } from '../types';
import { Moon, Sun, Shield, Lock, Smartphone, Bell, Globe, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsProps {
  profile: UserProfile | null;
}

export function Settings({ profile }: SettingsProps) {
  const [darkMode, setDarkMode] = useState(true);

  const sections = [
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', icon: Moon, value: darkMode ? 'On' : 'Off', action: () => setDarkMode(!darkMode) },
        { label: 'Language', icon: Globe, value: 'English', action: () => {} },
      ]
    },
    {
      title: 'Security',
      items: [
        { label: 'Two-Factor Auth', icon: Shield, value: 'Enabled', action: () => {} },
        { label: 'Passkey Login', icon: Lock, value: profile?.isPermanent ? 'Active' : 'Setup', action: () => {} },
      ]
    },
    {
      title: 'Network',
      items: [
        { label: 'Device Tracking', icon: Smartphone, value: 'Always', action: () => {} },
        { label: 'Notifications', icon: Bell, value: 'On', action: () => {} },
      ]
    }
  ];

  return (
    <div className="space-y-8 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h2>
        <p className="text-zinc-400">Customize your HyperTech experience.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">{section.title}</h3>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={cn(
                      "w-full flex items-center justify-between p-5 hover:bg-zinc-800/50 transition-all",
                      idx !== section.items.length - 1 && "border-b border-zinc-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="font-bold text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-500">{item.value}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-center">
        <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">App Version 2.5.0-Hyper</p>
        <p className="text-[10px] text-zinc-700 mt-1">© 2026 HyperTech Inc.</p>
      </div>
    </div>
  );
}
