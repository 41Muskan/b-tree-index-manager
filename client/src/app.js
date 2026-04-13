// ===== Global Variables =====
let indexes = [];
let selectedIndexId = null;
let selectedIndexType = null;
let editingIndexId = null;
let searchedKey = null; // For highlighting searched key

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
        document.getElementById('activeIndexesValue').textContent = data.activeIndexes;
        document.getElementById('performanceValue').textContent = data.averageNodeUtilization !== undefined ? `${data.averageNodeUtilization}%` : '--';
        document.getElementById('storageValue').textContent = data.totalKeys;
        document.getElementById('rebalanceValue').textContent = data.averageDepth !== undefined ? data.averageDepth : '--';

        renderPerformanceSummary(data);
        loadAnalyticsTrends();
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function renderPerformanceSummary(data) {
    const performanceChart = document.getElementById('performanceChart');
    if (!performanceChart) return;

    performanceChart.innerHTML = `
        <div style="display: grid; gap: 1rem; padding: 1rem; text-align: left;">
            <div><strong>Avg Node Utilization:</strong> ${data.averageNodeUtilization ?? '--'}%</div>
            <div><strong>Avg Fragmentation:</strong> ${data.averageFragmentation ?? '--'}%</div>
            <div><strong>Avg Tree Depth:</strong> ${data.averageDepth ?? '--'}</div>
            <div><strong>Total Keys:</strong> ${data.totalKeys}</div>
        </div>
    `;
}

