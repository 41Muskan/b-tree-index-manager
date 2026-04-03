// ===== Dependencies =====
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ===== Database Connection =====
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/btree_index_manager';
        await mongoose.connect(mongoURI);
        console.log('✓ MongoDB connected successfully');
    } catch (error) {
        console.error('✗ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// ===== Initialize Express App =====
const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Request Logging Middleware =====
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ===== Routes =====
app.use('/api/indexes', require('./routes/indexRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// ===== Error Handling Middleware =====
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// ===== 404 Handler =====
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`\n===== B-Tree Index Manager Server =====`);
        console.log(`✓ Server running on http://localhost:${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`========================================\n`);
    });
};

startServer();

// ===== Graceful Shutdown =====
process.on('SIGINT', () => {
    console.log('\n\nShutting down gracefully...');
    process.exit(0);
});

module.exports = app;
