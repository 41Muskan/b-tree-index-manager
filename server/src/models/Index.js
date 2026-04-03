// ===== Dependencies =====
const mongoose = require('mongoose');

// ===== Index Schema =====
const indexSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Index name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Index name cannot exceed 100 characters']
    },
    type: {
        type: String,
        enum: ['btree', 'bplus'],
        required: [true, 'Index type is required'],
        default: 'btree'
    },
    order: {
        type: Number,
        required: [true, 'Index order is required'],
        min: [2, 'Index order must be at least 2'],
        max: [1000, 'Index order cannot exceed 1000']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'optimizing'],
        default: 'active'
    },
    nodeCount: {
        type: Number,
        default: 1
    },
    totalKeys: {
        type: Number,
        default: 0
    },
    lastRebalance: {
        type: Date,
        default: null
    },
    fragmentation: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    treeData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ===== Pre-save Middleware =====
indexSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// ===== Export Model =====
module.exports = mongoose.model('Index', indexSchema);