async function loadAnalyticsTrends() {
    try {
        const response = await fetch('http://localhost:5000/api/analytics/trends');
        if (!response.ok) {
            console.warn('Failed to load analytics trends');
            return;
        }

        const trends = await response.json();
        const usageChart = document.getElementById('usageChart');
        if (!usageChart) return;

        if (!Array.isArray(trends) || trends.length === 0) {
            usageChart.innerHTML = '<p>No trend data available yet.</p>';
            return;
        }

        const maxCount = Math.max(...trends.map(item => item.count));
        usageChart.innerHTML = trends.map(item => {
            const label = `${item._id.month}/${item._id.year}`;
            const width = maxCount > 0 ? Math.max(10, (item.count / maxCount) * 100) : 10;
            return `
                <div style="margin-bottom: 0.75rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.25rem;">
                        <span>${label}</span>
                        <span>${item.count} indexes</span>
                    </div>
                    <div style="background:#e5e7eb; border-radius:999px; height:12px; overflow:hidden;">
                        <div style="width:${width}%; background:linear-gradient(90deg, #6366f1, #ec4899); height:100%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading analytics trends:', error);
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
    submitBtn.textContent = editingIndexId ? 'Updating...' : 'Creating...';
    submitBtn.disabled = true;

    try {
        const url = editingIndexId ? `http://localhost:5000/api/indexes/${editingIndexId}` : 'http://localhost:5000/api/indexes';
        const method = editingIndexId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
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
            alert(editingIndexId ? '✓ Index updated successfully!' : '✓ Index created successfully!');
            editingIndexId = null;
            closeModal();
            document.getElementById('createIndexForm').reset();
            document.getElementById('submitBtn').textContent = 'Create Index';
            loadIndexes();
        } else {
            const errorMessage = data.error || (editingIndexId ? 'Failed to update index' : 'Failed to create index');
            showModalError(errorMessage);
        }
    } catch (error) {
        console.error('Error saving index:', error);
        showModalError('Cannot connect to server. Make sure MongoDB is running and the server is started on http://localhost:5000');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ===== Edit Index =====
async function editIndex(id) {
    const index = indexes.find(item => item._id === id);
    if (!index) {
        alert('Index not found. Please refresh the page.');
        return;
    }

    editingIndexId = id;
    document.getElementById('indexName').value = index.name || '';
    document.getElementById('indexType').value = index.type || 'btree';
    document.getElementById('indexOrder').value = index.order || 2;
    document.getElementById('indexDescription').value = index.description || '';
    document.getElementById('charCount').textContent = `${(index.description || '').length}/500 characters`;
    document.getElementById('submitBtn').textContent = 'Update Index';
    document.getElementById('createIndexModal').style.display = 'block';
    document.getElementById('modalError').style.display = 'none';
}

// ===== Select Index and Load Tree =====
async function selectIndex(id, type, preserveHighlight = false) {
    selectedIndexId = id;
    selectedIndexType = type;
    if (!preserveHighlight) {
        searchedKey = null; // Clear highlight when opening or refreshing index normally
    }

    const treePanel = document.getElementById('treePanel');
    const treePanelTitle = document.getElementById('treePanelTitle');
    treePanel.style.display = 'block';
    treePanelTitle.textContent = `Index Tree (${type.toUpperCase()})`;

    document.getElementById('keyInput').value = '';
    document.getElementById('treeStatsText').textContent = 'Loading tree...';

    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${id}/tree`);
        if (!response.ok) {
            document.getElementById('treeStatsText').textContent = 'Failed to load tree';
            return;
        }
        const payload = await response.json();
        renderTree(payload.tree);
    } catch (error) {
        console.error('Error loading tree:', error);
        document.getElementById('treeStatsText').textContent = 'Error loading tree';
    }
}

function renderTree(treeData) {
    console.log('renderTree called with:', treeData);
    
    if (!treeData) {
        document.getElementById('treeStatsText').textContent = 'No tree loaded';
        return;
    }

    // Handle new structure with levels
    if (treeData.levels) {
        console.log('Using levels structure');
        visualizeTreeStructure(treeData);
    } else if (treeData.root) {
        // Handle root property
        console.log('Using root structure');
        visualizeTreeStructure(treeData);
    } else {
        console.log('Empty tree - no levels or root');
        document.getElementById('treeStatsText').textContent = 'Empty tree';
    }
}

function visualizeTreeStructure(treeData) {
    console.log('visualizeTreeStructure called', treeData);
    
    const svg = document.getElementById('treeCanvas');
    if (!svg) {
        console.error('SVG canvas not found!');
        return;
    }
    
    svg.innerHTML = ''; // Clear previous content

    const root = treeData.root || { keys: [], children: [], leaf: true };
    console.log('Root node:', root);
    
    if (!root || !root.keys || root.keys.length === 0) {
        console.log('Empty tree detected');
        document.getElementById('treeStatsText').textContent = '📭 Empty tree - Insert keys to see structure';
        svg.parentElement.style.minHeight = '100px';
        return;
    }

    console.log('Tree has', root.keys.length, 'keys at root');

    // Calculate tree dimensions
    const nodeWidth = 80;
    const nodeHeight = 50;
    const verticalGap = 100;
    const horizontalGap = 20;

    const nodes = [];
    const lines = [];

    function calculatePositions(node, depth = 0, position = 0, totalWidth = 1000) {
        if (!node) return;

        const x = position + totalWidth / 2;
        const y = depth * verticalGap + 30;

        nodes.push({
            keys: node.keys || [],
            x: x,
            y: y,
            leaf: node.leaf,
            children: node.children ? node.children.length : 0
        });

        // Calculate child positions
        if (node.children && node.children.length > 0) {
            const childWidth = totalWidth / Math.max(node.children.length, 1);
            let childPosition = position;

            node.children.forEach((child, index) => {
                const childX = childPosition + childWidth / 2;
                const childY = (depth + 1) * verticalGap + 30;

                // Store line information
                lines.push({ x1: x, y1: y + 25, x2: childX, y2: childY - 25 });

                calculatePositions(child, depth + 1, childPosition, childWidth);
                childPosition += childWidth;
            });
        }
    }

    calculatePositions(root);

    console.log('Nodes calculated:', nodes.length);
    
    if (nodes.length === 0) {
        console.log('No nodes after calculation');
        document.getElementById('treeStatsText').textContent = '📭 Empty tree';
        return;
    }

    // Set SVG dimensions based on tree depth
    const maxDepth = calculateTreeDepth(root);
    const svgHeight = Math.max(300, (maxDepth + 1) * verticalGap + 80);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('width', '100%');

    // Calculate SVG viewBox to fit all nodes
    let minX = nodes[0].x, maxX = nodes[0].x;
    nodes.forEach(node => {
        minX = Math.min(minX, node.x - 60);
        maxX = Math.max(maxX, node.x + 60);
    });
    const viewBoxWidth = maxX - minX + 40;
    svg.setAttribute('viewBox', `${minX - 20} 0 ${viewBoxWidth} ${svgHeight}`);

    console.log('Drawing', lines.length, 'lines and', nodes.length, 'nodes');

    // Draw lines first (so they appear behind nodes)
    lines.forEach(line => {
        const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineEl.setAttribute('x1', line.x1);
        lineEl.setAttribute('y1', line.y1);
        lineEl.setAttribute('x2', line.x2);
        lineEl.setAttribute('y2', line.y2);
        lineEl.setAttribute('class', 'tree-link');
        svg.appendChild(lineEl);
    });

    // Draw nodes
    nodes.forEach((node, idx) => {
        // Check if this node contains the searched key
        const isHighlighted = searchedKey !== null && node.keys.includes(searchedKey);
        
        // Draw rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x - nodeWidth / 2);
        rect.setAttribute('y', node.y - nodeHeight / 2);
        rect.setAttribute('width', nodeWidth + 20);
        rect.setAttribute('height', nodeHeight);
        rect.setAttribute('class', `tree-node-box${isHighlighted ? ' highlighted' : ''}`);
        rect.setAttribute('fill', isHighlighted ? '#0f766e' : (node.leaf ? '#dbeafe' : '#fef3c7'));
        rect.setAttribute('stroke', isHighlighted ? '#047857' : (node.leaf ? '#0284c7' : '#f59e0b'));
        rect.setAttribute('stroke-width', isHighlighted ? '4' : '2');
        rect.setAttribute('rx', '14');
        svg.appendChild(rect);

        // Draw keys text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', `tree-node-text${isHighlighted ? ' highlighted' : ''}`);
        text.textContent = node.keys.join(', ');
        svg.appendChild(text);
    });

    console.log('SVG rendering complete');

    // Update stats
    const stats = treeData;
    document.getElementById('treeStatsText').innerHTML = `
        <strong>📊 Tree Stats:</strong> 
        Total Nodes: ${stats.totalNodes || '?'} | 
        Total Keys: ${stats.totalKeys || '?'} | 
        Depth: ${maxDepth} | 
        Leaf Nodes: <span style="color: #0284c7;">🔵</span>, 
        Internal Nodes: <span style="color: #f59e0b;">🟨</span>
    `;
}

function calculateTreeDepth(node, depth = 0) {
    if (!node || !node.children || node.children.length === 0) {
        return depth;
    }
    return Math.max(...node.children.map(child => calculateTreeDepth(child, depth + 1)));
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
            searchedKey = keyValue;
            // Re-render the tree to highlight the node
            await selectIndex(selectedIndexId, selectedIndexType, true);
            // Clear highlight after 3 seconds
            setTimeout(async () => {
                searchedKey = null;
                await selectIndex(selectedIndexId, selectedIndexType);
            }, 3000);
        } else {
            searchedKey = null;
            await selectIndex(selectedIndexId, selectedIndexType);
        }
    } catch (error) {
        console.error('Search key error:', error);
        alert('Error searching key. Ensure server is running.');
    }
}

// ===== Delete Key =====
async function deleteKey() {
    if (!selectedIndexId) {
        alert('Select an index first');
        return;
    }

    const keyValue = Number(document.getElementById('keyInput').value);
    if (Number.isNaN(keyValue)) {
        alert('Enter a numeric key');
        return;
    }

    if (!confirm(`Delete key ${keyValue}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/indexes/${selectedIndexId}/keys/${keyValue}`, {
            method: 'DELETE'
        });

        const payload = await response.json();
        if (!response.ok) {
            alert(payload.error || 'Delete failed');
            return;
        }

        alert(`✓ Deleted key ${keyValue}`);
        document.getElementById('keyInput').value = '';
        selectIndex(selectedIndexId, selectedIndexType);
        loadIndexes();
    } catch (error) {
        console.error('Delete key error:', error);
        alert('Error deleting key. Ensure server is running.');
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
    editingIndexId = null;
    clearModalError();
    document.getElementById('createIndexForm').reset();
    document.getElementById('charCount').textContent = '0/500 characters';
    document.getElementById('submitBtn').textContent = 'Create Index';
    document.getElementById('createIndexModal').style.display = 'block';
}

function closeModal() {
    editingIndexId = null;
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
