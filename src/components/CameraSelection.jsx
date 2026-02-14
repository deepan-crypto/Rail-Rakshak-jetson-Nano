import React from 'react';
import { Camera, ChevronRight, Video, Radio, Signal } from 'lucide-react';

export default function CameraSelection({ onCameraSelect }) {
    const cameras = [
        { id: 'CAM_01', location: 'Locomotive Front', status: 'LIVE', signal: 92, type: 'Main Feed' },
        { id: 'CAM_02', location: 'Under-Carriage Left', status: 'LIVE', signal: 88, type: 'Thermal' },
        { id: 'CAM_03', location: 'Under-Carriage Right', status: 'LIVE', signal: 87, type: 'Thermal' },
        { id: 'CAM_04', location: 'Rear View', status: 'OFFLINE', signal: 0, type: 'Backup' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

            <div className="max-w-4xl w-full z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Select Video Source</h2>
                    <p className="text-zinc-500">Choose a connected camera feed to initialize monitoring</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cameras.map((cam) => (
                        <button
                            key={cam.id}
                            onClick={() => cam.status === 'LIVE' && onCameraSelect(cam.id)}
                            disabled={cam.status !== 'LIVE'}
                            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${cam.status === 'LIVE'
                                    ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] cursor-pointer'
                                    : 'bg-zinc-900/50 border-zinc-800/50 opacity-60 cursor-not-allowed'
                                }`}
                        >
                            <div className="aspect-video bg-black/50 relative flex items-center justify-center">
                                {/* Mock Thumbnail Content */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"></div>

                                <Video className={`w-12 h-12 ${cam.status === 'LIVE' ? 'text-zinc-600 group-hover:text-white' : 'text-zinc-700'} transition-colors relative z-10`} />

                                {cam.status === 'LIVE' && (
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">LIVE</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 text-left">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">{cam.id}</h3>
                                        <p className="text-zinc-400 text-sm">{cam.location}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cam.status === 'LIVE'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {cam.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <Signal className="w-3 h-3" />
                                        <span>Signal Quality: {cam.signal}%</span>
                                    </div>
                                    {cam.status === 'LIVE' && (
                                        <div className="bg-zinc-800 p-1.5 rounded-full text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
