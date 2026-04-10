// ===== Dependencies =====
const express = require('express');
const router = express.Router();
const Index = require('../models/Index');

// ===== Analytics Routes =====

// Get analytics data
router.get('/', async (req, res) => {
    try {
        const totalIndexes = await Index.countDocuments();
        const activeIndexes = await Index.countDocuments({ status: 'active' });
        const totalKeys = await Index.aggregate([
            { $group: { _id: null, total: { $sum: '$totalKeys' } } }
        ]);
        const avgFragmentation = await Index.aggregate([
            { $group: { _id: null, avg: { $avg: '$fragmentation' } } }
        ]);

        const analytics = {
            totalIndexes,
            activeIndexes,
            totalKeys: totalKeys[0]?.total || 0,
            averageFragmentation: Math.round(avgFragmentation[0]?.avg || 0),
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
        const trends = await Index.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
