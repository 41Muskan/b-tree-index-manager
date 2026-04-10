// ===== Dependencies =====
const Index = require('../models/Index');
const BTree = require('../utils/BTree');

// ===== Helpers =====
function loadBTree(index) {
    const tree = new BTree(index.order);
    if (index.treeData && Object.keys(index.treeData).length > 0) {
        tree.cloneFromJSON(index.treeData);
    }
    return tree;
}

function syncIndexFromTree(index, tree) {
    index.treeData = tree.toJSON();
    index.totalKeys = tree.countKeys();
    index.nodeCount = tree.countNodes();
    index.lastRebalance = new Date();
}

// ===== Controllers =====
const indexController = {
    // Get all indexes
    getAllIndexes: async (req, res) => {
        try {
            const indexes = await Index.find().sort({ createdAt: -1 });
            res.json(indexes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get single index
    getIndexById: async (req, res) => {
        try {
            const index = await Index.findById(req.params.id);
            if (!index) {
                return res.status(404).json({ error: 'Index not found' });
            }
            res.json(index);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create index
    createIndex: async (req, res) => {
        try {
            const { name, type, order, description } = req.body;

            // Validation
            if (!name || !type || !order) {
                return res.status(400).json({ 
                    error: 'Name, type, and order are required' 
                });
            }

            const btree = new BTree(order);
            const newIndex = new Index({
                name,
                type,
                order,
                description,
                treeData: btree.toJSON(),
                nodeCount: btree.countNodes(),
                totalKeys: btree.countKeys()
            });

            const savedIndex = await newIndex.save();
            res.status(201).json(savedIndex);
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ error: 'Index name already exists' });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // Update index
    updateIndex: async (req, res) => {
        try {
            const { name, type, order, description, status } = req.body;

            const updatedIndex = await Index.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    type,
                    order,
                    description,
                    status,
                    updatedAt: Date.now()
                },
                { new: true, runValidators: true }
            );

            if (!updatedIndex) {
                return res.status(404).json({ error: 'Index not found' });
            }

            res.json(updatedIndex);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete index
    deleteIndex: async (req, res) => {
        try {
            const deletedIndex = await Index.findByIdAndDelete(req.params.id);

            if (!deletedIndex) {
                return res.status(404).json({ error: 'Index not found' });
            }

            res.json({ message: 'Index deleted successfully', index: deletedIndex });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get index statistics
    getIndexStats: async (req, res) => {
        try {
            const index = await Index.findById(req.params.id);

            if (!index) {
                return res.status(404).json({ error: 'Index not found' });
            }

            const stats = {
                id: index._id,
                name: index.name,
                type: index.type,
                nodeCount: index.nodeCount,
                totalKeys: index.totalKeys,
                fragmentation: index.fragmentation,
                lastRebalance: index.lastRebalance,
                createdAt: index.createdAt
            };

            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get tree data for visualization
    getTree: async (req, res) => {
        try {
            const index = await Index.findById(req.params.id);
            if (!index) {
                return res.status(404).json({ error: 'Index not found' });
            }

            res.json({ tree: index.treeData || {} });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Insert key into BTree
    insertKey: async (req, res) => {
        try {
            const index = await Index.findById(req.params.id);
            if (!index) {
                return res.status(404).json({ error: 'Index not found' });
            }

            const { key } = req.body;
            if (key === undefined || key === null) {
                return res.status(400).json({ error: 'Key is required' });
            }

            const value = Number(key);
            if (Number.isNaN(value)) {
                return res.status(400).json({ error: 'Key must be numeric' });
            }

            const tree = loadBTree(index);
            const inserted = tree.insert(value);
            if (!inserted) {
                return res.status(409).json({ error: 'Key already exists' });
            }

            syncIndexFromTree(index, tree);
            await index.save();

            res.json({ message: 'Key inserted', key: value, tree: index.treeData });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Search key in BTree
    searchKey: async (req, res) => {
        try {
            const index = await Index.findById(req.params.id);
            if (!index) {
                return res.status(404).json({ error: 'Index not found' });
            }

            const key = Number(req.params.key);
            if (Number.isNaN(key)) {
                return res.status(400).json({ error: 'Key must be numeric' });
            }

            const tree = loadBTree(index);
            const found = tree.search(key) !== null;
            res.json({ found, key });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete key in BTree (not full algorithm yet)
    deleteKey: async (req, res) => {
        res.status(501).json({
            error: 'Delete key in B-Tree is not implemented yet. This will be added in next iteration.'
        });
    }
};

module.exports = indexController;
