import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Gauge, Send, ScanLine } from 'lucide-react';

export default function LiveMonitor({ cameraId }) {
    const [speed, setSpeed] = useState(45);
    const [coordinates, setCoordinates] = useState({ lat: 28.6139, lng: 77.2090 });

    // Simulate telemetry updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSpeed(prev => Math.max(40, Math.min(50, prev + (Math.random() - 0.5) * 2)));
            setCoordinates(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.0001,
                lng: prev.lng + (Math.random() - 0.5) * 0.0001
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const alerts = [
        { id: 1, time: '14:02:05', severity: 'high', text: 'Severe Crack detected - Section 4B', prob: '92%' },
        { id: 2, time: '14:01:42', severity: 'medium', text: 'Missing Fastener - Section 4A', prob: '88%' },
        { id: 3, time: '13:58:12', severity: 'low', text: 'Vegetation Encroachment', prob: '65%' },
        { id: 4, time: '13:55:30', severity: 'medium', text: 'Ballast Deficiency', prob: '78%' },
        { id: 5, time: '13:42:10', severity: 'low', text: 'Minor Track Misalignment', prob: '60%' },
    ];

    return (
        <div className="p-8 h-[calc(100vh-4.5rem)] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">

                {/* Main Video Feed Area */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative aspect-video group shadow-2xl shadow-black/50">

                        {/* Background Gradient simulating video feed */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <div className="w-full h-full opacity-20"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 50% 50%, #3f3f46 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-zinc-700 flex flex-col items-center gap-4 animate-pulse">
                                <ScanLine className="w-16 h-16 opacity-50" />
                            </div>
                        </div>

                        {/* Status Overlay */}
                        <div className="absolute top-6 left-6 flex items-center gap-3">
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/5 text-xs font-mono text-emerald-400 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                LIVE FEED
                            </div>
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/5 text-xs font-mono text-zinc-300">
                                {cameraId} • 1080p • 60FPS
                            </div>
                        </div>

                        {/* Simulated Bounding Boxes */}
                        <div className="absolute top-[30%] left-[20%] w-[15%] h-[10%] border-2 border-red-500/80 bg-red-500/10 backdrop-blur-[2px] animate-pulse flex items-start justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <div className="absolute -top-6 left-0 bg-red-500/90 text-white text-[10px] px-2 py-0.5 rounded-t-sm font-bold flex items-center gap-1.5 backdrop-blur-md">
                                <AlertTriangle className="w-3 h-3" />
                                Severe Crack (92%)
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r-2 border-b-2 border-red-500"></div>
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-red-500"></div>
                        </div>

                        <div className="absolute bottom-[40%] right-[30%] w-[10%] h-[8%] border-2 border-amber-500/80 bg-amber-500/10 backdrop-blur-[2px] flex items-start justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <span className="absolute -top-5 left-0 bg-amber-500/90 text-black text-[10px] px-2 py-0.5 rounded-t-sm font-bold backdrop-blur-md">Missing Fastener (88%)</span>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r-2 border-b-2 border-amber-500"></div>
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-amber-500"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Telemetry Panel */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-indigo-500" /> System Telemetry
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50 group hover:border-zinc-700 transition-all">
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-2 font-bold">Speed</span>
                                    <div className="text-3xl font-bold text-white font-mono flex items-end gap-2">
                                        {speed.toFixed(1)} <span className="text-sm text-zinc-500 font-sans mb-1">km/h</span>
                                    </div>
                                    <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[45%] transition-all duration-500" style={{ width: `${(speed / 100) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50 group hover:border-zinc-700 transition-all">
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-2 font-bold">GPS Accuracy</span>
                                    <div className="text-3xl font-bold text-emerald-400 font-mono flex items-end gap-2">
                                        ±2.4 <span className="text-sm text-zinc-500 font-sans mb-1">m</span>
                                    </div>
                                    <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[90%]"></div>
                                    </div>
                                </div>
                                <div className="col-span-2 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex items-center justify-between group hover:border-zinc-700 transition-all">
                                    <div>
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-wider block mb-1 font-bold">Current Location</span>
                                        <div className="text-zinc-300 font-mono text-sm tracking-tight">{coordinates.lat.toFixed(6)}° N, {coordinates.lng.toFixed(6)}° E</div>
                                    </div>
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Train Classification */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Object Classification</h3>
                            <div className="bg-gradient-to-br from-indigo-500/10 via-zinc-900 to-purple-500/10 border border-indigo-500/20 p-5 rounded-xl flex items-center gap-5 relative overflow-hidden group">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

                                <div className="w-14 h-14 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-inner relative z-10">
                                    <ScanLine className="w-7 h-7" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-white font-bold text-lg">WDG4 Freight</div>
                                    <div className="text-indigo-400 text-xs font-mono mt-0.5">Confidence: 98.2%</div>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                                    <span>Structural Integrity</span>
                                    <span className="text-emerald-400">Optimal</span>
                                </div>
                                <div className="w-full bg-zinc-950 border border-zinc-800 h-2 rounded-full overflow-hidden p-[1px]">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[94%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-lg h-full">
                    <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm">
                        <h3 className="text-zinc-300 font-bold flex items-center gap-2.5 text-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Live Alert Feed
                        </h3>
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-500/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                            4 Critical
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-all duration-300 group hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/20 hover:translate-x-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border shadow-sm ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-900/10' :
                                        alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-900/10' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-900/10'
                                        }`}>
                                        {alert.severity}
                                    </div>
                                    <span className="text-zinc-600 text-[10px] font-mono group-hover:text-zinc-500 transition-colors">{alert.time}</span>
                                </div>
                                <p className="text-zinc-300 text-sm font-medium leading-relaxed mb-3 group-hover:text-white transition-colors">{alert.text}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                    <span className="text-[10px] text-zinc-500 font-mono">AI Conf: <span className={`font-bold ${parseInt(alert.prob) > 90 ? 'text-emerald-500' :
                                        parseInt(alert.prob) > 75 ? 'text-amber-500' : 'text-blue-500'
                                        }`}>{alert.prob}</span></span>
                                    <button className="text-[10px] bg-zinc-800 hover:bg-indigo-600 hover:border-indigo-500 text-zinc-400 hover:text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-sm">
                                        Forward <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}



