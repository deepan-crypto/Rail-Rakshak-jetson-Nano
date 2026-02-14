import React from 'react';
import { Signal, Cpu, ShieldCheck, Bell, User } from 'lucide-react';

export default function Header({ cameraId, user }) {
    return (
        <header className="h-18 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-20 shadow-lg shadow-black/20">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase font-mono">System Live</span>
                </div>
                <h2 className="text-zinc-500 text-xs font-mono hidden md:block tracking-wide">
                    SOURCE: <span className="text-zinc-200 font-bold">{cameraId || 'NO_SIGNAL'}</span>
                </h2>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 text-zinc-400 group">
                    <Signal className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs font-mono tracking-tight group-hover:text-zinc-300 transition-colors">GSM: <span className="text-zinc-200 font-bold">4G LTE (92%)</span></span>
                </div>

                <div className="flex items-center gap-3 text-zinc-400 group">
                    <Cpu className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-mono tracking-tight group-hover:text-zinc-300 transition-colors">TEMP: <span className="text-amber-400 font-bold">42°C</span></span>
                </div>

                <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-950 animate-pulse"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-zinc-300 capitalize">{user || 'Guest'}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Operator</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                            <User className="w-4.5 h-4.5 text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
