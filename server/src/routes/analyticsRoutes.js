// ===== Dependencies =====
const express = require('express');
const router = express.Router();
const Index = require('../models/Index');

// ===== Analytics Routes =====

// Get analytics data
router.get('/', async (req, res) => {
    try {
        const indexes = await Index.find();
        const totalIndexes = indexes.length;
        const activeIndexes = indexes.filter(idx => idx.status === 'active').length;
        const totalKeys = indexes.reduce((sum, idx) => sum + (idx.totalKeys || 0), 0);
        const avgFragmentation = totalIndexes > 0 
            ? Math.round(indexes.reduce((sum, idx) => sum + (idx.fragmentation || 0), 0) / totalIndexes)
            : 0;

        const analytics = {
            totalIndexes,
            activeIndexes,
            totalKeys,
            averageFragmentation: avgFragmentation,
            timestamp: new Date()
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get usage trends
router.get('/trends', async (req, res) => {
    try {
        const indexes = await Index.find();
        const trends = {};

        indexes.forEach(idx => {
            const date = new Date(idx.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            trends[key] = (trends[key] || 0) + 1;
        });

        const trendsArray = Object.entries(trends).map(([month, count]) => ({
            _id: { year: parseInt(month.split('-')[0]), month: parseInt(month.split('-')[1]) },
            count
        })).sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);

        res.json(trendsArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
