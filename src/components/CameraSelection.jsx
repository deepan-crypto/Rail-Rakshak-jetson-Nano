import React, { useState } from 'react';
import { Camera, ChevronRight, Video, Radio, Signal, LayoutGrid, Info, Phone, Globe, Mail } from 'lucide-react';

export default function CameraSelection({ onCameraSelect }) {
    const [activeTab, setActiveTab] = useState('cameras');

    const cameras = [
        { id: 'CAM_01', location: 'Locomotive Front', status: 'LIVE', signal: 92, type: 'Main Feed' },
        { id: 'CAM_02', location: 'Under-Carriage Left', status: 'LIVE', signal: 88, type: 'Thermal' },
        { id: 'CAM_03', location: 'Under-Carriage Right', status: 'LIVE', signal: 87, type: 'Thermal' },
        { id: 'CAM_04', location: 'Rear View', status: 'OFFLINE', signal: 0, type: 'Backup' },
    ];

    const railwayContacts = [
        { zone: 'Northern Railway', hq: 'New Delhi', contact: '011-23386683', email: 'gm@nr.railnet.gov.in' },
        { zone: 'Western Railway', hq: 'Mumbai', contact: '022-22005670', email: 'gm@wr.railnet.gov.in' },
        { zone: 'Southern Railway', hq: 'Chennai', contact: '044-25353148', email: 'gm@sr.railnet.gov.in' },
        { zone: 'Eastern Railway', hq: 'Kolkata', contact: '033-22300444', email: 'gm@er.railnet.gov.in' },
        { zone: 'Central Railway', hq: 'Mumbai', contact: '022-22620944', email: 'gm@cr.railnet.gov.in' },
        { zone: 'South Central Railway', hq: 'Secunderabad', contact: '040-27822874', email: 'gm@scr.railnet.gov.in' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans relative overflow-hidden text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

            {/* Sidebar */}
            <div className="w-64 bg-zinc-900/80 backdrop-blur-md border-r border-zinc-800 flex flex-col z-20">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Camera className="w-5 h-5" />
                        </div>
                        Rail-Rakshak
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1 ml-10">Surveillance Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('cameras')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === 'cameras' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Live Feed Selection
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === 'about' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <Info className="w-4 h-4" />
                        About Project
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === 'contacts' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                    >
                        <Phone className="w-4 h-4" />
                        Emergency Contacts
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 text-center">
                    v2.4.0 • System Secure
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-10 z-10 relative">

                {/* Cameras View */}
                {activeTab === 'cameras' && (
                    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Select Video Source</h1>
                            <p className="text-zinc-400">Choose a connected camera feed to initialize the main dashboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cameras.map((cam) => (
                                <button
                                    key={cam.id}
                                    onClick={() => cam.status === 'LIVE' && onCameraSelect(cam.id)}
                                    disabled={cam.status !== 'LIVE'}
                                    className={`group relative overflow-hidden rounded-xl border transition-all duration-300 text-left ${cam.status === 'LIVE'
                                            ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] cursor-pointer'
                                            : 'bg-zinc-900/50 border-zinc-800/50 opacity-60 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="aspect-video bg-black/50 relative flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"></div>

                                        <Video className={`w-12 h-12 ${cam.status === 'LIVE' ? 'text-zinc-600 group-hover:text-white' : 'text-zinc-700'} transition-colors relative z-10`} />

                                        {cam.status === 'LIVE' && (
                                            <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                                                <span className="flex h-2 w-2 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                </span>
                                                <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">LIVE</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
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

                                        <div className="flex items-center justify-between mt-4 border-t border-zinc-800 pt-3">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Signal className="w-3 h-3" />
                                                <span>Signal: {cam.signal}%</span>
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
                )}

                {/* About View */}
                {activeTab === 'about' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 border-b border-zinc-800 pb-6">
                            <h1 className="text-3xl font-bold mb-2 text-indigo-400">About Rail-Rakshak</h1>
                            <p className="text-zinc-400 text-lg">AI-Powered Railway Safety & Maintenance System</p>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold mb-4 text-white">Project Overview</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Rail-Rakshak is a cutting-edge Edge AI solution designed to revolutionize railway track maintenance in India.
                                    By leveraging high-speed cameras and NVIDIA Jetson Edge devices, the system performs real-time automated visual inspection of railway tracks,
                                    identifying critical faults such as rail fractures, missing fasteners, and ballast deficiency with over 98% accuracy.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold mb-2">Real-Time Vision</h4>
                                    <p className="text-sm text-zinc-500">Processes video feeds at 60FPS to detect minute structural defects instantly.</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                                    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                                        <Signal className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold mb-2">GPS Tagging</h4>
                                    <p className="text-sm text-zinc-500">Geo-tags every defect for precise location tracking and rapid maintenance crew deployment.</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold mb-2">IRPSM Integration</h4>
                                    <p className="text-sm text-zinc-500">Seamlessly pushes defects to the Indian Railways Project Sanctions Management portal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts View */}
                {activeTab === 'contacts' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 border-b border-zinc-800 pb-6">
                            <h1 className="text-3xl font-bold mb-2 text-blue-400">Emergency & General Contacts</h1>
                            <p className="text-zinc-400">Indian Railways Zonal Headquarters Directory</p>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                            <div className="grid grid-cols-4 bg-zinc-800/50 p-4 font-bold text-xs uppercase text-zinc-500 tracking-wider">
                                <div>Zone</div>
                                <div>Headquarters</div>
                                <div>Control Room</div>
                                <div>Email</div>
                            </div>
                            <div>
                                {railwayContacts.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-4 p-4 border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors items-center">
                                        <div className="font-medium text-zinc-200">{item.zone}</div>
                                        <div className="text-sm text-zinc-400 flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-zinc-600" />
                                            {item.hq}
                                        </div>
                                        <div className="text-sm text-blue-400 font-mono flex items-center gap-2">
                                            <Phone className="w-3 h-3" />
                                            {item.contact}
                                        </div>
                                        <div className="text-sm text-zinc-400 flex items-center gap-2 overflow-hidden text-ellipsis">
                                            <Mail className="w-3 h-3 text-zinc-600" />
                                            {item.email}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                            <Info className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div>
                                <h4 className="text-amber-500 font-bold text-sm mb-1">National Emergency Helpline</h4>
                                <p className="text-zinc-400 text-xs">For immediate assistance regarding rail accidents or safety hazards, please dial <span className="text-white font-bold">139</span> (Rail Madad) available 24/7 across all states.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
