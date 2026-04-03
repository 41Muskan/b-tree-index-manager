// ===== Global Variables =====
let indexes = [];
let selectedIndexId = null;
let selectedIndexType = null;
let isEditMode = false;
let editIndexId = null;

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', function() {
    loadIndexes();
    setupEventListeners();
    setupFormValidation();
});

// ===== Setup Form Validation =====
function setupFormValidation() {
    const indexOrder = document.getElementById('indexOrder');
    const indexDescription = document.getElementById('indexDescription');

    // Order validation
    if (indexOrder) {
        indexOrder.addEventListener('input', function() {
            if (this.value < 2 && this.value !== '') {
                this.value = 2;
            }
            if (this.value > 1000) {
                this.value = 1000;
            }
        });
    }

    // Character count for description
    if (indexDescription) {
        indexDescription.addEventListener('input', function() {
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = this.value.length + '/500 characters';
            }
        });
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    const createIndexForm = document.getElementById('createIndexForm');
    if (createIndexForm) {
        createIndexForm.addEventListener('submit', handleCreateIndex);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ===== Validate Form Input =====
function validateIndexForm(name, type, order, description) {
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push('Index name is required');
    }

    if (name && name.length > 100) {
        errors.push('Index name cannot exceed 100 characters');
    }

    if (!type) {
        errors.push('Please select an index type');
    }

    if (isNaN(order)) {
        errors.push('Index order must be a valid number');
    }

    if (!order || order === '') {
        errors.push('Index order is required');
    }

    if (order < 2) {
        errors.push('Index order must be at least 2');
    }

    if (order > 1000) {
        errors.push('Index order cannot exceed 1000');
    }

    if (description && description.length > 500) {
        errors.push('Description cannot exceed 500 characters');
    }

    return errors;
}

// ===== Show Modal Error =====
function showModalError(message) {
    const errorDiv = document.getElementById('modalError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// ===== Clear Modal Error =====
function clearModalError() {
    const errorDiv = document.getElementById('modalError');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

// ===== Load Indexes =====
async function loadIndexes() {
    try {
        const response = await fetch('http://localhost:5000/api/indexes');
        if (response.ok) {
            indexes = await response.json();
            displayIndexes();
            loadAnalytics();
        } else if (response.status === 0) {
            console.warn('Cannot connect to server. Make sure it is running on http://localhost:5000');
        }
    } catch (error) {
        console.error('Error loading indexes:', error);
        console.warn('Cannot connect to server. Make sure MongoDB is running and the server is started.');
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch('http://localhost:5000/api/analytics');
        if (!response.ok) {
            console.warn('Failed to load analytics');
            return;
        }

        const data = await response.json();
        document.getElementById('totalIndexesValue').textContent = data.totalIndexes;
        document.getElementById('performanceValue').textContent = data.averageFragmentation !== undefined ? `${100 - data.averageFragmentation}%` : '--';
        document.getElementById('storageValue').textContent = data.totalKeys;
        document.getElementById('rebalanceValue').textContent = data.activeIndexes;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// ===== Display Indexes =====
function displayIndexes() {
    const indexesList = document.getElementById('indexesList');
    
    if (indexes.length === 0) {
        indexesList.innerHTML = '<p class="empty-state">No indexes created yet. Create your first index to get started!</p>';
        return;
    }

    indexesList.innerHTML = indexes.map(index => `
        <div class="index-card">
            <div class="index-card-header">
                <h3>${escapeHtml(index.name)}</h3>
                <span class="index-badge">${escapeHtml(index.type)}</span>
            </div>
            <p><strong>Order:</strong> ${index.order}</p>
            <p><strong>Created:</strong> ${new Date(index.createdAt).toLocaleDateString()}</p>
            ${index.description ? `<p><strong>Description:</strong> ${escapeHtml(index.description)}</p>` : ''}
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="selectIndex('${index._id}', '${index.type}')" style="padding: 8px 16px; font-size: 0.9rem;">Open Tree</button>
                <button class="btn btn-primary" onclick="editIndex('${index._id}')" style="padding: 8px 16px; font-size: 0.9rem;">Edit</button>
                <button class="btn btn-secondary" onclick="deleteIndex('${index._id}')" style="padding: 8px 16px; font-size: 0.9rem; background-color: #ef4444;">Delete</button>
            </div>
        </div>
    `).join('');
}

// ===== Handle Create Index =====
async function handleCreateIndex(e) {
    e.preventDefault();
    clearModalError();

    const indexName = document.getElementById('indexName').value.trim();
    const indexType = document.getElementById('indexType').value;
    const indexOrder = parseInt(document.getElementById('indexOrder').value);
    const indexDescription = document.getElementById('indexDescription').value.trim();

    // Validate form input
    const validationErrors = validateIndexForm(indexName, indexType, indexOrder, indexDescription);
    if (validationErrors.length > 0) {
        showModalError(validationErrors[0]);
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/indexes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: indexName,
                type: indexType,
                order: indexOrder,
                description: indexDescription
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✓ Index created successfully!');
            closeModal();
            document.getElementById('createIndexForm').reset();
            loadIndexes();
        } else {
            // Show server error message
            const errorMessage = data.error || 'Failed to create index';
            showModalError(errorMessage);
        }
    } catch (error) {
        console.error('Error creating index:', error);
        showModalError('Cannot connect to server. Make sure MongoDB is running and the server is started on http://localhost:5000');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ===== Edit Index =====
async function editIndex(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${id}`);
        if (!response.ok) {
            alert('Failed to load index data');
            return;
        }
        const index = await response.json();

        // Populate form
        document.getElementById('indexName').value = index.name;
        document.getElementById('indexType').value = index.type;
        document.getElementById('indexOrder').value = index.order;
        document.getElementById('indexDescription').value = index.description || '';
        document.getElementById('charCount').textContent = (index.description || '').length + '/500 characters';

        // Set edit mode
        isEditMode = true;
        editIndexId = id;

        // Show modal
        clearModalError();
        document.getElementById('createIndexModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading index for edit:', error);
        alert('Error loading index data. Make sure the server is running.');
    }
}

// ===== Select Index and Load Tree =====
async function selectIndex(id, type) {
    selectedIndexId = id;
    selectedIndexType = type;

    const treePanel = document.getElementById('treePanel');
    const treePanelTitle = document.getElementById('treePanelTitle');
    treePanel.style.display = 'block';
    treePanelTitle.textContent = `Index Tree (${type.toUpperCase()})`;

    document.getElementById('keyInput').value = '';
    document.getElementById('treeOutput').textContent = 'Loading tree...';

    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${id}/tree`);
        if (!response.ok) {
            document.getElementById('treeOutput').textContent = 'Failed to load tree';
            return;
        }
        const payload = await response.json();
        renderTree(payload.tree);
    } catch (error) {
        console.error('Error loading tree:', error);
        document.getElementById('treeOutput').textContent = 'Error loading tree';
    }
}

function renderTree(treeData) {
    if (!treeData || !treeData.keys) {
        document.getElementById('treeOutput').textContent = 'Empty tree';
        return;
    }

    const levels = [];

    function traverse(node, depth = 0) {
        if (!levels[depth]) {
            levels[depth] = [];
        }
        levels[depth].push(`[${node.keys.join(', ')}]`);
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child, depth + 1));
        }
    }

    traverse(treeData);

    let rendered = '';
    for (let i = 0; i < levels.length; i++) {
        rendered += `Level ${i}: ${levels[i].join(' | ')}\n`;
    }

    document.getElementById('treeOutput').textContent = rendered;
}

async function insertKey() {
    if (!selectedIndexId) {
        alert('Select an index first');
        return;
    }

    const keyValue = Number(document.getElementById('keyInput').value);
    if (Number.isNaN(keyValue)) {
        alert('Enter a numeric key');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${selectedIndexId}/keys`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ key: keyValue })
        });

        const payload = await response.json();
        if (!response.ok) {
            alert(payload.error || 'Insert failed');
            return;
        }

        alert(`Inserted key ${keyValue}`);
        selectIndex(selectedIndexId, selectedIndexType);
        loadIndexes();
    } catch (error) {
        console.error('Insert key error:', error);
        alert('Error inserting key. Ensure server is running.');
    }
}

async function searchKey() {
    if (!selectedIndexId) {
        alert('Select an index first');
        return;
    }

    const keyValue = Number(document.getElementById('keyInput').value);
    if (Number.isNaN(keyValue)) {
        alert('Enter a numeric key');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${selectedIndexId}/keys/${keyValue}`);
        const payload = await response.json();

        if (!response.ok) {
            alert(payload.error || 'Search failed');
            return;
        }

        const message = payload.found ? `Key ${keyValue} found` : `Key ${keyValue} not found`;
        alert(message);

        if (payload.found) {
            document.getElementById('treeOutput').textContent += `\n${message}`;
        }
    } catch (error) {
        console.error('Search key error:', error);
        alert('Error searching key. Ensure server is running.');
    }
}

// ===== Delete Index =====
async function deleteIndex(id) {
    if (confirm('Are you sure you want to delete this index?')) {
        try {
            const response = await fetch(`http://localhost:5000/api/indexes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('✓ Index deleted successfully!');
                loadIndexes();
            } else {
                alert('Failed to delete index');
            }
        } catch (error) {
            console.error('Error deleting index:', error);
            alert('Error deleting index. Make sure the server is running.');
        }
    }
}

// ===== Modal Functions =====
function showCreateIndexModal() {
    isEditMode = false;
    editIndexId = null;
    clearModalError();
    document.getElementById('createIndexForm').reset();
    document.getElementById('charCount').textContent = '0/500 characters';
    document.getElementById('createIndexModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('createIndexModal').style.display = 'none';
    clearModalError();
}

window.onclick = function(event) {
    const modal = document.getElementById('createIndexModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// ===== Scroll to Section =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
