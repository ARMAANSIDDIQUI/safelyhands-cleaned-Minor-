const express = require('express');
const mongoose = require('mongoose');
const next = require('next');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


const dev = (process.env.NODE_ENV || '').trim() !== 'production';
console.log(`Starting Next.js in ${dev ? 'development' : 'production'} mode (NODE_ENV='${process.env.NODE_ENV}')`);
// const nextApp = next({ dev, dir: path.join(__dirname, '../frontend') });
// const handle = nextApp.getRequestHandler();

const app = express();

// Ensure uploads directory exists (only for local development)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
}

const PORT = (process.env.PORT || 5000);

// 1. CORS Middleware (Must be FIRST)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Respond immediately to pre-flight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// 2. Body Parsers (with large limits)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logger with detailed payload info
app.use((req, res, next) => {
    const contentLength = req.get('content-length');
    console.log(`>>> [REQUEST] ${new Date().toISOString()} | ${req.method} ${req.url} | Content-Length: ${contentLength || 'unknown'} bytes`);

    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
        console.warn(`!!! [WARNING] Payload exceeds 50MB limit: ${contentLength} bytes`);
    }
    next();
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/broomees';

// Cached connection for serverless
let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) return cachedConnection;

    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        cachedConnection = conn;
        console.log('MongoDB Connected Successfully');
        return conn;
    } catch (err) {
        console.log('MongoDB Connection Error:', err.message);
    }
};

// Initial connection attempt (background)
connectDB();

// Middleware to ensure DB is connected for requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/carousel', require('./routes/carouselRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/subcategories', require('./routes/subCategoryRoutes'));
app.use('/api/team-categories', require('./routes/teamCategoryRoutes'));
app.use('/api/team-members', require('./routes/teamRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/credibility', require('./routes/credibilityRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Global Error Handler — always set CORS headers so the browser can read the error too
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start Server with Port Fallback (only for local development)
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

// Only start server in local development (not on Vercel/Serverless)
// For single-instance deployment, we start the server after preparing Next.js
// if (process.env.NODE_ENV !== 'production' || process.env.DEPLOYMENT_MODE === 'single-instance') {
//     nextApp.prepare().then(() => {
//         startServer(PORT);
//     }).catch(ex => {
//         console.error(ex.stack);
//         process.exit(1);
//     });
// } else {
//     // Fallback for Vercel-like environments where server.js is imported
//     // Note: To use single-instance in production, set DEPLOYMENT_MODE=single-instance or ensuring the start script runs this file
//     // Check if we are the main module
//     if (require.main === module) {
//         nextApp.prepare().then(() => {
//             startServer(PORT);
//         });
//     }
// }

startServer(PORT);

// Export app for Vercel serverless deployment
module.exports = app;
