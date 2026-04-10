// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:5000/api';

// ===== API Service =====
const ApiService = {
    // Get all indexes
    getIndexes: async function() {
        return fetch(`${API_BASE_URL}/indexes`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch indexes');
                return response.json();
            });
    },

    // Get single index
    getIndex: async function(id) {
        return fetch(`${API_BASE_URL}/indexes/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch index');
                return response.json();
            });
    },

    // Create index
    createIndex: async function(indexData) {
        return fetch(`${API_BASE_URL}/indexes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(indexData)
        }).then(response => {
            if (!response.ok) throw new Error('Failed to create index');
            return response.json();
        });
    },

    // Update index
    updateIndex: async function(id, indexData) {
        return fetch(`${API_BASE_URL}/indexes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(indexData)
        }).then(response => {
            if (!response.ok) throw new Error('Failed to update index');
            return response.json();
        });
    },

    // Delete index
    deleteIndex: async function(id) {
        return fetch(`${API_BASE_URL}/indexes/${id}`, {
            method: 'DELETE'
        }).then(response => {
            if (!response.ok) throw new Error('Failed to delete index');
            return response.json();
        });
    },

    // Get analytics
    getAnalytics: async function() {
        return fetch(`${API_BASE_URL}/analytics`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch analytics');
                return response.json();
            });
    },

    // Get index statistics
    getIndexStats: async function(id) {
        return fetch(`${API_BASE_URL}/indexes/${id}/stats`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch index stats');
                return response.json();
            });
    }
};
