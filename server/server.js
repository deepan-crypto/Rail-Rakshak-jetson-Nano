
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/rail-rakshak', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Login Log_Schema
const LoginLogSchema = new mongoose.Schema({
    username: String,
    status: String, // 'SUCCESS' or 'FAILED'
    ip: String,
    timestamp: { type: Date, default: Date.now },
    userAgent: String
});

const LoginLog = mongoose.model('LoginLog', LoginLogSchema);

// Hardcoded Credentials
const CREDENTIALS = {
    'admin': 'admin123',
    'controller': 'railsafe2024',
    'supervisor': 'track_secure',
    'analyst': 'data_insight',
    'guest': 'view_only'
};

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log(`\n[LOGIN ATTEMPT] User: ${username} | IP: ${ip}`);

    if (CREDENTIALS[username] && CREDENTIALS[username] === password) {
        console.log(`✅ [LOGIN SUCCESS] Access Granted for ${username}`);

        // Log to MongoDB
        await new LoginLog({ username, status: 'SUCCESS', ip, userAgent }).save();

        res.json({ success: true, message: 'Login successful', role: username });
    } else {
        console.log(`❌ [LOGIN FAILED] Invalid credentials for ${username}`);

        // Log to MongoDB
        await new LoginLog({ username, status: 'FAILED', ip, userAgent }).save();

        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get Logs Route (Optional, for verification)
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await LoginLog.find().sort({ timestamp: -1 }).limit(20);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Default Credentials:`);
    Object.keys(CREDENTIALS).forEach(user => {
        console.log(`   - ${user} : ${CREDENTIALS[user]}`);
    });
});
