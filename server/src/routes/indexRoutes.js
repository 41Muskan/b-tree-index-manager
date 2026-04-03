// ===== Dependencies =====
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

// ===== Routes =====

// Get all indexes
router.get('/', indexController.getAllIndexes);

// Get single index
router.get('/:id', indexController.getIndexById);

// Create index
router.post('/', indexController.createIndex);

// Update index
router.put('/:id', indexController.updateIndex);

// Delete index
router.delete('/:id', indexController.deleteIndex);

// Get index statistics
router.get('/:id/stats', indexController.getIndexStats);

// Get B-Tree structure for visualization
router.get('/:id/tree', indexController.getTree);

// Insert a key into the B-Tree
router.post('/:id/keys', indexController.insertKey);

// Search a key in the B-Tree
router.get('/:id/keys/:key', indexController.searchKey);

// Delete a key in the B-Tree (placeholder)
router.delete('/:id/keys/:key', indexController.deleteKey);

module.exports = router;
