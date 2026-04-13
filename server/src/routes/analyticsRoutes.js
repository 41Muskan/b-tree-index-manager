// ===== Dependencies =====
const express = require('express');
const router = express.Router();
const Index = require('../models/Index');

// ===== Analytics Routes =====

// Get analytics data
router.get('/', async (req, res) => {
    try {
        const results = await Index.aggregate([
            {
                $group: {
                    _id: null,
                    totalIndexes: { $sum: 1 },
                    activeIndexes: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    totalKeys: { $sum: '$totalKeys' },
                    averageFragmentation: { $avg: '$fragmentation' },
                    averageDepth: { $avg: '$depth' },
                    averageNodeUtilization: {
                        $avg: {
                            $cond: [
                                { $gt: ['$nodeCount', 0] },
                                { $divide: ['$totalKeys', { $multiply: ['$nodeCount', { $subtract: [{ $multiply: ['$order', 2] }, 1] }] }] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = results[0] || {};
        const analytics = {
            totalIndexes: stats.totalIndexes || 0,
            activeIndexes: stats.activeIndexes || 0,
            totalKeys: stats.totalKeys || 0,
            averageFragmentation: Math.round(stats.averageFragmentation || 0),
            averageDepth: Math.round(stats.averageDepth || 0),
            averageNodeUtilization: Math.round((stats.averageNodeUtilization || 0) * 100),
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
