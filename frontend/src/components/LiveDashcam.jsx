import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, MapPin, Clock, Wifi, WifiOff, Video } from 'lucide-react';
import io from 'socket.io-client';

const LiveDashcam = () => {
    const [telemetryData, setTelemetryData] = useState(null);
    const [hazardLog, setHazardLog] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [imageData, setImageData] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Connect to WebSocket server
        // Adjust the URL based on your deployment environment
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        
        socketRef.current = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });

        // Handle connection
        socketRef.current.on('connect', () => {
            console.log('✅ Connected to WebSocket');
            setIsConnected(true);
            setConnectionStatus('Connected');
        });

        // Handle connection status
        socketRef.current.on('connection-status', (data) => {
            console.log('📡 Connection status:', data);
            setConnectionStatus(`Connected (${data.clientId.substring(0, 8)}...)`);
        });

        // Handle real-time telemetry updates
        socketRef.current.on('telemetry-update', (data) => {
            console.log('🎥 Telemetry received:', data);
            setTelemetryData(data);
            setImageData(data.image_stream);

            // Add to hazard log if hazards detected
            if (data.hazards && data.hazards.length > 0) {
                data.hazards.forEach((hazard) => {
                    setHazardLog((prevLog) => [
                        {
                            id: `${Date.now()}-${Math.random()}`,
                            timestamp: data.timestamp,
                            gps: data.gps_location,
                            hazardName: hazard.name,
                            confidence: hazard.confidence,
                            class: hazard.class,
                            receivedAt: new Date().toISOString()
                        },
                        ...prevLog
                    ].slice(0, 50)); // Keep last 50 hazards
                });
            }
        });

        // Handle disconnection
        socketRef.current.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
            setIsConnected(false);
            setConnectionStatus('Disconnected - Reconnecting...');
        });

        // Handle errors
        socketRef.current.on('error', (error) => {
            console.error('⚠️ Socket error:', error);
            setConnectionStatus('Error connecting');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const hazardColorMap = {
        'Pothole': 'from-red-600 to-red-700',
        'Crack': 'from-yellow-600 to-yellow-700',
        'Debris': 'from-orange-600 to-orange-700',
        'Obstacle': 'from-purple-600 to-purple-700'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Video className="w-8 h-8 text-cyan-500" />
                        <h1 className="text-2xl font-bold text-white">Live Dashcam</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <>
                                <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
                                <span className="text-sm text-green-400">{connectionStatus}</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-400">{connectionStatus}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Feed Section - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
                            {/* Camera Feed */}
                            <div className="aspect-video bg-black relative">
                                {imageData ? (
                                    <img
                                        src={imageData}
                                        alt="Live Camera Feed"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400">Waiting for video stream...</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Real-time Status Overlay */}
                                {telemetryData && (
                                    <div className="absolute top-4 left-4 right-4">
                                        <div className="bg-black bg-opacity-70 rounded-lg p-3 border border-cyan-500">
                                            <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                                                <Clock className="w-4 h-4" />
                                                {telemetryData.timestamp}
                                            </div>
                                            <div className="flex items-center gap-2 text-yellow-400 text-sm font-mono mt-2">
                                                <MapPin className="w-4 h-4" />
                                                Lat: {telemetryData.gps_location.lat.toFixed(6)}, 
                                                Lon: {telemetryData.gps_location.lon.toFixed(6)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hazard Detection Badge */}
                                {telemetryData && telemetryData.hazards && telemetryData.hazards.length > 0 && (
                                    <div
                                        className={`absolute bottom-4 right-4 bg-gradient-to-r ${
                                            hazardColorMap[telemetryData.hazards[0].name] || 'from-red-600 to-red-700'
                                        } rounded-lg px-4 py-2 border-2 border-red-400 animate-pulse`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                            <div>
                                                <p className="text-white font-bold text-sm">
                                                    {telemetryData.hazards.length} Hazard(s) Detected
                                                </p>
                                                <p className="text-red-100 text-xs">
                                                    {telemetryData.hazards
                                                        .map((h) => h.name)
                                                        .join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Camera Stats Footer */}
                            <div className="bg-slate-900 border-t border-slate-700 px-4 py-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1">Status</p>
                                        <p className="text-white font-semibold text-sm">
                                            {isConnected ? '🟢 LIVE' : '⚫ OFFLINE'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1">Frame Size</p>
                                        <p className="text-cyan-400 font-mono text-sm">
                                            {imageData ? '1290×720px' : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1">Total Hazards</p>
                                        <p className="text-yellow-400 font-semibold text-sm">
                                            {hazardLog.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hazard Detection Log - Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-2xl h-full flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-900 to-red-800 px-4 py-3 border-b border-slate-700">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-300" />
                                    <h2 className="text-lg font-bold text-white">Detection Log</h2>
                                </div>
                                <p className="text-red-200 text-xs mt-1">Real-time hazard alerts</p>
                            </div>

                            {/* Scrollable Log */}
                            <div className="flex-1 overflow-y-auto">
                                {hazardLog.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center text-slate-400">
                                            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No hazards detected</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-700">
                                        {hazardLog.map((log) => (
                                            <div
                                                key={log.id}
                                                className={`p-3 border-l-4 ${
                                                    log.hazardName === 'Pothole'
                                                        ? 'border-red-500 bg-red-950 bg-opacity-20'
                                                        : log.hazardName === 'Crack'
                                                        ? 'border-yellow-500 bg-yellow-950 bg-opacity-20'
                                                        : log.hazardName === 'Debris'
                                                        ? 'border-orange-500 bg-orange-950 bg-opacity-20'
                                                        : 'border-purple-500 bg-purple-950 bg-opacity-20'
                                                } hover:bg-opacity-40 transition-all cursor-pointer`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-white font-semibold text-sm">
                                                            {log.hazardName}
                                                        </p>
                                                        <div className="mt-1 space-y-1 text-xs">
                                                            <div className="text-slate-400 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {log.timestamp}
                                                            </div>
                                                            <div className="text-slate-400 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {log.gps.lat.toFixed(4)}, {log.gps.lon.toFixed(4)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2 text-right">
                                                        <p className="text-cyan-400 text-xs font-mono">
                                                            {(log.confidence * 100).toFixed(0)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Stats */}
                            {hazardLog.length > 0 && (
                                <div className="bg-slate-900 border-t border-slate-700 px-4 py-3">
                                    <div className="text-center">
                                        <p className="text-slate-400 text-xs mb-1">Showing Latest Detections</p>
                                        <p className="text-cyan-400 text-xs font-mono">
                                            {Math.min(hazardLog.length, 50)} / 50 entries
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Connection Debug Info */}
                {!isConnected && (
                    <div className="mt-6 bg-yellow-950 border border-yellow-600 rounded-lg p-4">
                        <p className="text-yellow-200 text-sm">
                            ⚠️ <strong>WebSocket Connection Issue:</strong> The backend server should be running at{' '}
                            <code className="bg-yellow-900 px-2 py-1 rounded">http://localhost:5000</code>. Check that the
                            backend is started with <code className="bg-yellow-900 px-2 py-1 rounded">npm start</code>.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveDashcam;
