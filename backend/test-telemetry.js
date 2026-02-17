#!/usr/bin/env node

/**
 * Telemetry Test Client - Simulates Jetson Orin Nano sending detections
 * Usage: node test-telemetry.js
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Sample hazard names
const HAZARD_TYPES = [
    { name: 'Pothole', class: 0 },
    { name: 'Crack', class: 1 },
    { name: 'Debris', class: 2 },
    { name: 'Obstacle', class: 3 }
];

// Sample coordinates (along a route)
const ROUTE_POINTS = [
    { lat: 28.6139, lon: 77.2090 }, // New Delhi
    { lat: 28.6157, lon: 77.2104 },
    { lat: 28.6175, lon: 77.2118 },
    { lat: 28.6193, lon: 77.2132 },
    { lat: 28.6211, lon: 77.2146 }
];

/**
 * Generate a simple test image (1x1 pixel base64)
 * For real testing, replace with actual camera frame
 */
function generateTestImage() {
    // 1x1 red pixel JPEG
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMEAwADAAAAAAAAAAABAgADBBExBRIhMUFRYf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRUf/aAAwDAQACEQMRAD8AltJaxQKBkY5Ky+VVqLcgGB8bLY22QQIMIStTMNPaNu9h8xc26eIzrMAAA//Z';
}

/**
 * Send telemetry data to backend
 */
async function sendTelemetry(hazardCount = 0) {
    const routeIndex = Math.floor(Math.random() * ROUTE_POINTS.length);
    const location = ROUTE_POINTS[routeIndex];
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let hazards = [];
    
    if (hazardCount > 0) {
        for (let i = 0; i < hazardCount; i++) {
            const hazard = HAZARD_TYPES[Math.floor(Math.random() * HAZARD_TYPES.length)];
            hazards.push({
                class: hazard.class,
                name: hazard.name,
                confidence: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.7-1.0
                xmin: Math.floor(Math.random() * 200),
                ymin: Math.floor(Math.random() * 150),
                xmax: Math.floor(Math.random() * 200 + 100),
                ymax: Math.floor(Math.random() * 150 + 100)
            });
        }
    }

    const payload = {
        timestamp,
        gps_location: {
            lat: parseFloat(location.lat.toFixed(6)),
            lon: parseFloat(location.lon.toFixed(6))
        },
        hazards,
        image_stream: generateTestImage()
    };

    try {
        console.log(`\n📤 Sending telemetry to ${BACKEND_URL}/api/telemetry`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Location: ${location.lat}, ${location.lon}`);
        console.log(`   Hazards: ${hazardCount}`);
        
        const response = await axios.post(`${BACKEND_URL}/api/telemetry`, payload);
        
        console.log('✅ Success:', response.data);
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection Error: Backend not running at', BACKEND_URL);
            console.error('   Start backend with: cd backend && npm start');
        } else {
            console.error('❌ Error:', error.message);
        }
        return false;
    }
}

/**
 * Run continuous telemetry stream
 */
async function streamTelemetry(duration = 30000) {
    console.log('\n🚀 Starting Telemetry Stream Simulation');
    console.log(`⏱️  Duration: ${duration / 1000}s`);
    console.log('─'.repeat(50));

    const startTime = Date.now();
    let count = 0;

    while (Date.now() - startTime < duration) {
        // Randomly 0-2 hazards per frame
        const hazardCount = Math.floor(Math.random() * 3);
        await sendTelemetry(hazardCount);
        count++;

        // Send every 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Stream completed. Sent ${count} telemetry records.`);
}

/**
 * Send single test message
 */
async function sendSingleTest() {
    console.log('\n🎯 Sending Single Test Telemetry');
    console.log('─'.repeat(50));
    await sendTelemetry(1); // 1 hazard
    console.log('─'.repeat(50));
}

// CLI argument handling
const args = process.argv.slice(2);
const command = args[0] || 'single';
const duration = args[1] ? parseInt(args[1]) * 1000 : 30000;

console.log('📡 Rail Rakshak - Telemetry Test Client');
console.log('═'.repeat(50));

if (command === 'stream') {
    streamTelemetry(duration).catch(console.error);
} else if (command === 'single' || command === 'test') {
    sendSingleTest().catch(console.error);
} else {
    console.log('\nUsage:');
    console.log('  node test-telemetry.js single     - Send one test message');
    console.log('  node test-telemetry.js stream [s] - Stream for N seconds (default: 30)');
    console.log('\nExamples:');
    console.log('  node test-telemetry.js single');
    console.log('  node test-telemetry.js stream');
    console.log('  node test-telemetry.js stream 60');
}
