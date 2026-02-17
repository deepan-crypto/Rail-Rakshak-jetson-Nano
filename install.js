#!/usr/bin/env node

/**
 * Installation helper script
 * Installs all dependencies for both frontend and backend
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Rail Rakshak Installation Setup\n');
console.log('═'.repeat(50));

// Check for Node.js and npm
const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();

console.log(`\n✅ Node.js: ${nodeVersion}`);
console.log(`✅ npm: ${npmVersion}`);

try {
    // Install backend dependencies
    console.log('\n📦 Installing backend dependencies...');
    console.log('─'.repeat(50));
    execSync('npm install', { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });

    // Install frontend dependencies
    console.log('\n📦 Installing frontend dependencies...');
    console.log('─'.repeat(50));
    execSync('npm install', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });

    console.log('\n\n✅ Installation Complete!\n');
    console.log('═'.repeat(50));
    console.log('\n📋 Next Steps:\n');
    console.log('1️⃣  Start MongoDB (if not running):\n   mongod\n');
    console.log('2️⃣  Start the backend server:\n   cd backend\n   npm start\n');
    console.log('3️⃣  In a new terminal, start the frontend:\n   cd frontend\n   npm run dev\n');
    console.log('4️⃣  Open http://localhost:5173 in your browser\n');
    console.log('5️⃣  Test with: npm run test:telemetry (in backend folder)\n');
    console.log('═'.repeat(50));
} catch (error) {
    console.error('\n❌ Installation failed:');
    console.error(error.message);
    process.exit(1);
}
