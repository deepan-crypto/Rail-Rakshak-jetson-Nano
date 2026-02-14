import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('railRakshakToken', data.token);
                localStorage.setItem('railRakshakRole', data.role);
                onLoginSuccess(data.role);
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const defaultCreds = [
        { u: 'admin', p: 'admin123' },
        { u: 'controller', p: 'railsafe2024' },
        { u: 'supervisor', p: 'track_secure' },
        { u: 'guest', p: 'view_only' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=2084&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>

            <div className="bg-black/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Rail-Rakshak Portal</h1>
                    <p className="text-zinc-500 text-sm mt-2">Secure Access Gateway</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 w-5 h-5 text-zinc-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mb-4">Default Access Credentials</p>
                    <div className="grid grid-cols-2 gap-2">
                        {defaultCreds.map((cred, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-2 rounded text-xs cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                                onClick={() => { setUsername(cred.u); setPassword(cred.p); }}>
                                <span className="text-zinc-400">{cred.u}</span>
                                <span className="text-zinc-600 mx-1">/</span>
                                <span className="text-emerald-500/60 font-mono">{cred.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
