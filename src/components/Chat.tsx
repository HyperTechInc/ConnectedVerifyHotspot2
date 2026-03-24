import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Send, ShieldAlert, User, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatProps {
  profile: UserProfile | null;
}

export function Chat({ profile }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data() as ChatMessage, id: doc.id }));
      setMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    setModerating(true);
    try {
      // AI Moderation
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Is the following message toxic, inappropriate, or harmful? Answer only with "SAFE" or "UNSAFE". Message: "${newMessage}"`,
      });

      const moderationResult = response.text?.trim().toUpperCase();
      
      if (moderationResult === 'UNSAFE') {
        alert('Your message was flagged by AI moderation as inappropriate.');
        setModerating(false);
        return;
      }

      await addDoc(collection(db, 'chat_messages'), {
        text: newMessage,
        senderUid: profile.uid,
        senderName: profile.username,
        createdAt: new Date().toISOString(),
        isModerated: true
      });

      setNewMessage('');
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setModerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          const isOwn = msg.senderUid === profile?.uid;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%] gap-1",
                isOwn ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {!isOwn && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{msg.senderName}</span>}
              </div>
              <div
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm shadow-sm",
                  isOwn ? "bg-orange-600 text-white rounded-tr-none shadow-orange-600/20" : "bg-zinc-800 text-zinc-200 rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-zinc-600 font-mono mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-3">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder={moderating ? "AI Moderating..." : "Type a message..."}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={moderating}
          />
        </div>
        <button
          type="submit"
          disabled={moderating || !newMessage.trim()}
          className="p-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white rounded-xl shadow-lg shadow-orange-600/20 transition-all"
        >
          {moderating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
