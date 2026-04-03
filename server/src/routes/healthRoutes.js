// ===== Dependencies =====
const express = require('express');
const router = express.Router();

// ===== Health Check Route =====
router.get('/', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

module.exports = router;
